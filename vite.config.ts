import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { seoFilesPlugin } from "./vite-plugin-seo.ts"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  for (const key of [
    "VITE_SITE_URL",
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY",
  ] as const) {
    if (env[key]) process.env[key] = env[key]
  }

  return {
    plugins: [react(), tailwindcss(), seoFilesPlugin()],
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: "react-vendor",
                test: /node_modules[\\/](react|react-dom|react-router|react-router-dom)([\\/]|$)/,
              },
              {
                name: "query-vendor",
                test: /node_modules[\\/]@tanstack[\\/]/,
              },
              {
                name: "supabase-vendor",
                test: /node_modules[\\/]@supabase[\\/]/,
              },
              {
                name: "lucide-vendor",
                test: /node_modules[\\/]lucide-react([\\/]|$)/,
              },
            ],
          },
        },
      },
    },
  }
})
