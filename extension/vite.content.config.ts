import { resolve } from "node:path";
import { defineConfig } from "vite";

const apiUrl = process.env.VITE_API_URL ?? "https://hack-for-impact.vercel.app";

export default defineConfig({
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
});
