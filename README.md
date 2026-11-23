# FJ Coffee

> **FJ Coffee adalah kafe fiktif.** Proyek ini dibuat untuk portofolio: alamat, jam buka, menu, dan harga hanya contoh, dan versi online-nya memakai Midtrans sandbox sehingga tidak ada uang sungguhan yang berpindah.

Katalog menu kafe dengan pemesanan dan pembayaran online. Pengunjung memilih menu, mengisi nama dan nomor meja (atau bawa pulang), lalu membayar lewat QRIS, GoPay, atau transfer bank melalui Midtrans Core API.

Tampilan dasarnya berasal dari tutorial [Kedai Kopi Kenangan Senja](https://github.com/sandhikagalih/kedai-kopi-kenangan-senja) oleh Sandhika Galih. Yang dikembangkan di proyek ini: katalog menu berbasis data, keranjang, alur pemesanan kafe, server Express, dan integrasi Midtrans.

## Website

Visit the Deployment Website:
https://fj-coffee.vercel.app/

## Struktur

| Lokasi                | Isi                                                                                                                                |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `public/`             | Halaman utama (`index.html`), halaman menu (`menu.html`), CSS, JavaScript, dan gambar. Hanya folder ini yang bisa diakses browser. |
| `lib/catalog.js`      | Daftar menu, kategori, harga, dan pajak.                                                                                           |
| `tools/build_menu.py` | Membuat ulang `lib/catalog.js` dari satu daftar menu, lengkap dengan path foto dan kreditnya.                                      |
| `lib/pricing.js`      | Perhitungan total dan validasi data pemesan.                                                                                       |
| `lib/app.js`          | Endpoint API dan integrasi Midtrans.                                                                                               |
| `server.js`           | Membaca `.env` dan menjalankan server.                                                                                             |
| `test/`               | Tes otomatis.                                                                                                                      |

## Menu dan gambar

Ada 35 biji kopi, sebagian besar dari daerah asal di Indonesia, masing-masing dengan harga, rating, tingkat sangrai, dan catatan rasa. Halaman utama menampilkan sembilan pertama dalam urutan `BEANS` di `tools/build_menu.py`; semuanya ada di kategori Biji Kopi di `menu.html?kategori=beans`.

Menu ada di `lib/catalog.js`. Setiap menu dan biji kopi memakai foto JPG 800×600 (4:3) di `public/img/menu/`, diambil dari [Pixabay](https://pixabay.com/) (Pixabay Content License) atau [Openverse](https://openverse.org/) (CC0 atau CC BY). Nama fotografer dan halaman sumber tiap foto ada di `tools/photo_credits.json` dan tampil di halaman `credits.html` (dibuat ulang oleh `tools/build_menu.py`, ditautkan dari footer).

Untuk mengganti foto, simpan file baru sebagai `public/img/menu/<slug>.jpg`, isi kreditnya di `tools/photo_credits.json`, lalu jalankan `python tools/build_menu.py`. Menu baru yang belum punya foto otomatis mendapat ilustrasi SVG.

Menu minuman (Signature, Kopi Susu, Kopi Hitam, Frappe, Non-kopi) punya pilihan suhu (panas atau es, sesuai menunya), ukuran (Regular atau Large +Rp5.000), dan tingkat gula. Daftar pilihannya ada di `drinkOptions` di `lib/catalog.js`. Menu yang sama dengan pilihan berbeda menjadi baris terpisah di keranjang.

Navbar, keranjang, dan form checkout ditulis dua kali, di `index.html` dan `menu.html`. Kalau mengubah salah satunya, ubah juga yang lain. Isi keranjang disimpan di localStorage supaya tidak hilang saat pindah halaman.

## Cara kerja pembayaran

1. Browser mengirim id menu, jumlah, pilihan minuman, data pemesan, dan metode pembayaran ke `POST /api/payment`. Harga tidak dikirim dari browser; server memeriksa pilihannya lalu menghitung harga dari `lib/catalog.js`, termasuk tambahan ukuran Large.
2. Server membuat nomor order, menagih lewat Midtrans, lalu mengembalikan instruksi bayar dan sebuah token.
3. Browser mengecek status tiap 5 detik lewat `GET /api/payment/:orderId/status` dengan token itu. Tanpa token, status dan pembatalan order ditolak.
4. Midtrans juga mengirim notifikasi ke `POST /api/midtrans/notification`, yang diverifikasi dengan signature key.

Jenis pesanan dan nomor meja dikirim ke Midtrans sebagai `custom_field1`, dan catatan sebagai `custom_field2`, sehingga terlihat di detail transaksi pada dashboard Midtrans.

## Batasan

- Belum ada database dan halaman kasir. Pesanan yang sudah dibayar hanya terlihat di dashboard Midtrans.
- Kafe ini fiktif. Alamat dan jam buka di bagian Kontak hanya contoh.

## Copyright

© 2026 Faris Jihadi Hanif Lubis. All rights reserved.

This repository is public for portfolio and review purposes only. No license is granted: you may view the code, but you may not copy, modify, redistribute, or use it in other projects without my written permission.

Repositori ini dipublikasikan hanya untuk keperluan portofolio. Kode boleh dilihat, tetapi tidak boleh disalin, diubah, disebarkan, atau digunakan tanpa izin tertulis dari saya.

Contact: [LinkedIn](https://www.linkedin.com/in/faris-jihadi-hanif-lubis-62337a286/)
