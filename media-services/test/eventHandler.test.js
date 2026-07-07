import test from "node:test";
import assert from "node:assert/strict";

process.env.CLOUDINARY_CLOUD_NAME = "test";
process.env.CLOUDINARY_API_KEY = "test";
process.env.CLOUDINARY_API_SECRET = "test";

test("extractMediaIds supports both mediaId and mediaIds payloads", async () => {
  const { extractMediaIds } = await import("../src/handler/eventHandler.js");

  assert.deepEqual(extractMediaIds({ mediaId: "media-1" }), ["media-1"]);
  assert.deepEqual(extractMediaIds({ mediaId: ["media-1", "media-2"] }), [
    "media-1",
    "media-2",
  ]);
  assert.deepEqual(extractMediaIds({ mediaIds: ["media-1", "media-2"] }), [
    "media-1",
    "media-2",
  ]);
  assert.deepEqual(extractMediaIds({}), []);
});
