// Animasi: bagian halaman muncul saat digulir, dan tombol keranjang memantul
// saat menu ditambah. Gayanya ada di bagian "Animasi" di css/style.css.
// Tanpa JS, atau kalau pengguna memilih mengurangi animasi, semua isi langsung
// tampil.
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Elemen yang muncul saat digulir. up: naik 20px; side: masuk dari kiri;
  // item: anggota daftar, naik bergantian.
  const REVEALS = [
    [".about h2, .products h2, .products > p, .contact h2, .contact > p", "up"],
    [".about .content, .menu-group h2, .credits section h2", "up"],
    [".about-img", "side"],
    [".product-card-wrapper, .menu-tile, .credits li", "item"],
  ];
  const STAGGER_MS = 80;
  const STAGGER_TOTAL_MS = 500;
  const SELECTOR = REVEALS.map(([selector]) => selector).join(", ");

  const registered = new WeakSet();
  // Pencarian dan filter kategori membuat ulang kartu. Kunci ini menjaga
  // supaya kartu yang sudah pernah muncul tidak dianimasikan lagi.
  const shown = new Set();
  const keyOf = (el) => {
    const tagged = el.querySelector("[data-product-id], [data-detail-id]");
    if (tagged) return `item-${tagged.dataset.productId || tagged.dataset.detailId}`;
    return el.matches(".menu-group h2") ? `group-${el.textContent}` : null;
  };

  const markShown = (el) => {
    const key = keyOf(el);
    if (key) shown.add(key);
  };

  const finish = (e) => {
    const el = e.currentTarget;
    if (e.target !== el) return;
    el.removeEventListener("animationend", finish);
    el.classList.remove("reveal", "reveal-side", "reveal-in");
    el.style.removeProperty("--reveal-delay");
  };

  function startReveals() {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target);
        const items = visible.filter((el) => el.dataset.reveal === "item");
        const step = Math.min(STAGGER_MS, STAGGER_TOTAL_MS / Math.max(1, items.length - 1));
        items.forEach((el, index) => el.style.setProperty("--reveal-delay", `${Math.round(index * step)}ms`));
        for (const el of visible) {
          observer.unobserve(el);
          markShown(el);
          el.addEventListener("animationend", finish);
          el.classList.add("reveal-in");
        }
      },
      { rootMargin: "0px 0px -40px 0px" },
    );

    // Hanya elemen di bawah layar yang disembunyikan; yang sudah terlihat
    // dibiarkan apa adanya. Semua posisi dibaca dulu, baru kelas dipasang.
    const scan = () => {
      const fresh = [...document.querySelectorAll(SELECTOR)].filter((el) => !registered.has(el));
      const below = fresh.filter((el) => {
        registered.add(el);
        if (shown.has(keyOf(el))) return false;
        if (el.getBoundingClientRect().top >= window.innerHeight) return true;
        markShown(el);
        return false;
      });
      for (const el of below) {
        el.dataset.reveal = REVEALS.find(([selector]) => el.matches(selector))[1];
        el.classList.add("reveal");
        el.classList.toggle("reveal-side", el.dataset.reveal === "side");
        observer.observe(el);
      }
    };
    scan();

    // Kartu dari Alpine baru ada setelah katalog dimuat. Dijalankan sebelum
    // layar digambar, jadi kartu tidak sempat berkedip.
    let frame = 0;
    const watcher = new MutationObserver(() => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        scan();
      });
    });
    document
      .querySelectorAll("#products, #menu")
      .forEach((section) => watcher.observe(section, { childList: true, subtree: true }));
  }

  if (!reduceMotion.matches && "IntersectionObserver" in window) startReveals();

  // Tombol keranjang memantul kecil setiap jumlah isinya bertambah.
  document.addEventListener("alpine:initialized", () => {
    const button = document.querySelector("#shopping-cart-button");
    if (!button?.animate) return;
    const cart = Alpine.store("cart");
    let previous = cart.quantity;
    let bounce = null;
    Alpine.effect(() => {
      const { quantity } = cart;
      const added = quantity > previous;
      previous = quantity;
      if (!added || reduceMotion.matches) return;
      bounce?.cancel();
      bounce = button.animate(
        [
          { transform: "none" },
          { transform: "translateY(-8px) scale(1.12)", offset: 0.3 },
          { transform: "translateY(0) scale(0.95)", offset: 0.6 },
          { transform: "translateY(-2px) scale(1.03)", offset: 0.8 },
          { transform: "none" },
        ],
        { duration: 500, easing: "ease-out" },
      );
    });
  });
})();
