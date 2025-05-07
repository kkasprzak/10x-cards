// @ts-check
import { defineConfig, envField } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap(), tailwind()],
  server: { port: 3000 },
  adapter: cloudflare({
    imageService: "compile",
  }),
  experimental: {
    session: true,
  },
  env: {
    schema: {
      // Supabase configuration (server-side secrets)
      SUPABASE_URL: envField.string({
        context: "server",
        access: "secret",
      }),
      SUPABASE_KEY: envField.string({
        context: "server",
        access: "secret",
      }),

      // OpenRouter configuration (server-side secret)
      OPENROUTER_API_KEY: envField.string({
        context: "server",
        access: "secret",
      }),
    },
  },
  vite: {
    ssr: {
      external: ["crypto"],
    },
  },
});
