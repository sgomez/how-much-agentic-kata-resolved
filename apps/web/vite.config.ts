import { PORTS, urlOf } from "@hmk/kit/topology";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: PORTS.web,
    strictPort: true,
    // Phones on the same Wi-Fi can open http://<laptop-ip>:5173 once that host is in HMK_ALLOWED_HOSTS (README).
    host: true,
    // Everything under /api (auth included) goes to the gateway, keeping one origin.
    proxy: { "/api": { target: urlOf("gateway") } },
  },
});
