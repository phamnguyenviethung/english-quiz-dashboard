import { createFileRoute, redirect } from "@tanstack/react-router"

import { isAdminSession, sessionQueryOptions } from "@/configs/authClient.ts"
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form.tsx"

export const Route = createFileRoute("/forgot-password")({
  beforeLoad: async ({ context }) => {
    const session =
      await context.queryClient.ensureQueryData(sessionQueryOptions)
    if (isAdminSession(session)) throw redirect({ to: "/" })
  },
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <ForgotPasswordForm />
    </main>
  )
}
