import { resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const apiUrl = env.VITE_API_URL || "http://localhost:3000";

  return {
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(apiUrl),
    },
    build: {
      outDir: "dist",
      emptyOutDir: false,
      sourcemap: false,
      lib: {
        entry: resolve(__dirname, "src/content.ts"),
        formats: ["iife"],
        name: "HackForImpactContent",
        fileName: () => "content.js",
      },
    },
  };
});
