import { useState } from "react"

import {
  authClient,
  clearSessionToken,
  isAdminSession,
} from "@/configs/authClient.ts"

const NOT_ADMIN_MESSAGE =
  "Tài khoản này không có quyền admin. Liên hệ quản trị viên để được cấp quyền."
const GENERIC_MESSAGE = "Đăng nhập thất bại, vui lòng thử lại."

type SignInMethod = "email" | "google"

interface UseSignInOptions {
  onSuccess: () => void
}

export function useSignIn({ onSuccess }: UseSignInOptions) {
  const [pendingMethod, setPendingMethod] = useState<SignInMethod | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Đăng nhập thành công vẫn có thể là user thường (signup mở, role mặc định
  // "user"). Không phải admin thì thu hồi phiên ngay để không kẹt vòng redirect.
  const assertAdmin = async () => {
    const { data } = await authClient.getSession()
    if (isAdminSession(data ?? null)) return true

    await authClient.signOut()
    clearSessionToken()
    setError(NOT_ADMIN_MESSAGE)
    return false
  }

  const signInWithEmail = async (email: string, password: string) => {
    setPendingMethod("email")
    setError(null)
    try {
      const { error: signInError } = await authClient.signIn.email({
        email,
        password,
      })
      if (signInError) {
        setError(signInError.message ?? GENERIC_MESSAGE)
        return
      }
      if (await assertAdmin()) onSuccess()
    } catch {
      setError(GENERIC_MESSAGE)
    } finally {
      setPendingMethod(null)
    }
  }

  const signInWithGoogle = async () => {
    setPendingMethod("google")
    setError(null)
    try {
      const { error: popupError } = await authClient.signIn.popup({
        provider: "google",
      })
      if (popupError) {
        setError(popupError.message || GENERIC_MESSAGE)
        return
      }
      if (await assertAdmin()) onSuccess()
    } catch {
      setError(GENERIC_MESSAGE)
    } finally {
      setPendingMethod(null)
    }
  }

  return {
    signInWithEmail,
    signInWithGoogle,
    pendingMethod,
    isPending: pendingMethod !== null,
    error,
    setError,
  }
}
