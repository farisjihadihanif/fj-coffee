# FJ Coffee

Katalog menu kafe dengan pemesanan dan pembayaran online. Pengunjung memilih menu, mengisi nama dan nomor meja (atau bawa pulang), lalu membayar lewat QRIS, GoPay, atau transfer bank melalui Midtrans Core API.

Tampilan dasarnya berasal dari tutorial [Kedai Kopi Kenangan Senja](https://github.com/sandhikagalih/kedai-kopi-kenangan-senja) oleh Sandhika Galih. Yang dikembangkan di proyek ini: katalog menu berbasis data, keranjang, alur pemesanan kafe, server Express, dan integrasi Midtrans.

## Menjalankan

```bash
npm install
cp .env.example .env   # lalu isi key Midtrans
npm start
```

Buka http://localhost:3000. Tanpa key Midtrans situs tetap tampil, tetapi checkout dinonaktifkan.

```bash
npm test   # menguji server dengan Midtrans tiruan, tidak butuh key
```

## Struktur

| Lokasi | Isi |
|---|---|
| `public/` | Halaman utama (`index.html`), halaman menu (`menu.html`), CSS, JavaScript, dan gambar. Hanya folder ini yang bisa diakses browser. |
| `lib/catalog.js` | Daftar menu, kategori, harga, dan pajak. |
| `tools/build_menu.py` | Membuat ulang `lib/catalog.js` dan ilustrasi menu di `public/img/menu/` dari satu daftar. |
| `lib/pricing.js` | Perhitungan total dan validasi data pemesan. |
| `lib/app.js` | Endpoint API dan integrasi Midtrans. |
| `server.js` | Membaca `.env` dan menjalankan server. |
| `test/` | Tes otomatis. |

## Menu dan gambar

Menu ada di `lib/catalog.js`. Gambar tiap menu saat ini berupa ilustrasi SVG, bukan foto. Untuk memakai foto asli, simpan filenya di `public/img/menu/` lalu ubah nilai `img` menu itu di `lib/catalog.js`.

Navbar, keranjang, dan form checkout ditulis dua kali, di `index.html` dan `menu.html`. Kalau mengubah salah satunya, ubah juga yang lain. Isi keranjang disimpan di localStorage supaya tidak hilang saat pindah halaman.

## Cara kerja pembayaran

1. Browser mengirim id menu, jumlah, data pemesan, dan metode pembayaran ke `POST /api/payment`. Harga tidak dikirim dari browser; server menghitungnya dari `lib/catalog.js`.
2. Server membuat nomor order, menagih lewat Midtrans, lalu mengembalikan instruksi bayar dan sebuah token.
3. Browser mengecek status tiap 5 detik lewat `GET /api/payment/:orderId/status` dengan token itu. Tanpa token, status dan pembatalan order ditolak.
4. Midtrans juga mengirim notifikasi ke `POST /api/midtrans/notification`, yang diverifikasi dengan signature key.

Jenis pesanan dan nomor meja dikirim ke Midtrans sebagai `custom_field1`, dan catatan sebagai `custom_field2`, sehingga terlihat di detail transaksi pada dashboard Midtrans.

## Deploy

Proyek ini butuh hosting yang menjalankan Node.js (misalnya Render, Railway, atau Koyeb), bukan hosting statis.

1. Unggah kode ke repositori Git. File `.env` tidak ikut karena ada di `.gitignore`.
2. Buat web service baru: build command `npm install`, start command `npm start`.
3. Isi environment variable `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, dan `MIDTRANS_IS_PRODUCTION`. Di Render dan Railway, proxy dikenali otomatis. Di hosting lain yang memakai proxy, isi juga `TRUST_PROXY=1` supaya rate limit membaca IP pengunjung yang benar.
4. Di dashboard Midtrans, isi Payment Notification URL dengan `https://domain-kamu/api/midtrans/notification`.
5. Aktifkan metode pembayaran yang dipakai (QRIS, GoPay, BCA, BNI, BRI, Mandiri) di dashboard Midtrans.

## Batasan

- Belum ada database dan halaman kasir. Pesanan yang sudah dibayar hanya terlihat di dashboard Midtrans.
- Alamat dan jam buka di bagian Kontak masih contoh.
