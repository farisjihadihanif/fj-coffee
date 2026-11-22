const {
  products,
  fees,
  MAX_QUANTITY_PER_ITEM,
  MAX_TABLE_NUMBER,
} = require("./catalog");

class OrderError extends Error {}

// Rumus yang sama dipakai di browser (public/src/app.js) supaya angka di
// layar sama dengan yang ditagihkan.
function calculateTotals(subtotal) {
  const tax = Math.round(subtotal * fees.taxRate);
  return { subtotal, tax, total: subtotal + tax };
}

// Ubah isi keranjang dari browser ([{ id, quantity }]) menjadi rincian item
// Midtrans dengan harga dari katalog server.
function buildOrder(cartItems) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new OrderError("Keranjang masih kosong.");
  }
  if (cartItems.length > products.length) {
    throw new OrderError("Isi keranjang tidak valid.");
  }

  const seen = new Set();
  const itemDetails = cartItems.map((cartItem) => {
    const id = Number(cartItem?.id);
    const quantity = Number(cartItem?.quantity);
    const product = products.find((item) => item.id === id);

    if (!product || seen.has(id)) {
      throw new OrderError("Menu di keranjang tidak dikenali.");
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_ITEM) {
      throw new OrderError(
        `Jumlah per menu harus antara 1 dan ${MAX_QUANTITY_PER_ITEM}.`,
      );
    }
    seen.add(id);

    return {
      id: `MENU-${product.id}`,
      name: product.name,
      price: product.price,
      quantity,
    };
  });

  const subtotal = itemDetails.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const totals = calculateTotals(subtotal);

  // Midtrans mewajibkan gross_amount sama dengan jumlah item_details, jadi
  // pajak dikirim sebagai baris item tersendiri.
  if (totals.tax > 0) {
    itemDetails.push({
      id: "TAX",
      name: `Pajak resto ${Math.round(fees.taxRate * 100)}%`,
      price: totals.tax,
      quantity: 1,
    });
  }

  return { itemDetails, ...totals, grossAmount: totals.total };
}

function cleanText(value, maxLength) {
  return String(value ?? "")
    // Sengaja membuang karakter kontrol dari input pemesan.
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f<>]/g, " ")
    .trim()
    .slice(0, maxLength);
}

// Data pemesan: nama dan nomor HP wajib, email opsional. Pesanan bisa makan
// di tempat (wajib nomor meja) atau dibawa pulang.
function validateOrderDetails(input) {
  const name = cleanText(input?.name, 60);
  const email = cleanText(input?.email, 120);
  const phone = cleanText(input?.phone, 20).replace(/[\s-]/g, "");
  const note = cleanText(input?.note, 140);
  const orderType = input?.orderType === "takeaway" ? "takeaway" : "dine-in";

  if (name.length < 2) throw new OrderError("Nama wajib diisi.");
  if (!/^\+?\d{8,15}$/.test(phone)) {
    throw new OrderError("Nomor HP harus 8 sampai 15 digit.");
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new OrderError("Format email tidak valid.");
  }

  let tableNumber = null;
  if (orderType === "dine-in") {
    tableNumber = Number(input?.tableNumber);
    if (!Number.isInteger(tableNumber) || tableNumber < 1 || tableNumber > MAX_TABLE_NUMBER) {
      throw new OrderError(`Nomor meja harus antara 1 dan ${MAX_TABLE_NUMBER}.`);
    }
  }

  return { name, email, phone, note, orderType, tableNumber };
}

module.exports = { buildOrder, calculateTotals, validateOrderDetails, OrderError };
