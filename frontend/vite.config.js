import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";

// In development the API runs on :3000. Proxying keeps everything same-origin,
// so cookies, CORS and websockets just work (no hard-coded URLs in the app).
const API_TARGET = process.env.VITE_DEV_API_TARGET || "http://localhost:3000";

export default defineConfig({
  plugins: [react(), tailwindcss(), babel({ presets: [reactCompilerPreset()] })],
  server: {
    proxy: {
      "/api": { target: API_TARGET, changeOrigin: true },
      "/socket.io": { target: API_TARGET, ws: true, changeOrigin: true },
    },
  },
});
