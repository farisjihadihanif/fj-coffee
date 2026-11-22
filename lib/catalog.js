// Katalog menu FJ Coffee. Ini satu-satunya sumber harga: browser hanya
// mengirim id dan jumlah, lalu server menghitung total dari daftar ini.
//
// File ini dibuat oleh tools/build_menu.py bersama ilustrasi di
// public/img/menu/. Untuk mengubah menu, ubah daftar di skrip itu lalu
// jalankan ulang, atau sunting langsung di sini kalau hanya mengganti harga.
// img adalah path di dalam public/img/; ganti dengan foto asli kapan saja.
const categories = [
  { id: "coffee", name: "Kopi" },
  { id: "frappe", name: "Frappe" },
  { id: "non-coffee", name: "Non-kopi" },
  { id: "pastry", name: "Roti & Kue" },
  { id: "main", name: "Makanan Berat" },
  { id: "snack", name: "Camilan" },
  { id: "beans", name: "Biji Kopi" },
];

const products = [
  { id: 101, category: "coffee", name: "Espresso", img: "menu/espresso.svg", price: 18000, description: "Satu shot, pekat dan singkat." },
  { id: 102, category: "coffee", name: "Americano", img: "menu/americano.svg", price: 25000, description: "Espresso dengan air panas atau es." },
  { id: 103, category: "coffee", name: "Cappuccino", img: "menu/cappuccino.svg", price: 32000, description: "Espresso, susu, dan busa tebal." },
  { id: 104, category: "coffee", name: "Caffe Latte", img: "menu/caffe-latte.svg", price: 32000, description: "Espresso dengan susu lembut." },
  { id: 107, category: "coffee", name: "Flat White", img: "menu/flat-white.svg", price: 34000, description: "Dua shot ristretto dengan susu tipis." },
  { id: 108, category: "coffee", name: "Caramel Macchiato", img: "menu/caramel-macchiato.svg", price: 38000, description: "Susu vanila, espresso, dan saus karamel." },
  { id: 109, category: "coffee", name: "Caffe Mocha", img: "menu/caffe-mocha.svg", price: 38000, description: "Espresso, cokelat, dan susu." },
  { id: 110, category: "coffee", name: "Vanilla Latte", img: "menu/vanilla-latte.svg", price: 36000, description: "Latte dengan sirup vanila, panas atau es." },
  { id: 111, category: "coffee", name: "Hazelnut Latte", img: "menu/hazelnut-latte.svg", price: 36000, description: "Latte dengan sirup hazelnut, disajikan dingin." },
  { id: 112, category: "coffee", name: "Cold Brew", img: "menu/cold-brew.svg", price: 30000, description: "Kopi seduh dingin 12 jam." },
  { id: 105, category: "coffee", name: "Kopi Susu Gula Aren", img: "menu/kopi-susu-gula-aren.svg", price: 25000, description: "Es kopi susu dengan gula aren." },
  { id: 106, category: "coffee", name: "V60 Aceh Gayo", img: "menu/v60-aceh-gayo.svg", price: 30000, description: "Seduh manual, disajikan panas." },
  { id: 113, category: "coffee", name: "Affogato", img: "menu/affogato.svg", price: 32000, description: "Es krim vanila disiram espresso." },
  { id: 151, category: "frappe", name: "Caramel Frappe", img: "menu/caramel-frappe.svg", price: 42000, description: "Kopi blended dengan karamel dan krim kocok." },
  { id: 152, category: "frappe", name: "Mocha Frappe", img: "menu/mocha-frappe.svg", price: 42000, description: "Kopi blended dengan cokelat." },
  { id: 153, category: "frappe", name: "Java Chip Frappe", img: "menu/java-chip-frappe.svg", price: 45000, description: "Mocha blended dengan kepingan cokelat." },
  { id: 154, category: "frappe", name: "Matcha Frappe", img: "menu/matcha-frappe.svg", price: 45000, description: "Matcha blended tanpa kopi." },
  { id: 155, category: "frappe", name: "Cookies & Cream Frappe", img: "menu/cookies-and-cream-frappe.svg", price: 45000, description: "Vanila blended dengan remahan biskuit cokelat." },
  { id: 201, category: "non-coffee", name: "Matcha Latte", img: "menu/matcha-latte.svg", price: 35000, description: "Matcha dengan susu, panas atau es." },
  { id: 202, category: "non-coffee", name: "Signature Chocolate", img: "menu/signature-chocolate.svg", price: 35000, description: "Cokelat pekat dengan marshmallow." },
  { id: 204, category: "non-coffee", name: "Red Velvet Latte", img: "menu/red-velvet-latte.svg", price: 35000, description: "Red velvet dengan susu." },
  { id: 205, category: "non-coffee", name: "Taro Latte", img: "menu/taro-latte.svg", price: 33000, description: "Taro dengan susu, disajikan dingin." },
  { id: 206, category: "non-coffee", name: "Chai Tea Latte", img: "menu/chai-tea-latte.svg", price: 33000, description: "Teh rempah dengan susu." },
  { id: 203, category: "non-coffee", name: "Teh Lemon", img: "menu/teh-lemon.svg", price: 22000, description: "Teh hitam dengan perasan lemon." },
  { id: 207, category: "non-coffee", name: "Lychee Tea", img: "menu/lychee-tea.svg", price: 28000, description: "Teh dingin dengan buah leci." },
  { id: 208, category: "non-coffee", name: "Peach Tea", img: "menu/peach-tea.svg", price: 28000, description: "Teh dingin dengan potongan persik." },
  { id: 209, category: "non-coffee", name: "Strawberry Smoothie", img: "menu/strawberry-smoothie.svg", price: 36000, description: "Stroberi, yoghurt, dan susu." },
  { id: 210, category: "non-coffee", name: "Mango Smoothie", img: "menu/mango-smoothie.svg", price: 36000, description: "Mangga, yoghurt, dan susu." },
  { id: 301, category: "pastry", name: "Croissant Butter", img: "menu/croissant-butter.svg", price: 24000, description: "Dipanggang ulang sebelum disajikan." },
  { id: 304, category: "pastry", name: "Almond Croissant", img: "menu/almond-croissant.svg", price: 30000, description: "Croissant isi krim almon." },
  { id: 305, category: "pastry", name: "Cinnamon Roll", img: "menu/cinnamon-roll.svg", price: 28000, description: "Roti gulung kayu manis dengan glasir." },
  { id: 306, category: "pastry", name: "Blueberry Muffin", img: "menu/blueberry-muffin.svg", price: 26000, description: "Muffin dengan blueberry." },
  { id: 307, category: "pastry", name: "Chocolate Chip Cookie", img: "menu/chocolate-chip-cookie.svg", price: 18000, description: "Kukis besar dengan kepingan cokelat." },
  { id: 308, category: "pastry", name: "Donat Cokelat", img: "menu/donat-cokelat.svg", price: 18000, description: "Donat dengan glasir cokelat." },
  { id: 309, category: "pastry", name: "Cheesecake", img: "menu/cheesecake.svg", price: 38000, description: "Satu potong, dengan dasar biskuit." },
  { id: 310, category: "pastry", name: "Chocolate Cake", img: "menu/chocolate-cake.svg", price: 36000, description: "Satu potong kue cokelat berlapis." },
  { id: 311, category: "pastry", name: "Tiramisu", img: "menu/tiramisu.svg", price: 38000, description: "Satu potong, dengan taburan kakao." },
  { id: 312, category: "pastry", name: "Smoked Beef & Cheese Sandwich", img: "menu/smoked-beef-and-cheese-sandwich.svg", price: 38000, description: "Roti panggang isi daging asap dan keju." },
  { id: 302, category: "pastry", name: "Roti Bakar Cokelat Keju", img: "menu/roti-bakar-cokelat-keju.svg", price: 22000, description: "Dua tangkup, potong empat." },
  { id: 401, category: "main", name: "Nasi Goreng Seafood", img: "menu/nasi-goreng-seafood.svg", price: 38000, description: "Nasi goreng dengan udang, cumi, dan telur." },
  { id: 402, category: "main", name: "Nasi Goreng Ayam", img: "menu/nasi-goreng-ayam.svg", price: 32000, description: "Nasi goreng dengan ayam suwir dan telur." },
  { id: 403, category: "main", name: "Nasi Goreng Cabe Hijau", img: "menu/nasi-goreng-cabe-hijau.svg", price: 35000, description: "Nasi goreng pedas dengan cabai hijau." },
  { id: 404, category: "main", name: "Mie Goreng Seafood", img: "menu/mie-goreng-seafood.svg", price: 36000, description: "Mi goreng dengan udang dan cumi." },
  { id: 405, category: "main", name: "Mie Goreng Ayam", img: "menu/mie-goreng-ayam.svg", price: 32000, description: "Mi goreng dengan ayam dan sayuran." },
  { id: 406, category: "main", name: "Kwetiau Goreng Sapi", img: "menu/kwetiau-goreng-sapi.svg", price: 38000, description: "Kwetiau goreng dengan irisan sapi." },
  { id: 407, category: "main", name: "Kwetiau Siram Seafood", img: "menu/kwetiau-siram-seafood.svg", price: 38000, description: "Kwetiau dengan kuah kental seafood." },
  { id: 408, category: "main", name: "Nasi Ayam Mentega", img: "menu/nasi-ayam-mentega.svg", price: 40000, description: "Ayam goreng saus mentega dengan nasi." },
  { id: 409, category: "main", name: "Nasi Ayam Lada Hitam", img: "menu/nasi-ayam-lada-hitam.svg", price: 40000, description: "Ayam saus lada hitam dengan nasi." },
  { id: 410, category: "main", name: "Nasi Sapi Lada Hitam", img: "menu/nasi-sapi-lada-hitam.svg", price: 45000, description: "Sapi saus lada hitam dengan nasi." },
  { id: 411, category: "main", name: "Chicken Cordon Bleu", img: "menu/chicken-cordon-bleu.svg", price: 48000, description: "Ayam isi keju dan daging asap, dengan kentang." },
  { id: 412, category: "main", name: "Nasi Cap Cay Seafood", img: "menu/nasi-cap-cay-seafood.svg", price: 38000, description: "Tumis sayuran dan seafood dengan nasi." },
  { id: 413, category: "main", name: "Sapo Tahu Seafood", img: "menu/sapo-tahu-seafood.svg", price: 40000, description: "Tahu dan seafood dalam kuah kental, disajikan di claypot." },
  { id: 414, category: "main", name: "Nasi Fuyunghai", img: "menu/nasi-fuyunghai.svg", price: 35000, description: "Telur dadar isi dengan saus asam manis." },
  { id: 303, category: "snack", name: "Kentang Goreng", img: "menu/kentang-goreng.svg", price: 22000, description: "Dengan saus sambal dan mayones." },
  { id: 351, category: "snack", name: "Chicken Wings", img: "menu/chicken-wings.svg", price: 32000, description: "Enam potong sayap ayam pedas manis." },
  { id: 352, category: "snack", name: "Onion Rings", img: "menu/onion-rings.svg", price: 24000, description: "Bawang bombai goreng tepung." },
  { id: 353, category: "snack", name: "Pisang Goreng Keju", img: "menu/pisang-goreng-keju.svg", price: 22000, description: "Pisang goreng dengan parutan keju." },
  { id: 1, category: "beans", name: "Robusta Brazil", img: "products/1.jpg", price: 45000, rating: 4.5, description: "Biji kopi 200 g." },
  { id: 2, category: "beans", name: "America Blend", img: "products/2.jpg", price: 75000, rating: 5.0, description: "Biji kopi 200 g." },
  { id: 3, category: "beans", name: "Primo Passo", img: "products/3.jpg", price: 100000, rating: 4.6, description: "Biji kopi 200 g." },
  { id: 4, category: "beans", name: "Aceh Gayo", img: "products/4.jpg", price: 150000, rating: 4.7, description: "Biji kopi 200 g." },
  { id: 5, category: "beans", name: "Sumatra Mandailing", img: "products/5.jpg", price: 90000, rating: 4.3, description: "Biji kopi 200 g." },
];

// Pajak restoran yang ditambahkan ke setiap pesanan.
const fees = { taxRate: 0.1 };

const MAX_QUANTITY_PER_ITEM = 20;
const MAX_TABLE_NUMBER = 30;

module.exports = { categories, products, fees, MAX_QUANTITY_PER_ITEM, MAX_TABLE_NUMBER };
