const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

const { createApp } = require("../lib/app");
const { buildOrder, validateOrderDetails } = require("../lib/pricing");

const SERVER_KEY = "SB-Mid-server-test";
const customer = {
  name: "Budi Santoso",
  email: "budi@example.com",
  phone: "081234567890",
  orderType: "dine-in",
  tableNumber: 7,
  note: "Kurangi gula",
};

function mockCoreApi() {
  const calls = { charge: [], status: [], cancel: [] };
  return {
    calls,
    charge: async (parameter) => {
      calls.charge.push(parameter);
      return {
        order_id: parameter.transaction_details.order_id,
        transaction_status: "pending",
        payment_type: parameter.payment_type,
        gross_amount: `${parameter.transaction_details.gross_amount}.00`,
        va_numbers: [{ bank: "bca", va_number: "1234567890" }],
      };
    },
    transaction: {
      status: async (orderId) => {
        calls.status.push(orderId);
        return { order_id: orderId, transaction_status: "settlement" };
      },
      cancel: async (orderId) => {
        calls.cancel.push(orderId);
        return { order_id: orderId, transaction_status: "cancel" };
      },
    },
  };
}

async function withServer(options, run) {
  const app = createApp({ isProduction: false, serverKey: SERVER_KEY, ...options });
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    await run(base);
  } finally {
    server.close();
  }
}

const post = (url, body, headers = {}) =>
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });

test("total dihitung dari katalog server, termasuk pajak resto", () => {
  const order = buildOrder([
    { id: 101, quantity: 2 },
    { id: 301, quantity: 1 },
  ]);
  assert.equal(order.subtotal, 60000);
  assert.equal(order.tax, 6000);
  assert.equal(order.grossAmount, 66000);
  const sum = order.itemDetails.reduce((s, i) => s + i.price * i.quantity, 0);
  assert.equal(sum, order.grossAmount);
});

test("keranjang yang tidak valid ditolak", () => {
  assert.throws(() => buildOrder([]));
  assert.throws(() => buildOrder([{ id: 99, quantity: 1 }]));
  assert.throws(() => buildOrder([{ id: 1, quantity: 0 }]));
  assert.throws(() => buildOrder([{ id: 1, quantity: 1.5 }]));
  assert.throws(() => buildOrder([{ id: 1, quantity: 21 }]));
  assert.throws(() => buildOrder([{ id: 1, quantity: 1 }, { id: 1, quantity: 1 }]));
});

test("data pelanggan divalidasi", () => {
  assert.equal(validateOrderDetails(customer).tableNumber, 7);
  assert.equal(validateOrderDetails({ ...customer, email: "" }).email, "");
  assert.equal(
    validateOrderDetails({ ...customer, orderType: "takeaway", tableNumber: "" }).tableNumber,
    null,
  );
  assert.throws(() => validateOrderDetails({ ...customer, email: "bukan-email" }));
  assert.throws(() => validateOrderDetails({ ...customer, phone: "abc" }));
  assert.throws(() => validateOrderDetails({ ...customer, name: "" }));
  assert.throws(() => validateOrderDetails({ ...customer, tableNumber: 0 }));
  assert.throws(() => validateOrderDetails({ ...customer, tableNumber: 99 }));
});

test("harga dari browser diabaikan", async () => {
  const coreApi = mockCoreApi();
  await withServer({ coreApi }, async (base) => {
    const res = await post(`${base}/api/payment`, {
      items: [{ id: 4, quantity: 1, price: 1, name: "Gratis" }],
      customer,
      paymentMethod: "bca",
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    const sent = coreApi.calls.charge[0];
    assert.equal(sent.item_details[0].price, 150000);
    assert.equal(sent.transaction_details.gross_amount, 165000);
    assert.equal(body.transaction.grossAmount, 165000);
    assert.equal(sent.custom_field1, "Makan di tempat, meja 7");
    assert.match(body.transaction.orderId, /^FJC-[A-Z0-9]+-[A-F0-9]{8}$/);
    assert.equal(body.transaction.vaNumber, "1234567890");
  });
});

test("Mandiri dikirim sebagai echannel", async () => {
  const coreApi = mockCoreApi();
  await withServer({ coreApi }, async (base) => {
    await post(`${base}/api/payment`, {
      items: [{ id: 1, quantity: 1 }],
      customer,
      paymentMethod: "mandiri",
    });
    assert.equal(coreApi.calls.charge[0].payment_type, "echannel");
  });
});

test("metode pembayaran tak dikenal ditolak", async () => {
  await withServer({ coreApi: mockCoreApi() }, async (base) => {
    const res = await post(`${base}/api/payment`, {
      items: [{ id: 1, quantity: 1 }],
      customer,
      paymentMethod: "bitcoin",
    });
    assert.equal(res.status, 400);
  });
});

test("status dan cancel butuh token order", async () => {
  const coreApi = mockCoreApi();
  await withServer({ coreApi }, async (base) => {
    const created = await (
      await post(`${base}/api/payment`, {
        items: [{ id: 2, quantity: 1 }],
        customer,
        paymentMethod: "qris",
      })
    ).json();
    const { orderId } = created.transaction;

    const noToken = await fetch(`${base}/api/payment/${orderId}/status`);
    assert.equal(noToken.status, 403);

    const wrong = await post(`${base}/api/payment/${orderId}/cancel`, {}, {
      "x-order-token": "0".repeat(64),
    });
    assert.equal(wrong.status, 403);
    assert.equal(coreApi.calls.cancel.length, 0);

    const ok = await fetch(`${base}/api/payment/${orderId}/status`, {
      headers: { "x-order-token": created.token },
    });
    assert.equal(ok.status, 200);
    assert.equal((await ok.json()).transaction.status, "settlement");

    const cancelled = await post(`${base}/api/payment/${orderId}/cancel`, {}, {
      "x-order-token": created.token,
    });
    assert.equal(cancelled.status, 200);
  });
});

test("webhook menolak signature palsu dan menerima yang benar", async () => {
  await withServer({ coreApi: mockCoreApi() }, async (base) => {
    const payload = {
      order_id: "FJC-ABC-12345678",
      status_code: "200",
      gross_amount: "186480.00",
      transaction_status: "settlement",
    };
    const bad = await post(`${base}/api/midtrans/notification`, {
      ...payload,
      signature_key: "palsu",
    });
    assert.equal(bad.status, 403);

    const signature = crypto
      .createHash("sha512")
      .update(`${payload.order_id}${payload.status_code}${payload.gross_amount}${SERVER_KEY}`)
      .digest("hex");
    const good = await post(`${base}/api/midtrans/notification`, {
      ...payload,
      signature_key: signature,
    });
    assert.equal(good.status, 200);
  });
});

test("webhook tidak error untuk signature dengan panjang atau tipe aneh", async () => {
  await withServer({ coreApi: mockCoreApi() }, async (base) => {
    const payload = { order_id: "FJC-ABC-12345678", status_code: "200", gross_amount: "1.00" };
    for (const signature_key of ["", "a".repeat(127), "a".repeat(129), "ü".repeat(64), 12345, null, ["x"], { a: 1 }]) {
      const res = await post(`${base}/api/midtrans/notification`, { ...payload, signature_key });
      assert.equal(res.status, 403, JSON.stringify(signature_key));
    }
  });
});

test("webhook menerima burst notifikasi Midtrans tanpa 429", async () => {
  await withServer({ coreApi: mockCoreApi() }, async (base) => {
    const payload = { order_id: "FJC-ABC-12345678", status_code: "200", gross_amount: "1.00" };
    const signature_key = crypto
      .createHash("sha512")
      .update(`${payload.order_id}${payload.status_code}${payload.gross_amount}${SERVER_KEY}`)
      .digest("hex");
    const results = await Promise.all(
      Array.from({ length: 100 }, () =>
        post(`${base}/api/midtrans/notification`, { ...payload, signature_key }),
      ),
    );
    assert.ok(results.every((res) => res.status === 200));
  });
});

test("status dan cancel dibatasi rate limit", async () => {
  await withServer({ coreApi: mockCoreApi() }, async (base) => {
    const url = `${base}/api/payment/FJC-ABC-12345678`;
    const statuses = [];
    for (let i = 0; i < 61; i++) statuses.push((await fetch(`${url}/status`)).status);
    assert.ok(statuses.slice(0, 60).every((s) => s === 403));
    assert.equal(statuses[60], 429);

    const cancels = [];
    for (let i = 0; i < 11; i++) cancels.push((await post(`${url}/cancel`, {})).status);
    assert.equal(cancels[10], 429);
  });
});

test("X-Forwarded-For palsu tidak bisa melewati rate limit", async () => {
  await withServer({ coreApi: mockCoreApi() }, async (base) => {
    const statuses = [];
    for (let i = 0; i < 11; i++) {
      const res = await post(
        `${base}/api/payment`,
        { items: [], customer, paymentMethod: "bca" },
        { "X-Forwarded-For": `203.0.113.${i}` },
      );
      statuses.push(res.status);
    }
    assert.equal(statuses[10], 429);
  });
});

test("header keamanan dikirim, HSTS hanya lewat HTTPS", async () => {
  await withServer({ coreApi: mockCoreApi() }, async (base) => {
    const res = await fetch(`${base}/`);
    const csp = res.headers.get("content-security-policy");
    assert.match(csp, /default-src 'self'/);
    assert.match(csp, /frame-ancestors 'none'/);
    assert.equal(res.headers.get("strict-transport-security"), null);
  });
  await withServer({ coreApi: mockCoreApi(), trustProxy: 1 }, async (base) => {
    const res = await fetch(`${base}/`, { headers: { "X-Forwarded-Proto": "https" } });
    assert.match(res.headers.get("strict-transport-security"), /max-age=31536000/);
  });
});

test("halaman tidak punya inline script dan CDN dikunci dengan SRI", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  for (const page of ["index.html", "menu.html"]) {
    const html = fs.readFileSync(path.join(__dirname, "..", "public", page), "utf8");
    assert.doesNotMatch(html, /<script>/, page);
    for (const tag of html.match(/<script[^>]*src="https:[^>]*>/g)) {
      assert.match(tag, /integrity="sha384-/, `${page}: ${tag}`);
      assert.doesNotMatch(tag, /@\d+\.x|unpkg\.com\/feather-icons"/, `${page}: ${tag}`);
    }
  }
});

test("tanpa key Midtrans, situs tetap jalan dan checkout menjawab 503", async () => {
  await withServer({ coreApi: null, serverKey: "" }, async (base) => {
    const config = await (await fetch(`${base}/api/config`)).json();
    assert.equal(config.paymentReady, false);
    const products = await (await fetch(`${base}/api/products`)).json();
    assert.equal(products.products.length, 62);
    assert.equal(products.categories.length, 7);
    const res = await post(`${base}/api/payment`, {
      items: [{ id: 1, quantity: 1 }],
      customer,
      paymentMethod: "bca",
    });
    assert.equal(res.status, 503);
  });
});

test("setiap menu punya gambar yang benar-benar ada", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const { products } = require("../lib/catalog");
  for (const product of products.filter((item) => item.category !== "beans")) {
    const file = path.join(__dirname, "..", "public", "img", product.img);
    assert.ok(fs.existsSync(file), `gambar hilang: ${product.img}`);
  }
});

test("file server tidak bisa diunduh lewat browser", async () => {
  await withServer({ coreApi: mockCoreApi() }, async (base) => {
    for (const file of ["/server.js", "/.env", "/package.json", "/lib/app.js"]) {
      const res = await fetch(base + file);
      assert.equal(res.status, 404, file);
    }
    const home = await fetch(base + "/");
    assert.equal(home.status, 200);
  });
});
