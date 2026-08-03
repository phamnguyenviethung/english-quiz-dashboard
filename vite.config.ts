import { defineConfig, loadEnv } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// Dev thay thế cho Vercel function `api/proxy`: forward /api/proxy/* tới API và
// gắn admin key phía Node. Nhờ vậy key không bao giờ đi vào bundle client, dev
// và prod dùng chung baseURL.
const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")

  return {
    resolve: { tsconfigPaths: true },
    plugins: [
      devtools(),
      tailwindcss(),
      tanstackStart({ spa: { enabled: true } }),
      viteReact(),
    ],
    server: {
      proxy: {
        "/api/proxy": {
          target: env.API_BASE_URL || "http://localhost:3399",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/proxy/, ""),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              if (env.ADMIN_API_KEY) {
                proxyReq.setHeader("x-admin-key", env.ADMIN_API_KEY)
              }
            })
          },
        },
      },
    },
  }
})

export default config
