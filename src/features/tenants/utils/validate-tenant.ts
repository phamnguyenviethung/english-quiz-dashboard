import type { TenantFormValues } from "../types.ts"

export type TenantFormErrors = Partial<Record<keyof TenantFormValues, string>>

const NAME_MIN = 2
const NAME_MAX = 64
const DESCRIPTION_MAX = 500

export function validateTenantForm(values: TenantFormValues): TenantFormErrors {
  const errors: TenantFormErrors = {}
  const name = values.name.trim()

  if (!name) {
    errors.name = "Vui lòng nhập tên tenant."
  } else if (name.length < NAME_MIN) {
    errors.name = `Tên tenant cần ít nhất ${NAME_MIN} ký tự.`
  } else if (name.length > NAME_MAX) {
    errors.name = `Tên tenant tối đa ${NAME_MAX} ký tự.`
  }

  if (values.description.trim().length > DESCRIPTION_MAX) {
    errors.description = `Mô tả tối đa ${DESCRIPTION_MAX} ký tự.`
  }

  return errors
}

export function hasErrors(errors: TenantFormErrors): boolean {
  return Object.keys(errors).length > 0
}
