import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { IconAlertTriangle } from "@tabler/icons-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

import { useResetPassword } from "../hooks/use-reset-password.ts"
import {
  hasErrors,
  MIN_PASSWORD_LENGTH,
  validateResetPassword,
} from "../utils/validate-password.ts"
import type {
  ResetPasswordErrors,
  ResetPasswordValues,
} from "../utils/validate-password.ts"

const EMPTY_VALUES: ResetPasswordValues = { password: "", confirmPassword: "" }

const INVALID_TOKEN_MESSAGE =
  "Link không hợp lệ, đã hết hạn hoặc đã được dùng. Hãy yêu cầu link mới."

interface ResetPasswordFormProps {
  token?: string
  tokenError?: boolean
}

export function ResetPasswordForm({
  token,
  tokenError,
}: ResetPasswordFormProps) {
  const [values, setValues] = useState(EMPTY_VALUES)
  const [errors, setErrors] = useState<ResetPasswordErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const { resetPassword, isPending, error } = useResetPassword(token)

  const isTokenMissing = tokenError || !token

  const updateValue = (key: keyof ResetPasswordValues, value: string) => {
    const nextValues = { ...values, [key]: value }
    setValues(nextValues)
    if (submitted) setErrors(validateResetPassword(nextValues))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)

    const nextErrors = validateResetPassword(values)
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return

    void resetPassword(values.password)
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Đặt lại mật khẩu</CardTitle>
        <CardDescription>
          Chọn mật khẩu mới cho tài khoản quản trị của bạn.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {isTokenMissing ? (
          <>
            <Alert variant="destructive">
              <IconAlertTriangle stroke={1.5} />
              <AlertDescription>{INVALID_TOKEN_MESSAGE}</AlertDescription>
            </Alert>
            <Link
              to="/forgot-password"
              className="text-center text-sm text-muted-foreground hover:text-foreground"
            >
              Yêu cầu link mới
            </Link>
          </>
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
              <Field data-invalid={Boolean(errors.password)}>
                <FieldLabel htmlFor="reset-password">Mật khẩu mới</FieldLabel>
                <Input
                  id="reset-password"
                  type="password"
                  autoComplete="new-password"
                  value={values.password}
                  onChange={(event) =>
                    updateValue("password", event.target.value)
                  }
                  aria-invalid={Boolean(errors.password)}
                  disabled={isPending}
                />
                <FieldDescription>
                  Tối thiểu {MIN_PASSWORD_LENGTH} ký tự.
                </FieldDescription>
                <FieldError
                  errors={[
                    errors.password ? { message: errors.password } : undefined,
                  ]}
                />
              </Field>

              <Field data-invalid={Boolean(errors.confirmPassword)}>
                <FieldLabel htmlFor="reset-confirm-password">
                  Xác nhận mật khẩu
                </FieldLabel>
                <Input
                  id="reset-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={values.confirmPassword}
                  onChange={(event) =>
                    updateValue("confirmPassword", event.target.value)
                  }
                  aria-invalid={Boolean(errors.confirmPassword)}
                  disabled={isPending}
                />
                <FieldError
                  errors={[
                    errors.confirmPassword
                      ? { message: errors.confirmPassword }
                      : undefined,
                  ]}
                />
              </Field>

              <Button type="submit" disabled={isPending}>
                {isPending ? <Spinner data-icon="inline-start" /> : null}
                Đặt lại mật khẩu
              </Button>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  )
}
