import { useState } from "react"
import { IconAlertTriangle, IconBrandGoogle } from "@tabler/icons-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"

import { useSignIn } from "../hooks/use-sign-in.ts"

interface LoginFormProps {
  onSuccess: () => void
  initialError?: string
}

export function LoginForm({ onSuccess, initialError }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const { signInWithEmail, signInWithGoogle, pendingMethod, isPending, error } =
    useSignIn({ onSuccess })

  const message = error ?? initialError

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void signInWithEmail(email, password)
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Đăng nhập</CardTitle>
        <CardDescription>
          Bảng quản trị English Quiz — chỉ dành cho tài khoản admin.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {message ? (
          <Alert variant="destructive">
            <IconAlertTriangle stroke={1.5} />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}

        <form
          className="flex flex-col gap-6"
          onSubmit={handleSubmit}
          noValidate
        >
          <Field>
            <FieldLabel htmlFor="login-email">Email</FieldLabel>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isPending}
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="login-password">Mật khẩu</FieldLabel>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isPending}
              required
            />
          </Field>

          <Button type="submit" disabled={isPending}>
            {pendingMethod === "email" ? (
              <Spinner data-icon="inline-start" />
            ) : null}
            Đăng nhập
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">hoặc</span>
          <Separator className="flex-1" />
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => void signInWithGoogle()}
        >
          {pendingMethod === "google" ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <IconBrandGoogle stroke={1.5} data-icon="inline-start" />
          )}
          Đăng nhập với Google
        </Button>
      </CardContent>
    </Card>
  )
}
