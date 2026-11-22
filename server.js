require("dotenv").config();

const midtransClient = require("midtrans-client");
const { createApp } = require("./lib/app");

const port = Number(process.env.PORT) || 3000;
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
const serverKey = (process.env.MIDTRANS_SERVER_KEY || "").trim();
const clientKey = (process.env.MIDTRANS_CLIENT_KEY || "").trim();

// Jumlah proxy di depan server. Render dan Railway memakai satu proxy, jadi
// dikenali otomatis. Hosting lain: isi TRUST_PROXY=1 di environment.
// Tanpa proxy (mis. di komputer sendiri) biarkan kosong atau isi 0.
function readTrustProxy(value) {
  if (value === undefined || value.trim() === "") {
    return process.env.RENDER || process.env.RAILWAY_ENVIRONMENT ? 1 : false;
  }
  const hops = Number(value);
  if (!Number.isInteger(hops) || hops < 0) {
    console.warn(`TRUST_PROXY "${value}" tidak valid. Isi angka 0, 1, 2, dst. Dipakai 0.`);
    return false;
  }
  return hops === 0 ? false : hops;
}
const trustProxy = readTrustProxy(process.env.TRUST_PROXY);

// Alamat publik situs, mis. https://fj-coffee.onrender.com. Boleh lebih dari
// satu, dipisah koma (mis. domain sendiri). Di Render, RENDER_EXTERNAL_URL
// diisi otomatis dan ikut dipakai. Kosong di komputer sendiri.
function readOrigins(...values) {
  const origins = [];
  for (const value of values.join(",").split(",")) {
    const text = value.trim();
    if (!text) continue;
    try {
      const { origin, protocol } = new URL(text);
      if (protocol !== "https:" && protocol !== "http:") throw new Error();
      if (!origins.includes(origin)) origins.push(origin);
    } catch {
      console.warn(`PUBLIC_URL "${text}" bukan URL yang valid, contoh: https://fj-coffee.onrender.com. Diabaikan.`);
    }
  }
  return origins;
}
const allowedOrigins = readOrigins(process.env.PUBLIC_URL || "", process.env.RENDER_EXTERNAL_URL || "");

let coreApi = null;
if (serverKey && clientKey) {
  coreApi = new midtransClient.CoreApi({ isProduction, serverKey, clientKey });
} else {
  console.warn(
    "Key Midtrans belum diisi. Situs tetap jalan, tapi checkout dinonaktifkan. Salin .env.example ke .env lalu isi key-nya.",
  );
}

// Key sandbox diawali "SB-". Cegah mode dan key yang tidak cocok.
if (coreApi && isProduction === serverKey.startsWith("SB-")) {
  console.warn(
    "MIDTRANS_IS_PRODUCTION tidak cocok dengan jenis server key (key sandbox diawali SB-).",
  );
}

const app = createApp({ coreApi, serverKey, isProduction, trustProxy, allowedOrigins });

app.listen(port, () => {
  const address = allowedOrigins[0] || `http://localhost:${port}`;
  console.log(`FJ Coffee jalan di ${address} (Midtrans ${isProduction ? "PRODUCTION" : "sandbox"})`);
  if (allowedOrigins.length) {
    console.log(`Notification URL Midtrans: ${allowedOrigins[0]}/api/midtrans/notification`);
  }
});
