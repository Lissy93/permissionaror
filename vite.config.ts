import { defineConfig } from "vite";
import marko from "@marko/run/vite";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
   plugins: [
    tailwindcss(),
  ],
});
