const { test } = require("node:test");
const assert = require("node:assert/strict");

const vercel = require("../vercel.json");
const { CONTENT_SECURITY_POLICY } = require("../lib/app");
const { loadConfig } = require("../lib/config");

test("vercel.json memakai Content-Security-Policy yang sama dengan Express", () => {
  const headers = vercel.headers.find((h) => h.source === "/(.*)").headers;
  const csp = headers.find((h) => h.key === "Content-Security-Policy");
  assert.equal(csp.value, CONTENT_SECURITY_POLICY);
});

test("vercel.json mengarahkan API dan /healthz ke function", () => {
  const targets = vercel.rewrites.map((r) => `${r.source} -> ${r.destination}`);
  assert.deepEqual(targets, ["/api/(.*) -> /api/index", "/healthz -> /api/index"]);
  assert.equal(vercel.outputDirectory, "public");
});

test("api/index.js mengekspor aplikasi Express", () => {
  const app = require("../api/index");
  assert.equal(typeof app, "function");
  assert.equal(typeof app.handle, "function");
});

test("loadConfig mengenali Vercel: trust proxy dan domain otomatis", () => {
  const config = loadConfig({
    VERCEL: "1",
    VERCEL_PROJECT_PRODUCTION_URL: "fj-coffee.vercel.app",
    VERCEL_URL: "fj-coffee-abc123.vercel.app",
  });
  assert.equal(config.trustProxy, 1);
  assert.deepEqual(config.allowedOrigins, [
    "https://fj-coffee.vercel.app",
    "https://fj-coffee-abc123.vercel.app",
  ]);
  assert.equal(config.coreApi, null);
});

test("loadConfig di komputer sendiri: tanpa proxy dan tanpa origin", () => {
  const config = loadConfig({});
  assert.equal(config.trustProxy, false);
  assert.deepEqual(config.allowedOrigins, []);
});
