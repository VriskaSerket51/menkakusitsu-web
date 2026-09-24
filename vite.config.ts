import { defineConfig } from "vite";
import { compression } from "vite-plugin-compression2";
import { reactRouter } from "@react-router/dev/vite";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [reactRouter(), compression()],
});
