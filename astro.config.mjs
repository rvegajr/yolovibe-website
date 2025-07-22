import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import vercel from "@astrojs/vercel/serverless";

// 🚀 PURE SERVERLESS JOY - Minimal configuration for maximum happiness!
export default defineConfig({
  site: "https://yolovibe-website.vercel.app",
  output: "hybrid", // Enable hybrid rendering for API routes
  adapter: vercel({
    webAnalytics: {
      enabled: true
    },
    functionPerRoute: false
  }),
  integrations: [tailwind(), mdx(), sitemap(), icon()],
  vite: {
    // ✨ Clean, serverless-native build configuration
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
  },
});
