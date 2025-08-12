import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"
import path from "path"


// ✅ Custom plugin to modify cache key
const customCacheKeyPlugin = {
  cacheKeyWillBeUsed: async ({ request }: { request: Request }) => {
    return `${request.url}?version=1`
  },
}

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "masked-icon.svg",
      ],
      manifest: {
        name: "Medicare Nepal - AI Health Assistant",
        short_name: "Medicare Nepal",
        description:
          "AI-powered health diagnosis and medicine scanner for Nepal",
        theme_color: "#00f5ff",
        background_color: "#0a0a0a",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        categories: ["health", "medical", "utilities"],
        lang: "en",
        dir: "ltr",
      },
      workbox: {
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}",
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.medicare-nepal\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 365 days
              },
              // ✅ Instead of putting here, we use plugins
              plugins: [customCacheKeyPlugin],
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
    hmr: {
      overlay: false, // Disable the HMR overlay for error messages
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: ["framer-motion", "lucide-react"],
          charts: ["recharts"],
          i18n: ["react-i18next", "i18next"],
        },
      },
    },
  },
  define: {
    global: "globalThis",
  },
})
