import test from "node:test";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";

test("cloudinary config uses api_key and api_secret keys", async () => {
  process.env.CLOUDINARY_CLOUD_NAME = "demo";
  process.env.CLOUDINARY_API_KEY = "123456";
  process.env.CLOUDINARY_API_SECRET = "secret";

  const moduleUrl = `${pathToFileURL("/workspaces/node-microservices/media-services/src/config/cloudinary.js").href}?t=${Date.now()}`;
  const cloudinary = (await import(moduleUrl)).default;
  const config = cloudinary.config();

  assert.equal(config.cloud_name, "demo");
  assert.equal(config.api_key, "123456");
  assert.equal(config.api_secret, "secret");
});
