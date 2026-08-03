import { hasValidSession, unauthorized } from "../_lib/session"

// Header của client không được phép forward nguyên trạng: cookie chứa session
// của dashboard (không liên quan tới API), còn lại do runtime tự set lại.
const STRIPPED_REQUEST_HEADERS = new Set([
  "cookie",
  "host",
  "connection",
  "content-length",
  "accept-encoding",
  "x-admin-key",
  "authorization",
])

// fetch đã giải nén body nên giữ content-encoding/length của upstream sẽ sai.
const STRIPPED_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "set-cookie",
])

export default {
  async fetch(request: Request): Promise<Response> {
    const apiBaseUrl = process.env.API_BASE_URL
    const adminKey = process.env.ADMIN_API_KEY
    if (!apiBaseUrl || !adminKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "INTERNAL_ERROR", message: "Server chưa cấu hình API_BASE_URL / ADMIN_API_KEY" },
        }),
        { status: 500, headers: { "content-type": "application/json" } }
      )
    }

    if (!(await hasValidSession(request, process.env.SESSION_SECRET))) {
      return unauthorized()
    }

    const incoming = new URL(request.url)
    const targetPath = incoming.pathname.replace(/^\/api\/proxy/, "")
    const target = `${apiBaseUrl.replace(/\/$/, "")}${targetPath}${incoming.search}`

    const headers = new Headers()
    request.headers.forEach((value, key) => {
      if (!STRIPPED_REQUEST_HEADERS.has(key.toLowerCase())) headers.set(key, value)
    })
    headers.set("x-admin-key", adminKey)

    const hasBody = request.method !== "GET" && request.method !== "HEAD"

    try {
      const upstream = await fetch(target, {
        method: request.method,
        headers,
        body: hasBody ? await request.arrayBuffer() : undefined,
        signal: request.signal,
        redirect: "manual",
      })

      const responseHeaders = new Headers()
      upstream.headers.forEach((value, key) => {
        if (!STRIPPED_RESPONSE_HEADERS.has(key.toLowerCase())) responseHeaders.set(key, value)
      })

      return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: responseHeaders,
      })
    } catch (error) {
      if (request.signal.aborted) return new Response(null, { status: 499 })

      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: `Không kết nối được tới API: ${error instanceof Error ? error.message : "unknown"}`,
          },
        }),
        { status: 502, headers: { "content-type": "application/json" } }
      )
    }
  },
}
