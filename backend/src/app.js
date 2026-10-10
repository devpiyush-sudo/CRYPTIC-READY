import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

import { app, server } from "./lib/socket.js";

import clerkWebhook from "./webhooks/clerk.webhook.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

const FRONTEND_URL = process.env.FRONTEND_URL;
const isProduction = process.env.NODE_ENV === "production";

// behind Render/Railway/etc. there is a reverse proxy in front of us
app.set("trust proxy", 1);

// the webhook must receive the raw body, so it is registered BEFORE express.json()
app.use("/api/webhooks/clerk", express.raw({ type: "application/json" }), clerkWebhook);

app.use(express.json({ limit: "1mb" }));
app.use(cors({ origin: FRONTEND_URL || true, credentials: true }));
app.use(clerkMiddleware());

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// unknown /api route
app.use("/api", (req, res) => res.status(404).json({ message: "Not found" }));

// production: serve the built React app from ./public (the Dockerfile puts it there)
const publicDir = path.join(process.cwd(), "public");

if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));

  // single page app: every other GET returns index.html so client-side routes work on refresh
  app.get("/{*any}", (req, res, next) => {
    // missing files (e.g. an old /assets/x.js) should 404, not return the HTML page
    if (req.path.startsWith("/socket.io/") || path.extname(req.path)) return next();
    res.sendFile(path.join(publicDir, "index.html"), (err) => err && next(err));
  });
}

// central error handler (multer errors, bad JSON, ...)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const tooLarge = err.code === "LIMIT_FILE_SIZE";
  const status = err.status || (tooLarge ? 413 : 400);
  const message = tooLarge ? "File is too large (max 25 MB)" : err.message;
  if (status >= 500) console.error(err);
  res.status(status).json({ message: status >= 500 && isProduction ? "Internal server error" : message });
});

export { app, server };
