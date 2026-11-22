const crypto = require("crypto");
const path = require("path");
const express = require("express");
const rateLimit = require("express-rate-limit");

const { categories, products, fees, MAX_TABLE_NUMBER } = require("./catalog");
const { buildOrder, validateOrderDetails, OrderError } = require("./pricing");

const BANK_TRANSFER_BANKS = ["bca", "bni", "bri"];
const ORDER_ID_PATTERN = /^FJC-[A-Z0-9]+-[A-F0-9]{8}$/;
const PAYMENT_EXPIRY_MINUTES = 15;

// Sumber yang boleh dimuat browser. Alpine versi standar mengevaluasi
// ekspresi x-data dengan new Function, jadi butuh 'unsafe-eval'. Gambar QRIS
// datang dari server Midtrans.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' https://unpkg.com https://cdn.jsdelivr.net 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://*.midtrans.com",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

// Bandingkan dua string tanpa membocorkan posisi karakter yang berbeda lewat
// waktu eksekusi. timingSafeEqual melempar error kalau panjangnya beda, jadi
// panjang dicek dulu.
function safeEqual(expected, given) {
  const a = Buffer.from(String(expected));
  const b = Buffer.from(typeof given === "string" ? given : "");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// coreApi: instance midtrans-client CoreApi, atau null kalau key belum diisi.
// trustProxy: jumlah proxy di depan server (mis. 1 di Render/Railway), atau
// false kalau browser terhubung langsung. Kalau salah diisi, alamat IP bisa
// dipalsukan lewat header X-Forwarded-For dan rate limit bisa dilewati.
function createApp({ coreApi, serverKey, isProduction, trustProxy = false }) {
  const app = express();
  const paymentReady = Boolean(coreApi && serverKey);

  app.set("trust proxy", trustProxy);
  app.disable("x-powered-by");

  app.use((req, res, next) => {
    res.set("X-Content-Type-Options", "nosniff");
    res.set("X-Frame-Options", "DENY");
    res.set("Referrer-Policy", "strict-origin-when-cross-origin");
    res.set("Content-Security-Policy", CONTENT_SECURITY_POLICY);
    // HSTS hanya berlaku lewat HTTPS; di localhost (HTTP) tidak dikirim.
    if (req.secure) {
      res.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    next();
  });

  app.use(express.json({ limit: "10kb" }));
  // Hanya folder public yang bisa diakses browser. Kode server dan .env
  // berada di luar folder ini.
  app.use(express.static(path.join(__dirname, "..", "public")));

  function limiter(limit) {
    return rateLimit({
      windowMs: 60 * 1000,
      limit,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      message: { message: "Terlalu banyak percobaan. Coba lagi sebentar lagi." },
    });
  }

  // Batas per IP per menit.
  const paymentLimiter = limiter(10);
  // Browser mengecek status tiap 5 detik (12 kali per menit per order).
  const statusLimiter = limiter(60);
  const cancelLimiter = limiter(10);
  // Notifikasi Midtrans datang dari sedikit IP milik Midtrans dan bisa datang
  // beruntun saat banyak order dibayar bersamaan, jadi batasnya longgar.
  const notificationLimiter = limiter(600);

  // Token ini membuktikan bahwa pemanggil adalah pembuat order, tanpa perlu
  // database: hanya server yang bisa menghitungnya dari orderId.
  function signOrder(orderId) {
    return crypto.createHmac("sha256", serverKey).update(orderId).digest("hex");
  }

  function isValidToken(orderId, token) {
    return safeEqual(signOrder(orderId), token);
  }

  function requirePayment(req, res, next) {
    if (!paymentReady) {
      return res.status(503).json({
        message: "Pembayaran belum dikonfigurasi. Isi key Midtrans di file .env.",
      });
    }
    next();
  }

  function requireOrderAccess(req, res, next) {
    const { orderId } = req.params;
    const token = req.get("x-order-token");
    if (!ORDER_ID_PATTERN.test(orderId) || !isValidToken(orderId, token)) {
      return res.status(403).json({ message: "Order tidak ditemukan." });
    }
    next();
  }

  app.get("/api/config", (req, res) => {
    res.json({ isProduction, paymentReady, fees, maxTableNumber: MAX_TABLE_NUMBER });
  });

  app.get("/api/products", (req, res) => {
    res.json({ categories, products });
  });

  app.post("/api/payment", paymentLimiter, requirePayment, async (req, res) => {
    try {
      const { items, customer, paymentMethod } = req.body || {};
      const order = buildOrder(items);
      const buyer = validateOrderDetails(customer);

      const orderId = `FJC-${Date.now().toString(36).toUpperCase()}-${crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase()}`;

      const parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: order.grossAmount,
        },
        item_details: order.itemDetails,
        customer_details: {
          first_name: buyer.name,
          phone: buyer.phone,
          ...(buyer.email ? { email: buyer.email } : {}),
        },
        // Terlihat di dashboard Midtrans, supaya kasir tahu pesanan ini
        // untuk meja berapa.
        custom_field1:
          buyer.orderType === "dine-in"
            ? `Makan di tempat, meja ${buyer.tableNumber}`
            : "Bawa pulang",
        ...(buyer.note ? { custom_field2: buyer.note } : {}),
        custom_expiry: {
          expiry_duration: PAYMENT_EXPIRY_MINUTES,
          unit: "minute",
        },
      };

      if (paymentMethod === "qris") {
        parameter.payment_type = "qris";
        parameter.qris = { acquirer: "gopay" };
      } else if (paymentMethod === "gopay") {
        parameter.payment_type = "gopay";
      } else if (BANK_TRANSFER_BANKS.includes(paymentMethod)) {
        parameter.payment_type = "bank_transfer";
        parameter.bank_transfer = { bank: paymentMethod };
      } else if (paymentMethod === "mandiri") {
        // Mandiri memakai Bill Payment (echannel), bukan bank_transfer.
        parameter.payment_type = "echannel";
        parameter.echannel = {
          bill_info1: "Pembayaran:",
          bill_info2: "FJ Coffee",
        };
      } else {
        throw new OrderError("Metode pembayaran tidak didukung.");
      }

      const transaction = await coreApi.charge(parameter);
      res.json({
        transaction: normalizeTransaction(transaction),
        token: signOrder(orderId),
        expiresInMinutes: PAYMENT_EXPIRY_MINUTES,
        order: {
          orderType: buyer.orderType,
          tableNumber: buyer.tableNumber,
          subtotal: order.subtotal,
          tax: order.tax,
          total: order.total,
        },
      });
    } catch (error) {
      if (error instanceof OrderError) {
        return res.status(400).json({ message: error.message });
      }
      console.error("Midtrans charge error:", error.message);
      res.status(502).json({ message: "Gagal membuat transaksi. Coba metode lain." });
    }
  });

  app.get(
    "/api/payment/:orderId/status",
    statusLimiter,
    requirePayment,
    requireOrderAccess,
    async (req, res) => {
      try {
        const transaction = await coreApi.transaction.status(req.params.orderId);
        res.json({ transaction: normalizeTransaction(transaction) });
      } catch (error) {
        console.error("Midtrans status error:", error.message);
        res.status(502).json({ message: "Gagal mengecek status pembayaran." });
      }
    },
  );

  app.post(
    "/api/payment/:orderId/cancel",
    cancelLimiter,
    requirePayment,
    requireOrderAccess,
    async (req, res) => {
      try {
        const transaction = await coreApi.transaction.cancel(req.params.orderId);
        res.json({ transaction: normalizeTransaction(transaction) });
      } catch (error) {
        console.error("Midtrans cancel error:", error.message);
        res.status(502).json({ message: "Gagal membatalkan order." });
      }
    },
  );

  // Webhook dari Midtrans. Daftarkan URL ini di dashboard Midtrans:
  // Settings > Payment > Notification URL.
  app.post("/api/midtrans/notification", notificationLimiter, requirePayment, (req, res) => {
    const body = req.body || {};
    const expected = crypto
      .createHash("sha512")
      .update(`${body.order_id}${body.status_code}${body.gross_amount}${serverKey}`)
      .digest("hex");

    if (!safeEqual(expected, body.signature_key)) {
      return res.status(403).json({ message: "Signature tidak valid." });
    }

    // Proyek ini tidak punya database. Kalau nanti ada, simpan status order
    // di sini.
    console.log(
      `Midtrans notification: ${body.order_id} -> ${body.transaction_status}`,
    );
    res.json({ received: true });
  });

  app.use("/api", (req, res) => {
    res.status(404).json({ message: "Endpoint tidak ditemukan." });
  });

  return app;
}

function normalizeTransaction(transaction) {
  if (!transaction || typeof transaction !== "object") {
    throw new Error("Midtrans returned an empty transaction response.");
  }

  const actions = transaction.actions || [];
  const qrAction = actions.find((action) => action.name === "generate-qr-code");
  const deeplinkAction = actions.find(
    (action) => action.name === "deeplink-redirect",
  );

  return {
    orderId: transaction.order_id,
    status: transaction.transaction_status,
    paymentType: transaction.payment_type,
    grossAmount: Number(transaction.gross_amount),
    qrCodeUrl: qrAction?.url || "",
    deeplinkUrl: deeplinkAction?.url || "",
    vaNumber: transaction.va_numbers?.[0]?.va_number || "",
    bank: transaction.va_numbers?.[0]?.bank || "",
    billerCode: transaction.biller_code || "",
    billKey: transaction.bill_key || "",
  };
}

module.exports = { createApp };
