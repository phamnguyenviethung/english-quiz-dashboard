// Session cookie ký HMAC-SHA256, không cần dependency ngoài. Payload chỉ là
// timestamp hết hạn — dashboard chỉ có một "user" duy nhất nên không cần lưu gì
// thêm. Thư mục `_lib` có prefix `_` nên Vercel không deploy thành route.

const COOKIE_NAME = "eq_session"
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7

export const AUTH_REQUIRED_HEADER = "x-dashboard-auth"

function encoder() {
  return new TextEncoder()
}

function base64url(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes))
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

async function hmac(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const signature = await crypto.subtle.sign("HMAC", key, encoder().encode(payload))
  return base64url(signature)
}

// So sánh constant-time để không rò rỉ thông tin qua thời gian phản hồi.
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export async function createSessionCookie(secret: string): Promise<string> {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000
  const payload = String(expiresAt)
  const value = `${payload}.${await hmac(payload, secret)}`

  return `${COOKIE_NAME}=${value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${MAX_AGE_SECONDS}`
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`
}

function readCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null
  for (const part of cookieHeader.split(";")) {
    const [rawKey, ...rest] = part.split("=")
    if (rawKey.trim() === name) return rest.join("=").trim()
  }
  return null
}

export async function hasValidSession(
  request: Request,
  secret: string | undefined
): Promise<boolean> {
  if (!secret) return false

  const raw = readCookie(request.headers.get("cookie"), COOKIE_NAME)
  if (!raw) return false

  const separator = raw.lastIndexOf(".")
  if (separator <= 0) return false

  const payload = raw.slice(0, separator)
  const signature = raw.slice(separator + 1)

  const expiresAt = Number(payload)
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false

  return safeEqual(signature, await hmac(payload, secret))
}

export function unauthorized(): Response {
  return new Response(
    JSON.stringify({ success: false, error: { code: "UNAUTHORIZED", message: "Phiên đăng nhập không hợp lệ" } }),
    {
      status: 401,
      headers: {
        "content-type": "application/json",
        // Đánh dấu 401 do phiên dashboard, phân biệt với 401 do API backend trả
        // về — client dựa vào header này để quyết định có redirect /login không.
        [AUTH_REQUIRED_HEADER]: "required",
      },
    }
  )
}
