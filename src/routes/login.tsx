import { createFileRoute, redirect } from "@tanstack/react-router"

import { isAdminSession, sessionQueryOptions } from "@/configs/authClient.ts"
import { LoginForm } from "@/features/auth/components/login-form.tsx"

const FORBIDDEN_MESSAGE =
  "Tài khoản này không có quyền admin. Liên hệ quản trị viên để được cấp quyền."

interface LoginSearch {
  redirect?: string
  error?: string
}

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect:
      typeof search.redirect === "string" && search.redirect.startsWith("/")
        ? search.redirect
        : undefined,
    error: search.error === "forbidden" ? "forbidden" : undefined,
  }),
  beforeLoad: async ({ context }) => {
    const session =
      await context.queryClient.ensureQueryData(sessionQueryOptions)
    if (isAdminSession(session)) throw redirect({ to: "/" })
  },
  component: LoginPage,
})

function LoginPage() {
  const search = Route.useSearch()

  // Reload thay vì navigate: mọi loader chạy lại với token vừa lưu, và replace
  // để nút Back không quay về màn đăng nhập.
  const handleSuccess = () => {
    window.location.replace(search.redirect ?? "/")
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <LoginForm
        onSuccess={handleSuccess}
        initialError={search.error ? FORBIDDEN_MESSAGE : undefined}
      />
    </main>
  )
}
