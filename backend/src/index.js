import "dotenv/config";

import { connectDB } from "./lib/db.js";
import job from "./lib/cron.js";

function requireEnv(...names) {
  const missing = names.filter((n) => !process.env[n]);
  if (missing.length) {
    console.error("Missing required environment variables:", missing.join(", "));
    process.exit(1);
  }
}

// fail fast with a clear message BEFORE loading the app (Clerk needs its keys at import time)
requireEnv("CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY");
if (!process.env.MONGO_URI && !process.env.MONGO_URL) requireEnv("MONGO_URI");

const { server } = await import("./app.js");

const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";

try {
  await connectDB();
} catch (error) {
  console.error("MongoDB connection error:", error.message);
  process.exit(1);
}

server.listen(PORT, () => {
  console.log(`Server is up and running on PORT ${PORT}`);
  if (isProduction) job.start();
});

function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  job.stop();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
