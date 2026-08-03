import { clearSessionCookie, createSessionCookie, safeEqual } from "./_lib/session"

function json(body: unknown, status: number, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  })
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "DELETE") {
      return json({ success: true }, 200, { "set-cookie": clearSessionCookie() })
    }

    if (request.method !== "POST") {
      return json({ success: false, message: "Method not allowed" }, 405)
    }

    const password = process.env.DASHBOARD_PASSWORD
    const secret = process.env.SESSION_SECRET
    if (!password || !secret) {
      return json(
        { success: false, message: "Server chưa cấu hình DASHBOARD_PASSWORD / SESSION_SECRET" },
        500
      )
    }

    let provided: unknown
    try {
      provided = ((await request.json()) as { password?: unknown }).password
    } catch {
      return json({ success: false, message: "Body không hợp lệ" }, 400)
    }

    if (typeof provided !== "string" || !safeEqual(provided, password)) {
      return json({ success: false, message: "Mật khẩu không đúng" }, 401)
    }

    return json({ success: true }, 200, { "set-cookie": await createSessionCookie(secret) })
  },
}
