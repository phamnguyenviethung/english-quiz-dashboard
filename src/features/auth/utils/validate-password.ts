// Khớp `minPasswordLength` của Better Auth ở API — đổi một bên phải đổi bên kia.
export const MIN_PASSWORD_LENGTH = 12

export interface ForgotPasswordValues {
  email: string
}

export type ForgotPasswordErrors = Partial<
  Record<keyof ForgotPasswordValues, string>
>

export interface ResetPasswordValues {
  password: string
  confirmPassword: string
}

export type ResetPasswordErrors = Partial<
  Record<keyof ResetPasswordValues, string>
>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateForgotPassword(
  values: ForgotPasswordValues
): ForgotPasswordErrors {
  const errors: ForgotPasswordErrors = {}
  const email = values.email.trim()

  if (!email) {
    errors.email = "Vui lòng nhập email."
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Email không hợp lệ."
  }

  return errors
}

export function validateResetPassword(
  values: ResetPasswordValues
): ResetPasswordErrors {
  const errors: ResetPasswordErrors = {}

  if (!values.password) {
    errors.password = "Vui lòng nhập mật khẩu mới."
  } else if (values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Mật khẩu cần ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Vui lòng nhập lại mật khẩu."
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Mật khẩu nhập lại không khớp."
  }

  return errors
}

export function hasErrors(
  errors: ForgotPasswordErrors | ResetPasswordErrors
): boolean {
  return Object.keys(errors).length > 0
}
