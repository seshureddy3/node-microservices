import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import express from "express";
import uploadMiddleware from "../src/middleware/media.js";

test("upload middleware handles multipart uploads without crashing", async () => {
  const app = express();
  app.post("/upload", uploadMiddleware, (req, res) => {
    res.status(200).json({ ok: !!req.file });
  });

  const server = app.listen(0);

  await new Promise((resolve) => server.once("listening", resolve));

  const { port } = server.address();
  const boundary = "----node-test-boundary";
  const payload = `--${boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"test.png\"\r\nContent-Type: image/png\r\n\r\nhello\r\n--${boundary}--\r\n`;

  const response = await new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port,
        path: "/upload",
        method: "POST",
        headers: {
          "content-type": `multipart/form-data; boundary=${boundary}`,
          "content-length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve({ statusCode: res.statusCode, body: data });
        });
      },
    );

    req.on("error", reject);
    req.write(payload);
    req.end();
  });

  server.close();

  assert.equal(response.statusCode, 200);
  assert.match(response.body, /"ok":true/);
});
