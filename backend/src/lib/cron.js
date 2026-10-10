import { CronJob } from "cron";
import http from "node:http";
import https from "node:https";

// Free hosting tiers (e.g. Render) put idle services to sleep. Pinging our own public
// /health endpoint every 14 minutes keeps it awake. Needs the public URL of this app.
const job = new CronJob("*/14 * * * *", () => {
  const base = process.env.APP_URL || process.env.RENDER_EXTERNAL_URL || process.env.FRONTEND_URL;
  if (!base) return;

  const url = new URL("/health", base).href;
  const client = url.startsWith("https:") ? https : http;

  client
    .get(url, (res) => {
      console.log(res.statusCode === 200 ? "Keep-alive ping ok" : `Keep-alive ping failed ${res.statusCode}`);
      res.resume();
    })
    .on("error", (e) => console.error("Keep-alive ping error:", e.message));
});

export default job;
