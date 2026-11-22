// Ganti <i data-feather> dengan ikon SVG. Dulu ditulis sebagai inline
// <script> di HTML, dipindah ke sini supaya lolos Content-Security-Policy.
feather.replace();

// ---------- Navbar: menu hamburger, pencarian, keranjang ----------

const navbarNav = document.querySelector(".navbar-nav");
const hamburgerMenu = document.querySelector("#humburger-menu");
const searchForm = document.querySelector(".search-form");
const searchBox = document.querySelector("#search-box");
const searchButton = document.querySelector("#search-button");
const shoppingCart = document.querySelector(".shopping-cart");
const shoppingCartButton = document.querySelector("#shopping-cart-button");

hamburgerMenu.onclick = (e) => {
  e.preventDefault();
  navbarNav.classList.toggle("active");
};

searchButton.onclick = (e) => {
  e.preventDefault();
  searchForm.classList.toggle("active");
  searchBox.focus();
};

// Di halaman menu, pencarian langsung menyaring daftar. Di halaman lain,
// Enter membawa pengguna ke halaman menu dengan kata kunci itu.
const onMenuPage = Boolean(document.querySelector("#menu"));
searchBox.addEventListener("input", () => {
  if (onMenuPage) window.Alpine.store("menu").activeCategory = "all";
});
searchBox.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  e.preventDefault();
  if (onMenuPage) {
    searchForm.classList.remove("active");
  } else {
    window.location.href = `menu.html?q=${encodeURIComponent(searchBox.value.trim())}`;
  }
});

shoppingCartButton.onclick = (e) => {
  e.preventDefault();
  shoppingCart.classList.toggle("active");
};

// Klik di luar elemen menutup panel yang sedang terbuka.
document.addEventListener("click", (e) => {
  if (!hamburgerMenu.contains(e.target) && !navbarNav.contains(e.target)) {
    navbarNav.classList.remove("active");
  }
  if (!searchButton.contains(e.target) && !searchForm.contains(e.target)) {
    searchForm.classList.remove("active");
  }
  if (
    !shoppingCartButton.contains(e.target) &&
    !shoppingCart.contains(e.target) &&
    !e.target.closest("[data-keep-cart]")
  ) {
    shoppingCart.classList.remove("active");
  }
});

// ---------- Modal detail menu ----------

const itemDetailModal = document.querySelector("#item-detail-modal");
if (itemDetailModal) {
  const closeModalButton = itemDetailModal.querySelector(".close-icon");
  const modalImage = itemDetailModal.querySelector(".modal-content img");
  const modalTitle = itemDetailModal.querySelector(".product-content h3");
  const modalDescription = itemDetailModal.querySelector(".product-content p");
  const modalStars = itemDetailModal.querySelector(".product-content .product-stars");
  const modalPrice = itemDetailModal.querySelector(".product-content .product-price");
  const modalAddCartButton = itemDetailModal.querySelector(".modal-add-cart");
  const modalOptions = itemDetailModal.querySelector(".drink-options");
  let modalProduct = null;
  let modalChoice = null;

  // Pilihan minuman sebagai tombol radio per kelompok. Suhu hanya
  // menampilkan yang tersedia untuk menu itu.
  const renderDrinkOptions = () => {
    const menu = window.Alpine.store("menu");
    modalChoice = menu.defaultOptions(modalProduct);
    modalOptions.hidden = !modalChoice;
    if (!modalChoice) {
      modalOptions.innerHTML = "";
      return;
    }
    modalOptions.innerHTML = ["temperature", "size", "sugar"]
      .map((group) => {
        const { label, choices } = menu.drinkOptions[group];
        const available =
          group === "temperature"
            ? choices.filter((item) => modalProduct.options.temperature.includes(item.id))
            : choices;
        const radios = available
          .map(
            (item) => `<label class="option-choice">
              <input type="radio" name="drink-${group}" value="${escapeHtml(item.id)}"${item.id === modalChoice[group] ? " checked" : ""} />
              <span>${escapeHtml(item.name)}${item.price ? ` <small>+${escapeHtml(rupiah(item.price))}</small>` : ""}</span>
            </label>`,
          )
          .join("");
        return `<fieldset class="option-group" data-group="${group}">
            <legend>${escapeHtml(label)}</legend>
            <div class="option-choices">${radios}</div>
          </fieldset>`;
      })
      .join("");
  };

  const updateModalPrice = () => {
    modalPrice.textContent = rupiah(
      window.Alpine.store("menu").unitPrice(modalProduct, modalChoice),
    );
  };

  modalOptions.addEventListener("change", (e) => {
    const group = e.target.closest(".option-group")?.dataset.group;
    if (!group || !modalChoice) return;
    modalChoice[group] = e.target.value;
    updateModalPrice();
  });

  // <dialog> dengan showModal(): Escape, fokus yang terkunci di dalam modal,
  // dan kembalinya fokus ke pemicu ditangani browser.
  const closeModal = () => {
    itemDetailModal.close();
  };

  // Gunakan event delegation karena kartu menu dibuat oleh AlpineJS x-for.
  // Pemicu: elemen dengan data-detail-id (halaman menu) atau tombol mata di
  // kartu biji kopi (halaman utama).
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-detail-id], .item-detail-button");
    if (!trigger) return;
    e.preventDefault();

    const productId = Number(
      trigger.dataset.detailId || trigger.closest(".product-card")?.dataset.productId,
    );
    modalProduct = window.Alpine.store("menu").items.find((item) => item.id === productId);
    if (!modalProduct) return;

    modalImage.src = `img/${modalProduct.img}`;
    modalImage.alt = modalProduct.name;
    modalTitle.textContent = modalProduct.name;
    modalDescription.textContent = modalProduct.description;
    renderDrinkOptions();
    updateModalPrice();

    // Bintang hanya untuk menu yang punya rating.
    const rating = Number(modalProduct.rating) || 0;
    modalStars.hidden = !rating;
    modalStars.setAttribute("aria-label", rating ? `Rating ${window.ratingText(rating)} dari 5` : "");
    modalStars.innerHTML = rating
      ? Array.from({ length: 5 }, (_, index) => {
          const fill = window.starFill(rating, index + 1);
          return `<span class="modal-star" aria-hidden="true">
            <svg viewBox="0 0 24 24" class="modal-star-outline"><use href="img/feather-sprite.svg#star" /></svg>
            <span class="modal-star-fill" style="width: ${fill * 100}%">
              <svg viewBox="0 0 24 24"><use href="img/feather-sprite.svg#star" /></svg>
            </span>
          </span>`;
        }).join("") + `<span class="modal-rating-value" aria-hidden="true">${window.ratingText(rating)}</span>`
      : "";

    itemDetailModal.showModal();
  });

  modalAddCartButton.onclick = (e) => {
    e.preventDefault();
    if (modalProduct) {
      window.Alpine.store("cart").add(modalProduct, modalChoice && { ...modalChoice });
    }
    closeModal();
  };

  closeModalButton.onclick = (e) => {
    e.preventDefault();
    closeModal();
  };

  // Klik di luar kotak modal (latar gelap) menutup modal.
  itemDetailModal.onclick = (e) => {
    if (e.target === itemDetailModal) closeModal();
  };
}

// ---------- Checkout dan pembayaran ----------

const openCheckoutButton = document.querySelector("#open-checkout-button");
const checkoutModal = document.querySelector("#checkout-modal");
const closeCheckoutButton = document.querySelector(".checkout-close");
const checkoutForm = document.querySelector("#checkoutForm");
const tableField = document.querySelector("#table-field");
const tableInput = document.querySelector("#tableNumber");
const paymentNotification = document.querySelector("#payment-notification");
const paymentMethodPanel = document.querySelector("#payment-method-panel");
const paymentMethodList = document.querySelector("#payment-method-list");
const paymentInstruction = document.querySelector("#payment-instruction");
const paymentOrderLabel = document.querySelector("#payment-order-label");
const paymentOrderId = document.querySelector("#payment-order-id");
const copyOrderIdButton = document.querySelector("#copy-order-id-button");
const copyStatus = document.querySelector("#copy-status");
const paymentTotal = document.querySelector("#payment-total");
const changePaymentButton = document.querySelector("#change-payment-button");
const cancelPaymentButton = document.querySelector("#cancel-payment-button");
const orderSuccessPanel = document.querySelector("#order-success-panel");
const orderSuccessText = document.querySelector("#order-success-text");
const orderSuccessClose = document.querySelector("#order-success-close");

// Order yang sedang menunggu pembayaran. token dipakai untuk cek status dan
// membatalkan order; hanya pembuat order yang memilikinya.
let activePayment = { orderId: "", token: "", customer: null };
let paymentStatusTimer;
let notificationTimer;

// Order yang menunggu pembayaran disimpan di localStorage supaya bisa
// dilanjutkan setelah halaman dimuat ulang. Nama, HP, dan email sengaja tidak
// ikut disimpan.
const PENDING_PAYMENT_KEY = "fj-coffee-pending-payment";

function savePendingPayment(transaction, expiresInMinutes) {
  try {
    localStorage.setItem(
      PENDING_PAYMENT_KEY,
      JSON.stringify({
        orderId: activePayment.orderId,
        token: activePayment.token,
        orderType: activePayment.customer.orderType,
        tableNumber: activePayment.customer.tableNumber,
        transaction,
        expiresAt: Date.now() + expiresInMinutes * 60 * 1000,
      }),
    );
  } catch (error) {
    // Penyimpanan diblokir: pembayaran tetap jalan, hanya tidak bisa dilanjutkan
    // setelah reload.
  }
}

function loadPendingPayment() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_PAYMENT_KEY));
  } catch (error) {
    return null;
  }
}

function clearPendingPayment() {
  try {
    localStorage.removeItem(PENDING_PAYMENT_KEY);
  } catch (error) {
    // Tidak ada yang perlu dibersihkan.
  }
}

const FAILED_STATUS_MESSAGES = {
  expire: "Waktu pembayaran habis. Silakan pilih metode pembayaran lagi.",
  cancel: "Order dibatalkan.",
  deny: "Pembayaran ditolak. Silakan coba metode lain.",
  failure: "Pembayaran gagal. Silakan coba metode lain.",
};

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
  );
}

// Modal <dialog> tampil di top layer, di atas semua z-index. Supaya
// notifikasi tetap terlihat, taruh di dalam dialog yang sedang terbuka dan
// kembalikan ke body saat dialog ditutup.
for (const dialog of document.querySelectorAll("dialog")) {
  dialog.addEventListener("close", () => document.body.append(paymentNotification));
  dialog.addEventListener("keydown", (e) => trapFocus(e, dialog));
}

// showModal() mengunci fokus dari isi halaman, tapi Tab masih bisa keluar ke
// bilah alamat browser. Putar fokus kembali ke elemen pertama atau terakhir.
function trapFocus(e, dialog) {
  if (e.key !== "Tab") return;
  const focusable = [
    ...dialog.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ].filter((el) => el.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function showPaymentNotification(message, type) {
  window.clearTimeout(notificationTimer);
  (document.querySelector("dialog[open]") || document.body).append(paymentNotification);
  paymentNotification.textContent = message;
  paymentNotification.className = `payment-notification ${type} visible`;
  notificationTimer = window.setTimeout(() => {
    paymentNotification.classList.remove("visible");
  }, 5000);
}

// Dikirim oleh store cart (src/app.js) saat menu di keranjang sudah tidak
// ada di katalog.
window.addEventListener("cart:items-removed", (e) => {
  showPaymentNotification(
    `${e.detail.join(", ")} sudah tidak tersedia dan dihapus dari keranjang.`,
    "warning",
  );
});

function showPanel(panel) {
  checkoutForm.hidden = panel !== "form";
  paymentMethodPanel.hidden = panel !== "payment";
  orderSuccessPanel.hidden = panel !== "success";
}

function showPaymentMethods() {
  showPanel("payment");
  paymentMethodList.hidden = false;
  paymentInstruction.hidden = true;
  changePaymentButton.hidden = true;
  paymentOrderLabel.hidden = true;
  paymentTotal.textContent = rupiah(window.Alpine.store("cart").grandTotal);
}

function openCheckoutModal() {
  if (!checkoutModal.open) checkoutModal.showModal();
  showPanel("form");
}

function closeCheckoutModal() {
  window.clearInterval(paymentStatusTimer);
  if (checkoutModal.open) checkoutModal.close();
}

openCheckoutButton.onclick = (e) => {
  e.preventDefault();
  if (!window.Alpine.store("cart").items.length) {
    showPaymentNotification("Keranjang masih kosong.", "warning");
    return;
  }
  shoppingCart.classList.remove("active");
  openCheckoutModal();
};

// Tutup lewat tombol X atau klik di luar modal. Order yang masih menunggu
// pembayaran ikut dibatalkan supaya tidak menggantung.
async function dismissCheckout() {
  if (activePayment.orderId) {
    await cancelPayment();
    showPaymentNotification("Order dibatalkan.", "warning");
  }
  closeCheckoutModal();
}

closeCheckoutButton.onclick = dismissCheckout;
checkoutModal.onclick = (e) => {
  if (e.target === checkoutModal) dismissCheckout();
};
// Escape memicu event cancel. Tangani sendiri supaya order yang masih
// menunggu pembayaran ikut dibatalkan, sama seperti tombol X.
checkoutModal.addEventListener("cancel", (e) => {
  e.preventDefault();
  dismissCheckout();
});

// Nomor meja hanya diperlukan untuk makan di tempat.
function syncOrderType() {
  const dineIn = checkoutForm.elements.orderType.value === "dine-in";
  tableField.hidden = !dineIn;
  tableInput.required = dineIn;
}
checkoutForm.addEventListener("change", syncOrderType);
syncOrderType();

checkoutForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(checkoutForm);

  activePayment = {
    orderId: "",
    token: "",
    customer: {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      orderType: formData.get("orderType"),
      tableNumber: formData.get("tableNumber"),
      note: formData.get("note"),
    },
  };

  showPaymentMethods();
});

paymentMethodList.addEventListener("click", (e) => {
  const methodButton = e.target.closest("[data-payment-method]");
  if (methodButton) chargePayment(methodButton.dataset.paymentMethod);
});

async function chargePayment(paymentMethod) {
  paymentMethodList.hidden = true;
  paymentInstruction.hidden = false;
  paymentInstruction.textContent = "Membuat instruksi pembayaran...";

  try {
    const cart = window.Alpine.store("cart");
    const response = await fetch("/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Hanya id, jumlah, dan pilihan minuman yang dikirim; harga dihitung
      // di server.
      body: JSON.stringify({
        items: cart.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          ...(item.options ? { options: item.options } : {}),
        })),
        customer: activePayment.customer,
        paymentMethod,
      }),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Transaksi gagal dibuat.");
    }

    activePayment.orderId = result.transaction.orderId;
    activePayment.token = result.token;
    savePendingPayment(result.transaction, result.expiresInMinutes);
    showActivePayment(result.transaction, result.expiresInMinutes);
  } catch (error) {
    paymentInstruction.textContent = error.message;
    paymentMethodList.hidden = false;
  }
}

// Tampilkan instruksi bayar untuk order aktif lalu cek statusnya berkala.
function showActivePayment(transaction, expiresInMinutes) {
  showPanel("payment");
  paymentMethodList.hidden = true;
  paymentInstruction.hidden = false;
  paymentOrderId.textContent = activePayment.orderId;
  copyOrderIdButton.dataset.copy = activePayment.orderId;
  paymentOrderLabel.hidden = false;
  paymentTotal.textContent = rupiah(transaction.grossAmount);
  renderPaymentInstruction(transaction, expiresInMinutes);
  changePaymentButton.hidden = false;
  startPaymentStatusPolling();
}

// Tombol salin: nilai yang disalin ada di data-copy, nama untuk pembaca
// layar di data-copy-name. Label tombol berubah jadi "Tersalin" sebentar.
function copyButton(value, name, label = "Salin") {
  const srName = label === "Salin" ? `<span class="sr-only"> ${escapeHtml(name)}</span>` : "";
  return `<button type="button" class="copy-button" data-copy="${escapeHtml(value)}" data-copy-name="${escapeHtml(name)}"><span class="copy-button-label">${escapeHtml(label)}</span>${srName}</button>`;
}

function copyField(label, value, name, displayValue = value) {
  return `<div class="copy-field">
      <div class="copy-field-text"><span>${escapeHtml(label)}</span><strong>${escapeHtml(displayValue)}</strong></div>
      ${copyButton(value, name)}
    </div>`;
}

// Jumlah bayar dalam angka saja (242000), sesuai isian simulator dan m-banking.
function amountDigits(amount) {
  return String(Math.round(Number(amount)));
}

function renderPaymentInstruction(transaction, expiresInMinutes) {
  const expiry = `<p class="payment-expiry">Selesaikan pembayaran dalam ${Number(expiresInMinutes)} menit. Halaman ini akan memperbarui statusnya sendiri.</p>`;
  const amountField = copyField(
    "Jumlah tepat",
    amountDigits(transaction.grossAmount),
    "jumlah pembayaran",
    rupiah(transaction.grossAmount),
  );
  let html;

  if (transaction.qrCodeUrl) {
    html = `<h6>Scan QRIS</h6><img src="${escapeHtml(transaction.qrCodeUrl)}" alt="Kode QRIS untuk pembayaran" />
      ${copyButton(transaction.qrCodeUrl, "URL gambar QRIS", "Salin URL gambar QRIS")}`;
    if (transaction.deeplinkUrl) {
      html += `<a href="${escapeHtml(transaction.deeplinkUrl)}" target="_blank" rel="noopener">Buka aplikasi GoPay</a>`;
    }
  } else if (transaction.billKey) {
    html = `<h6>Mandiri Bill Payment</h6>
      ${copyField("Kode perusahaan", transaction.billerCode, "kode perusahaan")}
      ${copyField("Kode pembayaran", transaction.billKey, "kode pembayaran")}
      ${amountField}`;
  } else if (transaction.vaNumber) {
    html = `<h6>${escapeHtml(transaction.bank.toUpperCase())} Virtual Account</h6>
      ${copyField("Nomor VA", transaction.vaNumber, "nomor VA")}
      ${amountField}
      <p>Transfer tepat sebesar jumlah di atas.</p>`;
  } else if (transaction.deeplinkUrl) {
    html = `<h6>GoPay</h6><a href="${escapeHtml(transaction.deeplinkUrl)}" target="_blank" rel="noopener">Buka aplikasi GoPay</a>`;
  } else {
    html = `<p>Order dibuat. Ikuti instruksi dari metode pembayaran yang dipilih.</p>`;
  }

  paymentInstruction.innerHTML = html + expiry;
}

// Salin ke clipboard. Clipboard API hanya ada di konteks aman (HTTPS atau
// localhost); selain itu pakai textarea tersembunyi dan execCommand. Textarea
// ditaruh di dialog yang terbuka supaya bisa dipilih di dalam modal.
async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Lanjut ke cara lama.
    }
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none;";
  (document.querySelector("dialog[open]") || document.body).append(area);
  area.select();
  area.setSelectionRange(0, text.length);
  let copied;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  area.remove();
  return copied;
}

document.addEventListener("click", async (e) => {
  const button = e.target.closest(".copy-button");
  if (!button || !button.dataset.copy) return;
  const label = button.querySelector(".copy-button-label");
  button.dataset.label ??= label.textContent;
  window.clearTimeout(Number(button.dataset.timer));

  const copied = await copyText(button.dataset.copy);
  button.focus();
  label.textContent = copied ? "Tersalin" : "Gagal, salin manual";
  button.classList.toggle("copied", copied);
  const name = button.dataset.copyName.charAt(0).toUpperCase() + button.dataset.copyName.slice(1);
  copyStatus.textContent = copied
    ? `${name} tersalin.`
    : `${name} gagal disalin. Pilih teksnya lalu salin manual.`;
  button.dataset.timer = window.setTimeout(() => {
    label.textContent = button.dataset.label;
    button.classList.remove("copied");
    copyStatus.textContent = "";
  }, 1800);
});

// Status transaksi dari Midtrans, "unknown-order" kalau server menolak token
// order, atau null kalau belum bisa dicek (koneksi putus, server sibuk).
async function fetchPaymentStatus() {
  try {
    const response = await fetch(`/api/payment/${activePayment.orderId}/status`, {
      headers: { "x-order-token": activePayment.token },
    });
    if (response.status === 403) return "unknown-order";
    if (!response.ok) return null;
    return (await response.json()).transaction.status;
  } catch (error) {
    return null;
  }
}

const isPaid = (status) => ["settlement", "capture"].includes(status);

function forgetActivePayment() {
  window.clearInterval(paymentStatusTimer);
  activePayment = { orderId: "", token: "", customer: null };
  clearPendingPayment();
}

function startPaymentStatusPolling() {
  window.clearInterval(paymentStatusTimer);
  paymentStatusTimer = window.setInterval(async () => {
    const status = await fetchPaymentStatus();
    if (isPaid(status)) {
      window.clearInterval(paymentStatusTimer);
      showOrderSuccess();
    } else if (FAILED_STATUS_MESSAGES[status]) {
      forgetActivePayment();
      showPaymentMethods();
      showPaymentNotification(FAILED_STATUS_MESSAGES[status], "error");
    } else if (status === "unknown-order") {
      forgetActivePayment();
      showPaymentMethods();
    }
  }, 5000);
}

// Lanjutkan order yang belum selesai setelah halaman dimuat ulang.
async function resumePendingPayment() {
  const pending = loadPendingPayment();
  if (!pending?.orderId || !pending?.token || !pending?.transaction) {
    clearPendingPayment();
    return;
  }

  activePayment = {
    orderId: pending.orderId,
    token: pending.token,
    customer: { orderType: pending.orderType, tableNumber: pending.tableNumber },
  };

  const status = await fetchPaymentStatus();
  if (isPaid(status)) {
    openCheckoutModal();
    showOrderSuccess();
  } else if (FAILED_STATUS_MESSAGES[status]) {
    forgetActivePayment();
    showPaymentNotification(`Order ${pending.orderId}: ${FAILED_STATUS_MESSAGES[status]}`, "error");
  } else if (status === "unknown-order") {
    forgetActivePayment();
  } else {
    // Masih menunggu pembayaran, atau status belum bisa dicek: tampilkan
    // lagi instruksinya dan terus cek.
    const minutesLeft = Math.max(1, Math.ceil((pending.expiresAt - Date.now()) / 60000));
    openCheckoutModal();
    showActivePayment(pending.transaction, minutesLeft);
  }
}

function showOrderSuccess() {
  const { customer, orderId } = activePayment;
  const destination =
    customer.orderType === "dine-in"
      ? `Pesanan akan kami antar ke meja ${Number(customer.tableNumber)}.`
      : "Tunjukkan nomor order ini di kasir saat mengambil pesanan.";

  orderSuccessText.textContent = `Order ${orderId} sudah dibayar. ${destination}`;
  window.Alpine.store("cart").clear();
  forgetActivePayment();
  checkoutForm.reset();
  syncOrderType();
  showPanel("success");
}

orderSuccessClose.onclick = () => closeCheckoutModal();

changePaymentButton.onclick = async () => {
  await cancelPayment();
  showPaymentMethods();
};

cancelPaymentButton.onclick = async () => {
  const hadOrder = Boolean(activePayment.orderId);
  await cancelPayment();
  closeCheckoutModal();
  if (hadOrder) showPaymentNotification("Order dibatalkan.", "warning");
};

async function cancelPayment() {
  window.clearInterval(paymentStatusTimer);
  const { orderId, token } = activePayment;
  activePayment.orderId = "";
  activePayment.token = "";
  clearPendingPayment();
  if (!orderId) return;

  try {
    await fetch(`/api/payment/${orderId}/cancel`, {
      method: "POST",
      headers: { "x-order-token": token },
    });
  } catch (error) {
    // Order akan kedaluwarsa sendiri di Midtrans kalau pembatalan gagal terkirim.
  }
}

// Alpine dimuat dengan defer, jadi tunggu sampai store-nya siap.
document.addEventListener("alpine:initialized", resumePendingPayment);

// Timeline kontak: garisnya terisi mengikuti scroll, titik menyala saat garis
// sampai, dan kartu muncul satu per satu saat masuk layar. Dilewati kalau
// pengguna memilih mengurangi animasi; garis dan kartu langsung tampil penuh.
(() => {
  const timeline = document.querySelector("[data-timeline]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!timeline || reduceMotion || !("IntersectionObserver" in window)) return;

  const steps = [...timeline.querySelectorAll("[data-reveal]")];
  const dots = steps.map((step) => step.querySelector(".timeline-dot"));
  let frame = 0;

  // Garis terisi sampai titik 60% tinggi layar.
  const update = () => {
    frame = 0;
    const anchor = window.innerHeight * 0.6;
    const rect = timeline.getBoundingClientRect();
    // Garis dimulai 20px dari atas (pusat titik pertama), sama dengan CSS.
    const progress = Math.min(1, Math.max(0, (anchor - rect.top - 20) / (rect.height - 32)));
    timeline.style.setProperty("--progress", progress.toFixed(3));
    dots.forEach((dot, index) => {
      const box = dot.getBoundingClientRect();
      steps[index].classList.toggle("is-reached", box.top + box.height / 2 <= anchor);
    });
  };
  const requestUpdate = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };

  // Langkah yang masuk layar bersamaan tetap muncul bergantian.
  const observer = new IntersectionObserver(
    (entries) => {
      let order = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.style.setProperty("--delay", `${order++ * 0.15}s`);
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.35 },
  );

  document.documentElement.classList.add("timeline-ready");
  steps.forEach((step) => observer.observe(step));
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  update();
})();
