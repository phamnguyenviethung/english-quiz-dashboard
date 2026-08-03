import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { IconAlertTriangle, IconSchool } from "@tabler/icons-react"

import { LOGIN_API_PATH } from "@/configs/constants.ts"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

export const Route = createFileRoute("/login")({
  component: LoginPage,
})

const FALLBACK_MESSAGE = "Không đăng nhập được, vui lòng thử lại."

function LoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch(LOGIN_API_PATH, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          message?: string
        } | null
        setError(body?.message ?? FALLBACK_MESSAGE)
        return
      }

      // Reload thay vì navigate: cookie phiên vừa được set, cần request mới để
      // các loader chạy lại với phiên hợp lệ.
      window.location.href = "/"
    } catch {
      setError(FALLBACK_MESSAGE)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <IconSchool className="size-5" stroke={1.5} />
          </div>
          <CardTitle>English Quiz</CardTitle>
          <CardDescription>
            Nhập mật khẩu để vào bảng quản trị.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                autoFocus
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {error ? (
              <Alert variant="destructive">
                <IconAlertTriangle className="size-4" stroke={1.5} />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <Button type="submit" disabled={isSubmitting || !password}>
              {isSubmitting ? <Spinner /> : null}
              Đăng nhập
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
