// Konversi angka biasa menjadi format mata uang Rupiah.
const rupiah = (number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);

// Membuat function rupiah dapat dipanggil dari expression AlpineJS di HTML.
window.rupiah = rupiah;

// Jalankan pendaftaran data setelah AlpineJS selesai dimuat.
document.addEventListener("alpine:init", () => {
  // Katalog menu. Datanya diambil dari server (lib/catalog.js) supaya harga
  // di layar selalu sama dengan harga yang ditagihkan.
  Alpine.store("menu", {
    categories: [],
    items: [],
    // Kata kunci bisa datang dari halaman lain lewat menu.html?q=...
    query: new URLSearchParams(window.location.search).get("q") || "",
    activeCategory: "all",
    status: "loading", // loading | ready | error
    async load() {
      this.status = "loading";
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Gagal memuat menu.");
        const data = await response.json();
        this.categories = data.categories;
        this.items = data.products;
        this.status = "ready";
      } catch (error) {
        this.status = "error";
      }
    },
    matches(item) {
      const query = this.query.trim().toLowerCase();
      return !query || item.name.toLowerCase().includes(query);
    },
    // Menu minuman dan makanan (semua selain biji kopi), dikelompokkan per kategori.
    get groups() {
      return this.categories
        .filter((category) => category.id !== "beans")
        .filter(
          (category) =>
            this.activeCategory === "all" || this.activeCategory === category.id,
        )
        .map((category) => ({
          ...category,
          items: this.items.filter(
            (item) => item.category === category.id && this.matches(item),
          ),
        }))
        .filter((group) => group.items.length);
    },
    get beans() {
      return this.items.filter(
        (item) => item.category === "beans" && this.matches(item),
      );
    },
  });

  // Pengaturan dari server: mode Midtrans dan besaran pajak.
  Alpine.store("config", {
    isProduction: true,
    paymentReady: true,
    taxRate: 0.1,
    maxTableNumber: 30,
    async load() {
      try {
        const response = await fetch("/api/config");
        if (!response.ok) return;
        const data = await response.json();
        this.isProduction = data.isProduction;
        this.paymentReady = data.paymentReady;
        this.taxRate = data.fees.taxRate;
        this.maxTableNumber = data.maxTableNumber;
      } catch (error) {
        // Biarkan nilai bawaan; server tetap menghitung ulang saat checkout.
      }
    },
  });

  // Store global untuk menyimpan isi keranjang.
  // Isinya disimpan di localStorage supaya tidak hilang saat pindah halaman.
  const CART_KEY = "fj-coffee-cart";
  let savedCart = [];
  try {
    savedCart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (error) {
    savedCart = [];
  }

  Alpine.store("cart", {
    items: Array.isArray(savedCart) ? savedCart : [],
    save() {
      try {
        localStorage.setItem(CART_KEY, JSON.stringify(this.items));
      } catch (error) {
        // Penyimpanan penuh atau diblokir: keranjang tetap jalan di halaman ini.
      }
    },
    get quantity() {
      return this.items.reduce((sum, item) => sum + item.quantity, 0);
    },
    get total() {
      return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    // Rumus yang sama dengan lib/pricing.js di server.
    get tax() {
      return Math.round(this.total * Alpine.store("config").taxRate);
    },
    get grandTotal() {
      return this.total + this.tax;
    },
    quantityOf(id) {
      return this.items.find((item) => item.id === id)?.quantity || 0;
    },
    // Tambahkan menu baru atau tambah quantity jika sudah ada (maksimal 20).
    add(newItem) {
      const cartItem = this.items.find((item) => item.id === newItem.id);
      if (!cartItem) {
        this.items.push({
          id: newItem.id,
          name: newItem.name,
          img: newItem.img || "",
          price: newItem.price,
          quantity: 1,
        });
      } else if (cartItem.quantity < 20) {
        cartItem.quantity++;
      }
      this.save();
    },
    // Kurangi satu quantity. Jika tinggal satu, hapus dari keranjang.
    remove(id) {
      const cartItem = this.items.find((item) => item.id === id);
      if (!cartItem) return;
      if (cartItem.quantity > 1) {
        cartItem.quantity--;
        this.save();
      } else {
        this.removeAll(id);
      }
    },
    removeAll(id) {
      this.items = this.items.filter((item) => item.id !== id);
      this.save();
    },
    clear() {
      this.items = [];
      this.save();
    },
  });

  Alpine.store("menu").load();
  Alpine.store("config").load();
});
