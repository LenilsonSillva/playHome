import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "react",
        replacement: path.resolve(__dirname, "node_modules", "react"),
      },
      {
        find: "react-dom",
        replacement: path.resolve(__dirname, "node_modules", "react-dom"),
      },
    ],
  },
});
