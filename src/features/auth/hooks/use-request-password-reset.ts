import { useState } from "react"

import { authClient } from "@/configs/authClient.ts"

const GENERIC_MESSAGE = "Không gửi được yêu cầu, vui lòng thử lại."
const RATE_LIMIT_MESSAGE =
  "Bạn thử lại quá nhiều lần, đợi một phút rồi thử lại."

export function useRequestPasswordReset() {
  const [isPending, setIsPending] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestReset = async (email: string) => {
    setIsPending(true)
    setError(null)
    try {
      // redirectTo phải nằm trong TRUSTED_ORIGINS của API, nếu không bị originCheck chặn.
      const { error: requestError } = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (requestError) {
        setError(
          requestError.status === 429
            ? RATE_LIMIT_MESSAGE
            : (requestError.message ?? GENERIC_MESSAGE)
        )
        return
      }
      setIsSent(true)
    } catch {
      setError(GENERIC_MESSAGE)
    } finally {
      setIsPending(false)
    }
  }

  return { requestReset, isPending, isSent, error }
}
