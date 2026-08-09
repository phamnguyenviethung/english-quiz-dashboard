import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { IconAlertTriangle, IconMailCheck } from "@tabler/icons-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

import { useRequestPasswordReset } from "../hooks/use-request-password-reset.ts"
import {
  hasErrors,
  validateForgotPassword,
} from "../utils/validate-password.ts"
import type { ForgotPasswordErrors } from "../utils/validate-password.ts"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState<ForgotPasswordErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const { requestReset, isPending, isSent, error } = useRequestPasswordReset()

  const updateEmail = (value: string) => {
    setEmail(value)
    if (submitted) setErrors(validateForgotPassword({ email: value }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)

    const nextErrors = validateForgotPassword({ email })
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return

    void requestReset(email.trim())
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Quên mật khẩu</CardTitle>
        <CardDescription>
          Nhập email tài khoản, chúng tôi sẽ gửi link đặt lại mật khẩu.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {isSent ? (
          <Alert>
            <IconMailCheck stroke={1.5} />
            <AlertDescription>
              Nếu email tồn tại trong hệ thống, link đặt lại mật khẩu đã được
              gửi. Link có hiệu lực 15 phút.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {error ? (
              <Alert variant="destructive">
                <IconAlertTriangle stroke={1.5} />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <form
              className="flex flex-col gap-6"
              onSubmit={handleSubmit}
              noValidate
            >
              <Field data-invalid={Boolean(errors.email)}>
                <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
                <Input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(event) => updateEmail(event.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  disabled={isPending}
                />
                <FieldError
                  errors={[
                    errors.email ? { message: errors.email } : undefined,
                  ]}
                />
              </Field>

              <Button type="submit" disabled={isPending}>
                {isPending ? <Spinner data-icon="inline-start" /> : null}
                Gửi link đặt lại
              </Button>
            </form>
          </>
        )}

        <Link
          to="/login"
          className="text-center text-sm text-muted-foreground hover:text-foreground"
        >
          Quay lại đăng nhập
        </Link>
      </CardContent>
    </Card>
  )
}
