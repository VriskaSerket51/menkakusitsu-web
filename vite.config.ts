import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

import { compression } from "vite-plugin-compression2";
import generouted from "@generouted/react-router/plugin";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [react(), generouted(), compression()],
});
