// Katalog menu FJ Coffee. Ini satu-satunya sumber harga: browser hanya
// mengirim id, jumlah, dan pilihan minuman, lalu server menghitung total dari
// daftar ini.
//
// File ini dibuat oleh tools/build_menu.py. Untuk mengubah menu, ubah daftar
// di skrip itu lalu jalankan ulang, atau sunting langsung di sini kalau hanya
// mengganti harga. img adalah path di dalam public/img/; credit berisi
// pemilik foto dan sumbernya (ditampilkan di bagian Kredit Foto). Menu
// minuman punya options.temperature: suhu yang bisa dipilih.
const categories = [
  { id: "signature", name: "Signature" },
  { id: "coffee", name: "Kopi Susu" },
  { id: "black-coffee", name: "Kopi Hitam" },
  { id: "frappe", name: "Frappe" },
  { id: "non-coffee", name: "Non-kopi" },
  { id: "pastry", name: "Roti & Pastry" },
  { id: "dessert", name: "Kue & Dessert" },
  { id: "main", name: "Nasi & Lauk" },
  { id: "noodles", name: "Mie & Pasta" },
  { id: "snack", name: "Camilan" },
  { id: "beans", name: "Biji Kopi" },
];

const products = [
  { id: 105, category: "signature", name: "Kopi Susu Gula Aren", img: "menu/kopi-susu-gula-aren.jpg", price: 25000, description: "Kopi susu dengan gula aren.", options: { temperature: ["hot", "iced"] }, credit: { author: "_magdita", source: "Pixabay", url: "https://pixabay.com/photos/coffee-cafe-lovers-focus-ethiopia-7574762/", license: "Pixabay Content License" } },
  { id: 501, category: "signature", name: "Kopi Susu Jahe", img: "menu/kopi-susu-jahe.jpg", price: 28000, description: "Kopi susu dengan sirup jahe.", options: { temperature: ["hot", "iced"] }, credit: { author: "Pexels", source: "Pixabay", url: "https://pixabay.com/photos/coffee-cup-wallpaper-drink-1839133/", license: "Pixabay Content License" } },
  { id: 502, category: "signature", name: "Butterscotch Latte", img: "menu/butterscotch-latte.jpg", price: 34000, description: "Latte dengan saus butterscotch.", options: { temperature: ["hot", "iced"] }, credit: { author: "Engin_Akyurt", source: "Pixabay", url: "https://pixabay.com/photos/coffee-workspace-cafe-drink-2242213/", license: "Pixabay Content License" } },
  { id: 503, category: "signature", name: "Aren Oat Latte", img: "menu/aren-oat-latte.jpg", price: 32000, description: "Espresso, susu oat, dan gula aren.", options: { temperature: ["hot", "iced"] }, credit: { author: "husien_pro", source: "Pixabay", url: "https://pixabay.com/photos/iced-coffee-cold-drink-coffee-bean-10260387/", license: "Pixabay Content License" } },
  { id: 504, category: "signature", name: "Dalgona Kopi Susu", img: "menu/dalgona-kopi-susu.jpg", price: 32000, description: "Susu dingin dengan krim kopi kocok di atasnya.", options: { temperature: ["iced"] }, credit: { author: "katetrysh", source: "Pixabay", url: "https://pixabay.com/photos/almond-milk-beverage-brown-cafe-8952842/", license: "Pixabay Content License" } },
  { id: 505, category: "signature", name: "Kopi Susu Rum", img: "menu/kopi-susu-rum.jpg", price: 30000, description: "Kopi susu dengan sirup rasa rum, tanpa alkohol.", options: { temperature: ["hot", "iced"] }, credit: { author: "shixugang", source: "Pixabay", url: "https://pixabay.com/photos/coffee-milk-sugar-cup-of-coffee-563797/", license: "Pixabay Content License" } },
  { id: 101, category: "black-coffee", name: "Espresso", img: "menu/espresso.jpg", price: 18000, description: "Satu shot, pekat dan singkat.", options: { temperature: ["hot"] }, credit: { author: "yousafbhutta", source: "Pixabay", url: "https://pixabay.com/photos/coffee-cup-drink-beverage-7292250/", license: "Pixabay Content License" } },
  { id: 102, category: "black-coffee", name: "Americano", img: "menu/americano.jpg", price: 25000, description: "Espresso dengan air.", options: { temperature: ["hot", "iced"] }, credit: { author: "StockSnap", source: "Pixabay", url: "https://pixabay.com/photos/coffee-cafe-hot-mug-cup-white-2589691/", license: "Pixabay Content License" } },
  { id: 103, category: "coffee", name: "Cappuccino", img: "menu/cappuccino.jpg", price: 32000, description: "Espresso, susu, dan busa tebal.", options: { temperature: ["hot", "iced"] }, credit: { author: "gadost0", source: "Pixabay", url: "https://pixabay.com/photos/cappuccino-drink-cup-coffee-756490/", license: "Pixabay Content License" } },
  { id: 104, category: "coffee", name: "Caffe Latte", img: "menu/caffe-latte.jpg", price: 32000, description: "Espresso dengan susu lembut.", options: { temperature: ["hot", "iced"] }, credit: { author: "8618939", source: "Pixabay", url: "https://pixabay.com/photos/coffee-cappuccino-latte-art-6154681/", license: "Pixabay Content License" } },
  { id: 107, category: "coffee", name: "Flat White", img: "menu/flat-white.jpg", price: 34000, description: "Dua shot ristretto dengan susu tipis.", options: { temperature: ["hot", "iced"] }, credit: { author: "pen_ash", source: "Pixabay", url: "https://pixabay.com/photos/coffee-cafe-latte-latte-espresso-7992226/", license: "Pixabay Content License" } },
  { id: 108, category: "coffee", name: "Caramel Macchiato", img: "menu/caramel-macchiato.jpg", price: 38000, description: "Susu vanila, espresso, dan saus karamel.", options: { temperature: ["hot", "iced"] }, credit: { author: "Faixal", source: "Pixabay", url: "https://pixabay.com/photos/aroma-coffee-cup-espresso-658708/", license: "Pixabay Content License" } },
  { id: 109, category: "coffee", name: "Caffe Mocha", img: "menu/caffe-mocha.jpg", price: 38000, description: "Espresso, cokelat, dan susu.", options: { temperature: ["hot", "iced"] }, credit: { author: "freestocks-photos", source: "Pixabay", url: "https://pixabay.com/photos/food-drinks-background-cafe-2940312/", license: "Pixabay Content License" } },
  { id: 110, category: "coffee", name: "Vanilla Latte", img: "menu/vanilla-latte.jpg", price: 36000, description: "Latte dengan sirup vanila.", options: { temperature: ["hot", "iced"] }, credit: { author: "waneshih", source: "Pixabay", url: "https://pixabay.com/photos/coffee-latte-cafe-coffee-shop-food-3677179/", license: "Pixabay Content License" } },
  { id: 111, category: "coffee", name: "Hazelnut Latte", img: "menu/hazelnut-latte.jpg", price: 36000, description: "Latte dengan sirup hazelnut.", options: { temperature: ["hot", "iced"] }, credit: { author: "Kanju", source: "Pixabay", url: "https://pixabay.com/photos/ice-coffee-iced-coffee-coffee-drink-4988704/", license: "Pixabay Content License" } },
  { id: 112, category: "black-coffee", name: "Cold Brew", img: "menu/cold-brew.jpg", price: 30000, description: "Kopi seduh dingin 12 jam.", options: { temperature: ["iced"] }, credit: { author: "4137dutchcafe", source: "Pixabay", url: "https://pixabay.com/photos/dutch-coffee-4137-coffee-2004759/", license: "Pixabay Content License" } },
  { id: 106, category: "black-coffee", name: "V60 Aceh Gayo", img: "menu/v60-aceh-gayo.jpg", price: 30000, description: "Seduh manual dengan V60.", options: { temperature: ["hot"] }, credit: { author: "Kaffeetastisch", source: "Pixabay", url: "https://pixabay.com/photos/filter-coffee-hand-filter-coffee-3767936/", license: "Pixabay Content License" } },
  { id: 113, category: "dessert", name: "Affogato", img: "menu/affogato.jpg", price: 32000, description: "Es krim vanila disiram espresso.", credit: { author: "StockSnap", source: "Pixabay", url: "https://pixabay.com/photos/glass-dessert-food-frozen-cold-2595829/", license: "Pixabay Content License" } },
  { id: 114, category: "black-coffee", name: "Kopi Tubruk", img: "menu/kopi-tubruk.jpg", price: 18000, description: "Kopi bubuk diseduh langsung di cangkir, gaya tradisional.", options: { temperature: ["hot"] }, credit: { author: "cocoparisienne", source: "Pixabay", url: "https://pixabay.com/photos/coffee-coffee-cup-cup-drink-beans-2714970/", license: "Pixabay Content License" } },
  { id: 115, category: "black-coffee", name: "Japanese Iced Coffee", img: "menu/japanese-iced-coffee.jpg", price: 30000, description: "Kopi seduh manual langsung di atas es.", options: { temperature: ["iced"] }, credit: { author: "Brendin_Hoffman", source: "Pixabay", url: "https://pixabay.com/photos/iced-coffee-coffee-beans-drink-5703345/", license: "Pixabay Content License" } },
  { id: 151, category: "frappe", name: "Caramel Frappe", img: "menu/caramel-frappe.jpg", price: 42000, description: "Kopi blended dengan karamel dan krim kocok.", options: { temperature: ["iced"] }, credit: { author: "DilanM", source: "Pixabay", url: "https://pixabay.com/photos/iced-coffee-glass-caramel-straw-10346409/", license: "Pixabay Content License" } },
  { id: 152, category: "frappe", name: "Mocha Frappe", img: "menu/mocha-frappe.jpg", price: 42000, description: "Kopi blended dengan cokelat.", options: { temperature: ["iced"] }, credit: { author: "stupid_systemus", source: "Openverse", url: "https://www.flickr.com/photos/40750945@N06/10986787463", license: "CC BY 2.0" } },
  { id: 153, category: "frappe", name: "Java Chip Frappe", img: "menu/java-chip-frappe.jpg", price: 45000, description: "Mocha blended dengan kepingan cokelat.", options: { temperature: ["iced"] }, credit: { author: "rajdeepcraft", source: "Pixabay", url: "https://pixabay.com/photos/coffee-drink-iced-iced-coffee-5893926/", license: "Pixabay Content License" } },
  { id: 154, category: "frappe", name: "Matcha Frappe", img: "menu/matcha-frappe.jpg", price: 45000, description: "Matcha blended tanpa kopi.", options: { temperature: ["iced"] }, credit: { author: "Coco Kim", source: "Openverse", url: "https://www.flickr.com/photos/78292210@N05/12308408036", license: "CC BY 2.0" } },
  { id: 155, category: "frappe", name: "Cookies & Cream Frappe", img: "menu/cookies-and-cream-frappe.jpg", price: 45000, description: "Vanila blended dengan remahan biskuit cokelat.", options: { temperature: ["iced"] }, credit: { author: "samcepeda", source: "Pixabay", url: "https://pixabay.com/photos/oreo-coffe-breakfast-caf%C3%A9-caffeine-382212/", license: "Pixabay Content License" } },
  { id: 156, category: "frappe", name: "Strawberry Cream Frappe", img: "menu/strawberry-cream-frappe.jpg", price: 42000, description: "Stroberi dan susu blended dengan krim kocok, tanpa kopi.", options: { temperature: ["iced"] }, credit: { author: "RitaE", source: "Pixabay", url: "https://pixabay.com/photos/strawberry-dessert-fruit-berry-3304967/", license: "Pixabay Content License" } },
  { id: 201, category: "non-coffee", name: "Matcha Latte", img: "menu/matcha-latte.jpg", price: 35000, description: "Matcha dengan susu.", options: { temperature: ["hot", "iced"] }, credit: { author: "dungthuyvunguyen", source: "Pixabay", url: "https://pixabay.com/photos/matcha-powder-latte-green-japanese-2356769/", license: "Pixabay Content License" } },
  { id: 202, category: "non-coffee", name: "Signature Chocolate", img: "menu/signature-chocolate.jpg", price: 35000, description: "Cokelat pekat dengan marshmallow.", options: { temperature: ["hot", "iced"] }, credit: { author: "Hollanddesign", source: "Pixabay", url: "https://pixabay.com/photos/hot-cocoa-marshmallows-hot-chocolate-6710083/", license: "Pixabay Content License" } },
  { id: 204, category: "non-coffee", name: "Red Velvet Latte", img: "menu/red-velvet-latte.jpg", price: 35000, description: "Red velvet dengan susu.", options: { temperature: ["hot", "iced"] }, credit: { author: "Radarsmum67", source: "Openverse", url: "https://www.flickr.com/photos/65811939@N00/53951519662", license: "CC BY 2.0" } },
  { id: 205, category: "non-coffee", name: "Taro Latte", img: "menu/taro-latte.jpg", price: 33000, description: "Taro dengan susu.", options: { temperature: ["hot", "iced"] }, credit: { author: "goodiesfirst", source: "Openverse", url: "https://www.flickr.com/photos/49215102@N00/5394359603", license: "CC BY 2.0" } },
  { id: 206, category: "non-coffee", name: "Chai Tea Latte", img: "menu/chai-tea-latte.jpg", price: 33000, description: "Teh rempah dengan susu.", options: { temperature: ["hot", "iced"] }, credit: { author: "grafmex", source: "Pixabay", url: "https://pixabay.com/photos/coffee-drink-hot-cup-cappuccino-3120750/", license: "Pixabay Content License" } },
  { id: 203, category: "non-coffee", name: "Teh Lemon", img: "menu/teh-lemon.jpg", price: 22000, description: "Teh hitam dengan perasan lemon.", options: { temperature: ["hot", "iced"] }, credit: { author: "Pexels", source: "Pixabay", url: "https://pixabay.com/photos/beverage-cold-drink-food-fruit-1850888/", license: "Pixabay Content License" } },
  { id: 207, category: "non-coffee", name: "Lychee Tea", img: "menu/lychee-tea.jpg", price: 28000, description: "Teh dingin dengan buah leci.", options: { temperature: ["iced"] }, credit: { author: "nSeika", source: "Openverse", url: "https://www.flickr.com/photos/33542052@N07/7273647584", license: "CC BY 2.0" } },
  { id: 208, category: "non-coffee", name: "Peach Tea", img: "menu/peach-tea.jpg", price: 28000, description: "Teh dingin dengan potongan persik.", options: { temperature: ["iced"] }, credit: { author: "fernandovillalobos", source: "Pixabay", url: "https://pixabay.com/photos/tea-cold-ice-2220485/", license: "Pixabay Content License" } },
  { id: 209, category: "non-coffee", name: "Strawberry Smoothie", img: "menu/strawberry-smoothie.jpg", price: 36000, description: "Stroberi, yoghurt, dan susu.", options: { temperature: ["iced"] }, credit: { author: "Ajale", source: "Pixabay", url: "https://pixabay.com/photos/smoothie-fruit-a-drink-drink-1444371/", license: "Pixabay Content License" } },
  { id: 210, category: "non-coffee", name: "Mango Smoothie", img: "menu/mango-smoothie.jpg", price: 36000, description: "Mangga, yoghurt, dan susu.", options: { temperature: ["iced"] }, credit: { author: "tehzeebhud", source: "Pixabay", url: "https://pixabay.com/photos/mango-smoothie-glass-straw-10449416/", license: "Pixabay Content License" } },
  { id: 301, category: "pastry", name: "Croissant Butter", img: "menu/croissant-butter.jpg", price: 24000, description: "Dipanggang ulang sebelum disajikan.", credit: { author: "PublicDomainPictures", source: "Pixabay", url: "https://pixabay.com/photos/bread-croissant-food-breakfast-cup-18987/", license: "Pixabay Content License" } },
  { id: 304, category: "pastry", name: "Almond Croissant", img: "menu/almond-croissant.jpg", price: 30000, description: "Croissant isi krim almon.", credit: { author: "tehzeebkazmii", source: "Pixabay", url: "https://pixabay.com/photos/croissant-almond-croissant-pastry-10455235/", license: "Pixabay Content License" } },
  { id: 305, category: "pastry", name: "Cinnamon Roll", img: "menu/cinnamon-roll.jpg", price: 28000, description: "Roti gulung kayu manis dengan glasir.", credit: { author: "TastyLens", source: "Pixabay", url: "https://pixabay.com/photos/food-sweet-dessert-pastry-bun-8385524/", license: "Pixabay Content License" } },
  { id: 306, category: "dessert", name: "Blueberry Muffin", img: "menu/blueberry-muffin.jpg", price: 26000, description: "Muffin dengan blueberry.", credit: { author: "tehzeebkazmii", source: "Pixabay", url: "https://pixabay.com/photos/muffin-blueberry-sugar-pastry-food-10346608/", license: "Pixabay Content License" } },
  { id: 307, category: "dessert", name: "Chocolate Chip Cookie", img: "menu/chocolate-chip-cookie.jpg", price: 18000, description: "Kukis besar dengan kepingan cokelat.", credit: { author: "StevenGiacomelli", source: "Pixabay", url: "https://pixabay.com/photos/cookie-chocolate-chip-cookie-snack-1264231/", license: "Pixabay Content License" } },
  { id: 308, category: "pastry", name: "Donat Cokelat", img: "menu/donat-cokelat.jpg", price: 18000, description: "Donat dengan glasir cokelat.", credit: { author: "ThorstenF", source: "Pixabay", url: "https://pixabay.com/photos/donuts-donut-pancakes-mini-berlin-4196093/", license: "Pixabay Content License" } },
  { id: 309, category: "dessert", name: "Cheesecake", img: "menu/cheesecake.jpg", price: 38000, description: "Satu potong, dengan dasar biskuit.", credit: { author: "jbooba", source: "Pixabay", url: "https://pixabay.com/photos/new-york-cheese-cake-cheese-cake-7500156/", license: "Pixabay Content License" } },
  { id: 310, category: "dessert", name: "Chocolate Cake", img: "menu/chocolate-cake.jpg", price: 36000, description: "Satu potong kue cokelat berlapis.", credit: { author: "congerdesign", source: "Pixabay", url: "https://pixabay.com/photos/cake-cakes-chocolate-cake-2001781/", license: "Pixabay Content License" } },
  { id: 311, category: "dessert", name: "Tiramisu", img: "menu/tiramisu.jpg", price: 38000, description: "Satu potong, dengan taburan kakao.", credit: { author: "Anestiev", source: "Pixabay", url: "https://pixabay.com/photos/italian-food-tiramisu-italian-food-2157243/", license: "Pixabay Content License" } },
  { id: 312, category: "pastry", name: "Smoked Beef & Cheese Sandwich", img: "menu/smoked-beef-and-cheese-sandwich.jpg", price: 38000, description: "Roti panggang isi daging asap dan keju.", credit: { author: "Pexels", source: "Pixabay", url: "https://pixabay.com/photos/bacon-bread-breakfast-delicious-2178770/", license: "Pixabay Content License" } },
  { id: 302, category: "pastry", name: "Roti Bakar Cokelat Keju", img: "menu/roti-bakar-cokelat-keju.jpg", price: 22000, description: "Dua tangkup, potong empat.", credit: { author: "PhotoEnduro", source: "Pixabay", url: "https://pixabay.com/photos/chocolate-spread-nutella-breakfast-6941623/", license: "Pixabay Content License" } },
  { id: 401, category: "main", name: "Nasi Goreng Seafood", img: "menu/nasi-goreng-seafood.jpg", price: 38000, description: "Nasi goreng dengan udang, cumi, dan telur.", credit: { author: "araf60plus", source: "Pixabay", url: "https://pixabay.com/photos/fried-rice-shrimp-food-dish-meal-7576680/", license: "Pixabay Content License" } },
  { id: 402, category: "main", name: "Nasi Goreng Ayam", img: "menu/nasi-goreng-ayam.jpg", price: 32000, description: "Nasi goreng dengan ayam suwir dan telur.", credit: { author: "PublicDomainPictures", source: "Pixabay", url: "https://pixabay.com/photos/nasi-goreng-fried-rice-fried-egg-70674/", license: "Pixabay Content License" } },
  { id: 403, category: "main", name: "Nasi Goreng Cabe Hijau", img: "menu/nasi-goreng-cabe-hijau.jpg", price: 35000, description: "Nasi goreng pedas dengan cabai hijau.", credit: { author: "Rierosa222", source: "Pixabay", url: "https://pixabay.com/photos/fried-rice-menu-for-lunch-dinner-2509080/", license: "Pixabay Content License" } },
  { id: 404, category: "noodles", name: "Mie Goreng Seafood", img: "menu/mie-goreng-seafood.jpg", price: 36000, description: "Mi goreng dengan udang dan cumi.", credit: { author: "mmaung", source: "Pixabay", url: "https://pixabay.com/photos/noodles-asian-food-plate-1786347/", license: "Pixabay Content License" } },
  { id: 405, category: "noodles", name: "Mie Goreng Ayam", img: "menu/mie-goreng-ayam.jpg", price: 32000, description: "Mi goreng dengan ayam dan sayuran.", credit: { author: "tifanitopan", source: "Pixabay", url: "https://pixabay.com/photos/mie-goreng-fried-noodles-indonesia-10168684/", license: "Pixabay Content License" } },
  { id: 406, category: "noodles", name: "Kwetiau Goreng Sapi", img: "menu/kwetiau-goreng-sapi.jpg", price: 38000, description: "Kwetiau goreng dengan irisan sapi.", credit: { author: "wackywil", source: "Pixabay", url: "https://pixabay.com/photos/food-fast-street-food-hawkerfood-248432/", license: "Pixabay Content License" } },
  { id: 407, category: "noodles", name: "Kwetiau Siram Seafood", img: "menu/kwetiau-siram-seafood.jpg", price: 38000, description: "Kwetiau dengan kuah kental seafood.", credit: { author: "phuonghoangthuy", source: "Pixabay", url: "https://pixabay.com/photos/bread-soup-soup-english-food-4908526/", license: "Pixabay Content License" } },
  { id: 408, category: "main", name: "Nasi Ayam Mentega", img: "menu/nasi-ayam-mentega.jpg", price: 40000, description: "Ayam goreng saus mentega dengan nasi.", credit: { author: "joannawielgosz", source: "Pixabay", url: "https://pixabay.com/photos/chicken-asian-cuisine-food-7249273/", license: "Pixabay Content License" } },
  { id: 409, category: "main", name: "Nasi Ayam Lada Hitam", img: "menu/nasi-ayam-lada-hitam.jpg", price: 40000, description: "Ayam saus lada hitam dengan nasi.", credit: { author: "Anilsharma26", source: "Pixabay", url: "https://pixabay.com/photos/food-and-drink-industry-7279409/", license: "Pixabay Content License" } },
  { id: 410, category: "main", name: "Nasi Sapi Lada Hitam", img: "menu/nasi-sapi-lada-hitam.jpg", price: 45000, description: "Sapi saus lada hitam dengan nasi.", credit: { author: "MiGallery23", source: "Pixabay", url: "https://pixabay.com/photos/food-lunch-meat-steak-eating-4571699/", license: "Pixabay Content License" } },
  { id: 411, category: "main", name: "Chicken Cordon Bleu", img: "menu/chicken-cordon-bleu.jpg", price: 48000, description: "Ayam isi keju dan daging asap, dengan kentang.", credit: { author: "ReinhardThrainer", source: "Pixabay", url: "https://pixabay.com/photos/cordon-cordon-bleu-schnitzel-flesh-4538108/", license: "Pixabay Content License" } },
  { id: 412, category: "main", name: "Nasi Cap Cay Seafood", img: "menu/nasi-cap-cay-seafood.jpg", price: 38000, description: "Tumis sayuran dan seafood dengan nasi.", credit: { author: "daole68680", source: "Pixabay", url: "https://pixabay.com/photos/shrimp-rice-seafood-meal-dish-1024741/", license: "Pixabay Content License" } },
  { id: 413, category: "main", name: "Sapo Tahu Seafood", img: "menu/sapo-tahu-seafood.jpg", price: 40000, description: "Tahu dan seafood dalam kuah kental, disajikan di claypot.", credit: { author: "frankzhang0711", source: "Pixabay", url: "https://pixabay.com/photos/mapo-tofu-tofu-bean-paste-sichuan-2570173/", license: "Pixabay Content License" } },
  { id: 414, category: "main", name: "Nasi Fuyunghai", img: "menu/nasi-fuyunghai.jpg", price: 35000, description: "Telur dadar isi dengan saus asam manis.", credit: { author: "52600603", source: "Pixabay", url: "https://pixabay.com/photos/omelette-egg-indian-omelette-10478949/", license: "Pixabay Content License" } },
  { id: 415, category: "noodles", name: "Spaghetti Bolognese", img: "menu/spaghetti-bolognese.jpg", price: 42000, description: "Spaghetti dengan saus daging sapi dan tomat.", credit: { author: "ayindeabdulmajeed44", source: "Pixabay", url: "https://pixabay.com/photos/spaghetti-pasta-cooking-kitchen-6639970/", license: "Pixabay Content License" } },
  { id: 416, category: "noodles", name: "Spaghetti Carbonara", img: "menu/spaghetti-carbonara.jpg", price: 45000, description: "Spaghetti dengan saus krim, keju, dan daging asap.", credit: { author: "Wow_Pho", source: "Pixabay", url: "https://pixabay.com/photos/pasta-carbonara-spaghetti-712664/", license: "Pixabay Content License" } },
  { id: 303, category: "snack", name: "Kentang Goreng", img: "menu/kentang-goreng.jpg", price: 22000, description: "Dengan saus sambal dan mayones.", credit: { author: "Pexels", source: "Pixabay", url: "https://pixabay.com/photos/bowl-french-fries-food-fries-1842294/", license: "Pixabay Content License" } },
  { id: 351, category: "snack", name: "Chicken Wings", img: "menu/chicken-wings.jpg", price: 32000, description: "Enam potong sayap ayam pedas manis.", credit: { author: "LAWJR", source: "Pixabay", url: "https://pixabay.com/photos/wings-chicken-fried-sauce-food-4120271/", license: "Pixabay Content License" } },
  { id: 352, category: "snack", name: "Onion Rings", img: "menu/onion-rings.jpg", price: 24000, description: "Bawang bombai goreng tepung.", credit: { author: "Fabricio_Macedo_Photo", source: "Pixabay", url: "https://pixabay.com/photos/crunchy-fried-onion-rings-american-5466250/", license: "Pixabay Content License" } },
  { id: 353, category: "snack", name: "Pisang Goreng Keju", img: "menu/pisang-goreng-keju.jpg", price: 22000, description: "Pisang goreng dengan parutan keju.", credit: { author: "pucho", source: "Pixabay", url: "https://pixabay.com/photos/fried-banana-fried-banana-fork-285222/", license: "Pixabay Content License" } },
  { id: 354, category: "snack", name: "Bola Singkong Keju", img: "menu/bola-singkong-keju.jpg", price: 22000, description: "Singkong isi keju, digoreng renyah.", credit: { author: "diegotoralabad", source: "Pixabay", url: "https://pixabay.com/photos/ecuador-south-america-food-potato-7467030/", license: "Pixabay Content License" } },
  { id: 355, category: "snack", name: "Tahu Goreng", img: "menu/tahu-goreng.jpg", price: 20000, description: "Tahu goreng renyah dengan sambal kecap.", credit: { author: "focusonpc", source: "Pixabay", url: "https://pixabay.com/photos/meal-delicious-fried-tofu-3167100/", license: "Pixabay Content License" } },
  { id: 1, category: "beans", name: "Robusta Brazil", img: "menu/beans-robusta-brazil.jpg", price: 45000, rating: 4.5, description: "Biji kopi 200 g.", credit: { author: "ka_re", source: "Pixabay", url: "https://pixabay.com/photos/coffee-beans-seed-coffee-beans-4668463/", license: "Pixabay Content License" } },
  { id: 2, category: "beans", name: "America Blend", img: "menu/beans-america-blend.jpg", price: 75000, rating: 5.0, description: "Biji kopi 200 g.", credit: { author: "soramang", source: "Pixabay", url: "https://pixabay.com/photos/coffee-coffee-bean-beans-food-1213249/", license: "Pixabay Content License" } },
  { id: 3, category: "beans", name: "Primo Passo", img: "menu/beans-primo-passo.jpg", price: 100000, rating: 4.6, description: "Biji kopi 200 g.", credit: { author: "Bluesnap", source: "Pixabay", url: "https://pixabay.com/photos/coffee-coffee-beans-caffeine-7004919/", license: "Pixabay Content License" } },
  { id: 4, category: "beans", name: "Aceh Gayo", img: "menu/beans-aceh-gayo.jpg", price: 150000, rating: 4.7, description: "Biji kopi 200 g.", credit: { author: "willyvh", source: "Pixabay", url: "https://pixabay.com/photos/coffee-coffee-bean-single-origin-4529042/", license: "Pixabay Content License" } },
  { id: 5, category: "beans", name: "Sumatra Mandailing", img: "menu/beans-sumatra-mandailing.jpg", price: 90000, rating: 4.3, description: "Biji kopi 200 g.", credit: { author: "uroburos", source: "Pixabay", url: "https://pixabay.com/photos/coffee-coffee-beans-roasted-coffee-660394/", license: "Pixabay Content License" } },
  { id: 6, category: "beans", name: "Toraja Sapan", img: "menu/beans-toraja-sapan.jpg", price: 120000, rating: 4.6, description: "Biji kopi 200 g.", credit: { author: "NickyPe", source: "Pixabay", url: "https://pixabay.com/photos/coffee-beans-coffee-6603499/", license: "Pixabay Content License" } },
];

// Pilihan untuk menu minuman. Pilihan pertama adalah bawaan, kecuali suhu:
// bawaannya es kalau tersedia. price adalah tambahan harga per gelas.
const drinkOptions = {
  temperature: {
    label: "Suhu",
    choices: [
      { id: "hot", name: "Panas" },
      { id: "iced", name: "Es" },
    ],
  },
  size: {
    label: "Ukuran",
    choices: [
      { id: "regular", name: "Regular", price: 0 },
      { id: "large", name: "Large", price: 5000 },
    ],
  },
  sugar: {
    label: "Tingkat gula",
    choices: [
      { id: "normal", name: "Gula normal" },
      { id: "less", name: "Kurang manis" },
      { id: "none", name: "Tanpa gula" },
    ],
  },
};

// Pajak restoran yang ditambahkan ke setiap pesanan.
const fees = { taxRate: 0.1 };

const MAX_QUANTITY_PER_ITEM = 20;
// Satu menu dengan pilihan berbeda menjadi baris terpisah di keranjang.
const MAX_CART_LINES = 40;
const MAX_TABLE_NUMBER = 30;

module.exports = {
  categories,
  products,
  drinkOptions,
  fees,
  MAX_QUANTITY_PER_ITEM,
  MAX_CART_LINES,
  MAX_TABLE_NUMBER,
};
