import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Written so prerender-seo.mjs can find the chunk each page compiles to.
    // Without it every prerendered page hydrates into the Suspense fallback
    // while its route's chunk is still being fetched -- the markup that was
    // already on screen is thrown away, the page collapses to a navy band and
    // comes back a third of a second later. That measured 0.19 CLS on every
    // inner page, and it looks exactly as bad as it sounds.
    manifest: true,
  },
  css: {
    // Tailwind v4 runs through its own Vite plugin, so no PostCSS pipeline is
    // needed. An inline (empty) config also stops Vite from walking up and
    // picking up an unrelated postcss.config.js from a parent directory.
    postcss: {},
  },
})
