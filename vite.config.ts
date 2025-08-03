import { defineConfig } from "vite";
import marko from "@marko/run/vite";
import tailwindcss from '@tailwindcss/vite'
import netlify from '@marko/run-adapter-netlify';

export default defineConfig({
   plugins: [
    tailwindcss(),
    marko({
      adapter: netlify({ edge: true }),
    }),
  ],
  // ssr: { noExternal: true }
});
