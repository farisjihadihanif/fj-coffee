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

const app = createApp({ coreApi, serverKey, isProduction, trustProxy });

app.listen(port, () => {
  console.log(
    `FJ Coffee jalan di http://localhost:${port} (Midtrans ${
      isProduction ? "PRODUCTION" : "sandbox"
    })`,
  );
});
