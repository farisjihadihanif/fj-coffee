# Deploy FJ Coffee ke Render (gratis)

Panduan langkah demi langkah untuk menaruh FJ Coffee di internet memakai paket
gratis [Render](https://render.com). Hasil akhirnya satu *web service* yang
melayani halaman (`public/`) dan API (`/api/...`) di alamat seperti
`https://fj-coffee.onrender.com`, dengan pembayaran Midtrans mode sandbox
(uji coba, tanpa uang sungguhan).

Perkiraan waktu: 20–30 menit.

## Yang perlu disiapkan

- Akun [GitHub](https://github.com).
- Akun [Render](https://dashboard.render.com/register). Paling mudah daftar
  dengan tombol **GitHub**.
- Akun [Midtrans](https://dashboard.midtrans.com/register) untuk mengambil key
  sandbox.
- [Git](https://git-scm.com/downloads) dan [Node.js](https://nodejs.org)
  terpasang di komputer.

## 1. Pastikan proyek siap

Buka terminal di folder proyek, lalu jalankan:

```bash
npm install
npm test
```

Semua tes harus lulus. Lalu pastikan file `.env` (berisi key rahasia) **tidak**
ikut ke Git:

```bash
git check-ignore .env
```

Kalau perintah itu mencetak `.env`, file tersebut aman (diabaikan Git). Kalau
tidak mencetak apa pun, jangan lanjut dulu: tambahkan `.env` ke `.gitignore`.

## 2. Buat repo GitHub dan push

1. Buka <https://github.com/new>.
2. Isi **Repository name**, misalnya `fj-coffee`. Pilih **Public** atau
   **Private** (keduanya bisa dipakai Render).
3. **Jangan** centang *Add a README*, *.gitignore*, atau *license*, karena
   proyek ini sudah punya. Klik **Create repository**.
4. GitHub menampilkan alamat repo, misalnya
   `https://github.com/NAMA-KAMU/fj-coffee.git`. Di terminal, di folder
   proyek:

   ```bash
   git remote add origin https://github.com/NAMA-KAMU/fj-coffee.git
   git push -u origin main
   ```

   Ganti `NAMA-KAMU` dengan username GitHub-mu. Kalau diminta login, ikuti
   jendela login GitHub yang muncul.
5. Muat ulang halaman repo di GitHub. File proyek (termasuk `render.yaml`)
   sekarang terlihat di sana, tanpa `.env`.

> Kalau muncul `remote origin already exists`, repo ini sudah punya remote.
> Cek dengan `git remote -v`; kalau alamatnya benar, cukup jalankan
> `git push -u origin main`.

## 3. Ambil key sandbox Midtrans

1. Masuk ke <https://dashboard.midtrans.com>.
2. Di kiri atas, pastikan environment yang aktif adalah **Sandbox**.
3. Buka **Settings → Access Keys**.
4. Catat dua nilai ini (jangan dibagikan ke siapa pun):
   - **Server Key**, diawali `SB-Mid-server-`
   - **Client Key**, diawali `SB-Mid-client-`

## 4. Buat service di Render

Repo ini punya `render.yaml` (Blueprint), jadi Render bisa mengisi hampir
semua pengaturan sendiri.

1. Buka <https://dashboard.render.com>, klik **New** → **Blueprint**.
2. Kalau diminta, hubungkan akun GitHub dan beri Render akses ke repo
   `fj-coffee`.
3. Pilih repo `fj-coffee`. Render membaca `render.yaml` dan menampilkan satu
   web service bernama `fj-coffee` (paket **Free**, region **Singapore**).
4. Render meminta nilai untuk variabel rahasia. Isi:
   - `MIDTRANS_SERVER_KEY`: Server Key dari langkah 3
   - `MIDTRANS_CLIENT_KEY`: Client Key dari langkah 3
5. Klik **Deploy Blueprint** (atau **Apply**).
6. Buka service `fj-coffee` → tab **Logs**. Tunggu sampai muncul tulisan
   seperti `Your service is live` dan baris dari aplikasi:

   ```
   FJ Coffee jalan di https://fj-coffee.onrender.com (Midtrans sandbox)
   Notification URL Midtrans: https://fj-coffee.onrender.com/api/midtrans/notification
   ```

7. Alamat situsmu ada di bagian atas halaman service. Kalau nama `fj-coffee`
   sudah dipakai orang lain, Render menambahkan akhiran, misalnya
   `https://fj-coffee-abcd.onrender.com`. Pakai alamat yang tertulis di
   dashboard untuk langkah berikutnya.

### Kalau tidak memakai Blueprint

Pilih **New** → **Web Service**, pilih repo, lalu isi:

| Kolom | Isi |
|---|---|
| Language / Runtime | Node |
| Branch | `main` |
| Region | Singapore |
| Build Command | `npm ci --omit=dev` |
| Start Command | `npm start` |
| Instance Type | Free |
| Health Check Path | `/healthz` (di **Advanced**) |

Lalu tambahkan variabel lingkungan dari tabel di langkah 5.

## 5. Variabel lingkungan

| Nama | Wajib diisi? | Keterangan |
|---|---|---|
| `MIDTRANS_SERVER_KEY` | Ya | Rahasia. Diisi saat membuat Blueprint. |
| `MIDTRANS_CLIENT_KEY` | Ya | Rahasia. Diisi saat membuat Blueprint. |
| `MIDTRANS_IS_PRODUCTION` | Sudah diisi `render.yaml` | Biarkan `false` (sandbox). |
| `NODE_VERSION` | Sudah diisi `render.yaml` | Versi Node.js di Render. |
| `PUBLIC_URL` | Tidak | Hanya kalau memakai domain sendiri (lihat bawah). |
| `PORT` | Jangan diisi | Diisi Render otomatis. |
| `TRUST_PROXY` | Jangan diisi | Render dikenali otomatis. |
| `PIXABAY_API_KEY` | Jangan diisi | Hanya untuk skrip foto di komputer sendiri. |

Variabel bisa diubah kapan saja di service → **Environment**. Setelah disimpan,
Render menjalankan ulang service.

**Domain sendiri:** alamat `onrender.com` sudah dikenali otomatis. Kalau nanti
menambahkan domain sendiri, isi `PUBLIC_URL` dengan semua alamat situs,
dipisah koma, misalnya `https://kopi.contoh.com,https://fj-coffee.onrender.com`.
Tanpa itu, pembayaran dari domain baru ditolak dengan pesan "Permintaan dari
situs lain ditolak".

## 6. Atur Notification URL di Midtrans

Midtrans mengirim kabar pembayaran (lunas, kedaluwarsa, dibatalkan) ke server
lewat alamat ini.

1. Di <https://dashboard.midtrans.com>, pastikan environment **Sandbox**.
2. Buka **Settings → Payment → Notification URL**. (Di tampilan dashboard
   yang lebih lama namanya **Settings → Configuration → Payment Notification
   URL**.)
3. Isi dengan alamat situsmu ditambah `/api/midtrans/notification`, misalnya:

   ```
   https://fj-coffee.onrender.com/api/midtrans/notification
   ```

   Salin persis dari baris `Notification URL Midtrans:` di Logs Render supaya
   tidak salah ketik. Pakai `https://`, tanpa garis miring di akhir.
4. Simpan (**Update** / **Save**).

Kolom *Finish/Unfinish/Error Redirect URL* boleh dikosongkan: FJ Coffee memakai
Core API, jadi pembeli tidak diarahkan ke halaman Midtrans.

## 7. Cek bahwa semuanya jalan

1. **Server hidup:** buka `https://ALAMAT-KAMU.onrender.com/healthz`. Harus
   tampil `{"status":"ok"}`.
2. **Key terbaca:** buka `https://ALAMAT-KAMU.onrender.com/api/config`. Harus
   ada `"paymentReady":true` dan `"isProduction":false`. Kalau
   `paymentReady` `false`, key Midtrans belum diisi atau salah nama.
3. **Situs:** buka alamat situs. Menu dan biji kopi tampil, dan ada chip
   **Demo** di navbar (tanda mode sandbox).
4. **Pembayaran uji coba:**
   1. Tambahkan menu ke keranjang, buka keranjang (ikon di kanan bawah), klik
      **Pesan sekarang**, isi data, klik **Pilih pembayaran**, lalu pilih
      **BCA Virtual Account**.
   2. Salin nomor VA yang muncul.
   3. Buka [simulator Midtrans](https://simulator.sandbox.midtrans.com), pilih
      **BCA Virtual Account**, tempel nomor VA, lalu bayar.
   4. Dalam beberapa detik situs menampilkan bahwa order sudah dibayar.
5. **Notification URL:** di Render → **Logs** harus muncul baris seperti
   `Midtrans notification: FJC-... -> settlement`. Di dashboard Midtrans,
   transaksi yang sama juga terlihat di **Transactions**.

## Catatan paket gratis

- Service gratis **tidur setelah 15 menit** tanpa kunjungan dan butuh sekitar
  **satu menit** untuk bangun lagi. Kunjungan pertama setelah tidur akan
  lambat: Render menampilkan halaman tunggu, lalu situs muncul. Kalau tab
  situs sudah terbuka lama lalu dipakai lagi, situs menampilkan pesan
  "Membangunkan server…" sampai server siap.
- Notifikasi Midtrans yang datang saat server tidur ikut membangunkannya.
  Kalau gagal, Midtrans mengirim ulang beberapa kali.
- Setiap `git push` ke branch `main` otomatis memicu deploy baru.

## Kalau ada masalah

| Gejala | Penyebab dan solusi |
|---|---|
| Build gagal di Render | Buka **Logs** build. Pastikan `package-lock.json` ikut di-push (`git ls-files package-lock.json`). |
| Checkout menjawab "Pembayaran belum dikonfigurasi" | `MIDTRANS_SERVER_KEY` atau `MIDTRANS_CLIENT_KEY` kosong. Isi di **Environment**. |
| "Gagal membuat transaksi" | Key salah, atau key production dipakai dengan `MIDTRANS_IS_PRODUCTION=false`. Key sandbox diawali `SB-`. |
| "Permintaan dari situs lain ditolak" | Situs dibuka dari domain yang belum ada di `PUBLIC_URL`. |
| Metode pembayaran tertentu gagal | Metode itu belum aktif di dashboard Midtrans (**Settings → Payment**). Aktifkan QRIS, GoPay, BCA, BNI, BRI, dan Mandiri. |
| Logs tidak menampilkan `Midtrans notification` | Notification URL di Midtrans salah ketik, masih `http://`, atau diisi di environment Production, bukan Sandbox. |
| Midtrans mencatat notifikasi gagal dengan kode 403 | Server Key di Render berbeda dengan akun Midtrans yang mengirim notifikasi. Salin ulang Server Key dari environment Sandbox. |
