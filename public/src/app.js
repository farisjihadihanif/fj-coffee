// Konversi angka biasa menjadi format mata uang Rupiah.
const rupiah = (number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);

// Membuat function rupiah dapat dipanggil dari expression AlpineJS di HTML.
window.rupiah = rupiah;

// Rating dengan koma desimal, misalnya 4,6.
const ratingText = (rating) =>
  Number(rating).toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
window.ratingText = ratingText;

// Bagian bintang ke-n (1-5) yang terisi, 0 sampai 1.
window.starFill = (rating, star) => Math.max(0, Math.min(1, rating - star + 1));

// Jalankan pendaftaran data setelah AlpineJS selesai dimuat.
document.addEventListener("alpine:init", () => {
  // Katalog menu. Datanya diambil dari server (lib/catalog.js) supaya harga
  // di layar selalu sama dengan harga yang ditagihkan.
  Alpine.store("menu", {
    categories: [],
    items: [],
    // Pilihan suhu, ukuran, dan gula untuk menu minuman (lib/catalog.js).
    drinkOptions: null,
    // Kata kunci bisa datang dari halaman lain lewat menu.html?q=...
    query: new URLSearchParams(window.location.search).get("q") || "",
    // Kategori awal bisa dipilih lewat menu.html?kategori=beans.
    activeCategory: new URLSearchParams(window.location.search).get("kategori") || "all",
    status: "loading", // loading | ready | error
    async load() {
      this.status = "loading";
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Gagal memuat menu.");
        const data = await response.json();
        this.categories = data.categories;
        this.items = data.products;
        this.drinkOptions = data.drinkOptions;
        if (!this.categories.some((category) => category.id === this.activeCategory)) {
          this.activeCategory = "all";
        }
        this.status = "ready";
        Alpine.store("cart").syncWithCatalog(this.items);
      } catch (error) {
        this.status = "error";
      }
    },
    matches(item) {
      const query = this.query.trim().toLowerCase();
      return !query || item.name.toLowerCase().includes(query);
    },
    // Semua menu, termasuk biji kopi, dikelompokkan per kategori.
    get groups() {
      return this.categories
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
    // Pilihan bawaan minuman: es kalau tersedia, Regular, gula normal.
    defaultOptions(product) {
      if (!product?.options || !this.drinkOptions) return null;
      const temps = product.options.temperature;
      return {
        temperature: temps.includes("iced") ? "iced" : temps[0],
        size: this.drinkOptions.size.choices[0].id,
        sugar: this.drinkOptions.sugar.choices[0].id,
      };
    },
    choice(group, id) {
      return this.drinkOptions?.[group]?.choices.find((item) => item.id === id);
    },
    // true kalau pilihan dari keranjang lama masih ada di katalog.
    validOptions(product, options) {
      return Boolean(
        options &&
          product.options.temperature.includes(options.temperature) &&
          this.choice("temperature", options.temperature) &&
          this.choice("size", options.size) &&
          this.choice("sugar", options.sugar),
      );
    },
    // Harga satu gelas: harga dasar ditambah selisih ukuran.
    unitPrice(product, options) {
      return product.price + (options ? this.choice("size", options.size)?.price || 0 : 0);
    },
    // Contoh: "Es, Large, Kurang manis".
    optionsLabel(options) {
      if (!options) return "";
      return ["temperature", "size", "sugar"]
        .map((group) => this.choice(group, options[group])?.name)
        .filter(Boolean)
        .join(", ");
    },
    get beans() {
      return this.items.filter(
        (item) => item.category === "beans" && this.matches(item),
      );
    },
    // Sembilan biji kopi pertama untuk halaman utama (grid 3x3).
    get featuredBeans() {
      return this.beans.slice(0, 9);
    },
  });

  // Pengaturan dari server: mode Midtrans dan besaran pajak.
  Alpine.store("config", {
    isProduction: true,
    paymentReady: true,
    taxRate: 0.1,
    maxTableNumber: 30,
    maxQuantityPerItem: 20,
    async load() {
      try {
        const response = await fetch("/api/config");
        if (!response.ok) return;
        const data = await response.json();
        this.isProduction = data.isProduction;
        this.paymentReady = data.paymentReady;
        this.taxRate = data.fees.taxRate;
        this.maxTableNumber = data.maxTableNumber;
        this.maxQuantityPerItem = data.maxQuantityPerItem;
      } catch (error) {
        // Biarkan nilai bawaan; server tetap menghitung ulang saat checkout.
      }
    },
  });

  // Store global untuk menyimpan isi keranjang.
  // Isinya disimpan di localStorage supaya tidak hilang saat pindah halaman.
  const CART_KEY = "fj-coffee-cart";
  let savedCart;
  try {
    savedCart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (error) {
    savedCart = [];
  }

  // Satu baris keranjang = satu menu dengan satu kombinasi pilihan. Minuman
  // yang sama dengan suhu, ukuran, atau gula berbeda menjadi baris terpisah.
  const lineKey = (id, options) =>
    options ? `${id}-${options.temperature}-${options.size}-${options.sugar}` : String(id);

  Alpine.store("cart", {
    // Keranjang lama belum punya key; syncWithCatalog melengkapi pilihannya.
    items: (Array.isArray(savedCart) ? savedCart : [])
      .filter((item) => item && typeof item === "object")
      .map((item) => ({ ...item, key: item.key || lineKey(item.id, item.options) })),
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
    // Keranjang dari localStorage bisa berisi harga lama atau menu yang sudah
    // dihapus. Samakan dengan katalog server setiap kali katalog dimuat.
    // Keranjang lama (sebelum ada pilihan minuman) mendapat pilihan bawaan.
    syncWithCatalog(products) {
      const menu = Alpine.store("menu");
      const max = Alpine.store("config").maxQuantityPerItem;
      const removed = [];
      const lines = [];
      for (const cartItem of this.items) {
        const product = products.find((item) => item.id === cartItem.id);
        if (!product) {
          removed.push(cartItem.name);
          continue;
        }
        const options = product.options
          ? menu.validOptions(product, cartItem.options)
            ? { ...cartItem.options }
            : menu.defaultOptions(product)
          : null;
        const key = lineKey(product.id, options);
        const quantity = Number(cartItem.quantity) || 1;
        const existing = lines.find((line) => line.key === key);
        if (existing) {
          existing.quantity = Math.min(existing.quantity + quantity, max);
          continue;
        }
        lines.push({
          key,
          id: product.id,
          name: product.name,
          img: product.img || "",
          options,
          price: menu.unitPrice(product, options),
          quantity: Math.min(quantity, max),
        });
      }
      this.items = lines;
      this.save();
      if (removed.length) {
        window.dispatchEvent(new CustomEvent("cart:items-removed", { detail: removed }));
      }
    },
    // Jumlah satu menu di semua barisnya (untuk lencana di kartu menu).
    quantityOf(id) {
      return this.items
        .filter((item) => item.id === id)
        .reduce((sum, item) => sum + item.quantity, 0);
    },
    // Tambah satu: dari baris keranjang (punya key) atau dari menu katalog
    // dengan pilihan tertentu. Minuman tanpa pilihan memakai pilihan bawaan.
    // Batasnya dari server (MAX_QUANTITY_PER_ITEM di lib/catalog.js).
    add(newItem, options) {
      const max = Alpine.store("config").maxQuantityPerItem;
      if (newItem.key) {
        const line = this.items.find((item) => item.key === newItem.key);
        if (line && line.quantity < max) line.quantity++;
        this.save();
        return;
      }

      const menu = Alpine.store("menu");
      const chosen = newItem.options ? options || menu.defaultOptions(newItem) : null;
      const key = lineKey(newItem.id, chosen);
      const line = this.items.find((item) => item.key === key);
      if (!line) {
        this.items.push({
          key,
          id: newItem.id,
          name: newItem.name,
          img: newItem.img || "",
          options: chosen,
          price: menu.unitPrice(newItem, chosen),
          quantity: 1,
        });
      } else if (line.quantity < max) {
        line.quantity++;
      }
      this.save();
    },
    // Kurangi satu quantity. Jika tinggal satu, hapus dari keranjang.
    remove(key) {
      const cartItem = this.items.find((item) => item.key === key);
      if (!cartItem) return;
      if (cartItem.quantity > 1) {
        cartItem.quantity--;
        this.save();
      } else {
        this.removeAll(key);
      }
    },
    removeAll(key) {
      this.items = this.items.filter((item) => item.key !== key);
      this.save();
    },
    clear() {
      this.items = [];
      this.save();
    },
  });

  // Pop-up mode demo: tampil sekali saat halaman pertama dibuka. Setelah
  // ditutup, hanya chip "Demo" yang tersisa sampai sesi browser berakhir.
  const DEMO_CLOSED_KEY = "fj-coffee-demo-closed";
  let demoClosed = false;
  try {
    demoClosed = sessionStorage.getItem(DEMO_CLOSED_KEY) === "1";
  } catch (error) {
    // sessionStorage diblokir: anggap pop-up belum pernah ditutup.
  }

  Alpine.store("demoNotice", {
    open: !demoClosed,
    close() {
      this.open = false;
      try {
        sessionStorage.setItem(DEMO_CLOSED_KEY, "1");
      } catch (error) {
        // Tanpa sessionStorage, pop-up muncul lagi di halaman berikutnya.
      }
    },
    show() {
      this.open = true;
    },
  });

  // Dropdown kategori di halaman menu (pola listbox WAI-ARIA). Fokus tetap di
  // daftar; opsi yang sedang ditunjuk ditandai lewat aria-activedescendant.
  Alpine.data("categorySelect", () => ({
    open: false,
    active: 0,
    get options() {
      const menu = Alpine.store("menu");
      const count = (id) =>
        menu.items.filter((item) => item.category === id && menu.matches(item)).length;
      const categories = menu.categories;
      return [
        {
          id: "all",
          name: "Semua",
          count: categories.reduce((sum, category) => sum + count(category.id), 0),
        },
        ...categories.map((category) => ({ ...category, count: count(category.id) })),
      ];
    },
    get selected() {
      const id = Alpine.store("menu").activeCategory;
      return this.options.find((option) => option.id === id) || this.options[0];
    },
    show() {
      this.active = Math.max(0, this.options.indexOf(this.selected));
      this.open = true;
      this.$nextTick(() => {
        this.$refs.list.focus();
        this.scrollActive();
      });
    },
    hide(returnFocus = true) {
      this.open = false;
      if (returnFocus) this.$refs.button.focus();
    },
    toggle() {
      this.open ? this.hide() : this.show();
    },
    choose(index) {
      const option = this.options[index];
      if (option) Alpine.store("menu").activeCategory = option.id;
      this.hide();
    },
    move(step) {
      const last = this.options.length - 1;
      this.active = Math.min(last, Math.max(0, this.active + step));
      this.scrollActive();
    },
    moveTo(index) {
      this.active = index < 0 ? this.options.length - 1 : index;
      this.scrollActive();
    },
    // Ketik huruf pertama untuk lompat ke kategori itu.
    jump(event) {
      if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
      const key = event.key.toLowerCase();
      const count = this.options.length;
      for (let step = 1; step <= count; step++) {
        const index = (this.active + step) % count;
        if (this.options[index].name.toLowerCase().startsWith(key)) {
          this.active = index;
          this.scrollActive();
          return;
        }
      }
    },
    scrollActive() {
      this.$nextTick(() =>
        this.$refs.list.querySelector(`[data-index="${this.active}"]`)?.scrollIntoView({ block: "nearest" }),
      );
    },
  }));

  Alpine.store("menu").load();
  Alpine.store("config").load();
});
