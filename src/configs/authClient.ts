import { createAuthClient } from "better-auth/react"
import {
  POPUP_TOKEN_STORAGE_KEY,
  adminClient,
  getStoredPopupToken,
  oauthPopupClient,
} from "better-auth/client/plugins"
import { queryOptions } from "@tanstack/react-query"

import { env } from "./env.ts"

export const ADMIN_ROLE = "admin"

// Cùng key với oauth-popup plugin: flow Google tự ghi token vào đây, flow
// email/password ghi từ header `set-auth-token`. Một nguồn duy nhất cho axios.
export function getSessionToken(): string | null {
  return getStoredPopupToken()
}

function setSessionToken(token: string) {
  try {
    window.localStorage.setItem(POPUP_TOKEN_STORAGE_KEY, token)
  } catch {
    /* localStorage bị chặn — vẫn còn cookie làm fallback */
  }
}

export function clearSessionToken() {
  try {
    window.localStorage.removeItem(POPUP_TOKEN_STORAGE_KEY)
  } catch {
    /* no-op */
  }
}

export const authClient = createAuthClient({
  baseURL: env.apiBaseUrl,
  plugins: [adminClient(), oauthPopupClient()],
  fetchOptions: {
    credentials: "include",
    auth: {
      type: "Bearer",
      token: () => getSessionToken() ?? undefined,
    },
    onSuccess: (ctx) => {
      const token = ctx.response.headers.get("set-auth-token")
      if (token) setSessionToken(token)
    },
  },
})

export type Session = Awaited<ReturnType<typeof authClient.getSession>>["data"]

export const sessionQueryOptions = queryOptions({
  queryKey: ["auth", "session"],
  queryFn: async (): Promise<Session> => {
    if (!getSessionToken()) return null
    const { data } = await authClient.getSession()
    return data ?? null
  },
  staleTime: 5 * 60_000,
  retry: false,
})

export function isAdminSession(session: Session): boolean {
  return session?.user.role === ADMIN_ROLE
}
