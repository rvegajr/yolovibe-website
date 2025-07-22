import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
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
    // Ensure Node 18 compatibility
    define: {
      'process.env.NODE_VERSION': '"18"'
    },
    build: {
      rollupOptions: {
        external: [
          "bcrypt", 
          "googleapis", 
          "dotenv",
          "@sendgrid/mail",
          "square"
        ]
      }
    }
  },
});
