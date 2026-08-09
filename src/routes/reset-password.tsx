import { createFileRoute } from "@tanstack/react-router"

import { ResetPasswordForm } from "@/features/auth/components/reset-password-form.tsx"

interface ResetPasswordSearch {
  token?: string
  error?: string
}

// Không redirect khi đã có session: người dùng vẫn có quyền đặt lại mật khẩu
// từ link trong mail dù đang đăng nhập ở tab khác.
export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => ({
    token: typeof search.token === "string" ? search.token : undefined,
    error: search.error === "INVALID_TOKEN" ? "INVALID_TOKEN" : undefined,
  }),
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const search = Route.useSearch()

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <ResetPasswordForm
        token={search.token}
        tokenError={search.error === "INVALID_TOKEN"}
      />
    </main>
  )
}
