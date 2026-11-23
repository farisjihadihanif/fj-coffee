require("dotenv").config();

const { createApp } = require("./lib/app");
const { loadConfig } = require("./lib/config");

const port = Number(process.env.PORT) || 3000;
const config = loadConfig();
const app = createApp(config);

app.listen(port, () => {
  const address = config.allowedOrigins[0] || `http://localhost:${port}`;
  console.log(`FJ Coffee jalan di ${address} (Midtrans ${config.isProduction ? "PRODUCTION" : "sandbox"})`);
  if (config.allowedOrigins.length) {
    console.log(`Notification URL Midtrans: ${config.allowedOrigins[0]}/api/midtrans/notification`);
  }
});
