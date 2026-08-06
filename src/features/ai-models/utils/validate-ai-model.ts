import type { AiModelFormValues } from "../types.ts"

export type AiModelFormErrors = Partial<Record<keyof AiModelFormValues, string>>

const KEY_MAX = 64
const MODEL_ID_MAX = 200

export function validateAiModelForm(
  values: AiModelFormValues
): AiModelFormErrors {
  const errors: AiModelFormErrors = {}
  const key = values.key.trim()
  const modelId = values.modelId.trim()

  if (!key) {
    errors.key = "Vui lòng nhập key."
  } else if (key.length > KEY_MAX) {
    errors.key = `Key tối đa ${KEY_MAX} ký tự.`
  }

  if (!modelId) {
    errors.modelId = "Vui lòng nhập model ID."
  } else if (modelId.length > MODEL_ID_MAX) {
    errors.modelId = `Model ID tối đa ${MODEL_ID_MAX} ký tự.`
  }

  return errors
}

export function hasErrors(errors: AiModelFormErrors): boolean {
  return Object.keys(errors).length > 0
}
