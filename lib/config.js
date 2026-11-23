const midtransClient = require("midtrans-client");

// Jumlah proxy di depan server. Render, Railway, dan Vercel memakai satu
// proxy, jadi dikenali otomatis. Hosting lain: isi TRUST_PROXY=1 di
// environment. Tanpa proxy (mis. di komputer sendiri) biarkan kosong atau 0.
function readTrustProxy(value, env = process.env) {
  if (value === undefined || value.trim() === "") {
    return env.RENDER || env.RAILWAY_ENVIRONMENT || env.VERCEL ? 1 : false;
  }
  const hops = Number(value);
  if (!Number.isInteger(hops) || hops < 0) {
    console.warn(`TRUST_PROXY "${value}" tidak valid. Isi angka 0, 1, 2, dst. Dipakai 0.`);
    return false;
  }
  return hops === 0 ? false : hops;
}

// Alamat publik situs, mis. https://fj-coffee.vercel.app. Boleh lebih dari
// satu, dipisah koma (mis. domain sendiri).
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
      console.warn(`PUBLIC_URL "${text}" bukan URL yang valid, contoh: https://fj-coffee.vercel.app. Diabaikan.`);
    }
  }
  return origins;
}

// Vercel memberi nama domain tanpa https://, mis. fj-coffee.vercel.app.
function vercelOrigin(host) {
  return host && host.trim() ? `https://${host.trim()}` : "";
}

// Membaca semua pengaturan dari environment. Dipakai server.js (Render,
// komputer sendiri) dan api/index.js (Vercel).
function loadConfig(env = process.env) {
  const isProduction = env.MIDTRANS_IS_PRODUCTION === "true";
  const serverKey = (env.MIDTRANS_SERVER_KEY || "").trim();
  const clientKey = (env.MIDTRANS_CLIENT_KEY || "").trim();
  const trustProxy = readTrustProxy(env.TRUST_PROXY, env);

  // PUBLIC_URL diisi sendiri. Render mengisi RENDER_EXTERNAL_URL. Vercel
  // mengisi domain produksi dan domain deploy ini (dipakai untuk preview).
  const allowedOrigins = readOrigins(
    env.PUBLIC_URL || "",
    env.RENDER_EXTERNAL_URL || "",
    vercelOrigin(env.VERCEL_PROJECT_PRODUCTION_URL),
    vercelOrigin(env.VERCEL_URL),
  );

  let coreApi = null;
  if (serverKey && clientKey) {
    coreApi = new midtransClient.CoreApi({ isProduction, serverKey, clientKey });
  } else {
    console.warn(
      "Key Midtrans belum diisi. Situs tetap jalan, tapi checkout dinonaktifkan. Isi MIDTRANS_SERVER_KEY dan MIDTRANS_CLIENT_KEY.",
    );
  }

  // Key sandbox diawali "SB-". Cegah mode dan key yang tidak cocok.
  if (coreApi && isProduction === serverKey.startsWith("SB-")) {
    console.warn(
      "MIDTRANS_IS_PRODUCTION tidak cocok dengan jenis server key (key sandbox diawali SB-).",
    );
  }

  return { coreApi, serverKey, isProduction, trustProxy, allowedOrigins };
}

module.exports = { loadConfig, readOrigins, readTrustProxy };
