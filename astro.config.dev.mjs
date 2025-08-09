import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";

// 🚀 DEVELOPMENT-ONLY CONFIGURATION
// This configuration bypasses production concerns for local debugging
export default defineConfig({
  site: "http://localhost:6688",
  output: "hybrid", // Enable hybrid rendering for API routes
  server: {
    port: 6688,
    host: true
  },
  // NO VERCEL ADAPTER - This is the key fix for local development
  integrations: [tailwind(), mdx(), sitemap(), icon()],
  vite: {
    // Disable TypeScript checking for development
    esbuild: {
      target: 'esnext'
    },
    // Optimize for development speed
    build: {
      rollupOptions: {
        external: [
          "googleapis", 
          "dotenv",
          "@sendgrid/mail",
          "square"
        ]
      }
    }
  }
}); 