import { useState } from "react"

import { authClient, clearSessionToken } from "@/configs/authClient.ts"
import { toast } from "@/components/ui/toast"

const GENERIC_MESSAGE = "Không đặt lại được mật khẩu, vui lòng thử lại."
const INVALID_TOKEN_MESSAGE =
  "Link đã hết hạn hoặc đã dùng rồi. Hãy yêu cầu link mới."
const RATE_LIMIT_MESSAGE =
  "Bạn thử lại quá nhiều lần, đợi một phút rồi thử lại."

export function useResetPassword(token: string | undefined) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetPassword = async (newPassword: string) => {
    if (!token) {
      setError(INVALID_TOKEN_MESSAGE)
      return
    }

    setIsPending(true)
    setError(null)
    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword,
        token,
      })
      if (resetError) {
        if (resetError.code === "INVALID_TOKEN") {
          setError(INVALID_TOKEN_MESSAGE)
        } else if (resetError.status === 429) {
          setError(RATE_LIMIT_MESSAGE)
        } else {
          setError(resetError.message ?? GENERIC_MESSAGE)
        }
        return
      }

      // Server đã thu hồi mọi phiên cũ, token đang giữ ở localStorage cũng vô nghĩa.
      clearSessionToken()
      toast.add({
        type: "success",
        title: "Đã đổi mật khẩu",
        description: "Đăng nhập lại bằng mật khẩu mới.",
      })
      window.location.replace("/login")
    } catch {
      setError(GENERIC_MESSAGE)
    } finally {
      setIsPending(false)
    }
  }

  return { resetPassword, isPending, error, setError }
}
