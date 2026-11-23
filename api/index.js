// Pintu masuk untuk Vercel. Vercel menjalankan file ini sebagai serverless
// function untuk /api/* dan /healthz (lihat vercel.json), sedangkan halaman
// di folder public/ dilayani langsung oleh CDN Vercel.
// Aplikasinya sama dengan server.js, hanya tanpa app.listen().
const { createApp } = require("../lib/app");
const { loadConfig } = require("../lib/config");

module.exports = createApp(loadConfig());
