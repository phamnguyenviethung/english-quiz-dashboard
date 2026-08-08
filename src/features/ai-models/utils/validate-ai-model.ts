import type { AiModelFormValues, ProviderFormValues } from "../types.ts"
import { parseAdvancedJson } from "./provider-preferences.ts"

export interface ProviderFormErrors {
  maxPricePrompt?: string
  maxPriceCompletion?: string
  advancedJson?: string
}

export interface AiModelFormErrors {
  key?: string
  modelId?: string
  scheduleProvider?: ProviderFormErrors
  manualProvider?: ProviderFormErrors
}

const KEY_MAX = 64
const MODEL_ID_MAX = 200

function validateMaxPrice(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return "Phải là số không âm."
  }
  return undefined
}

function validateProviderForm(values: ProviderFormValues): ProviderFormErrors {
  const errors: ProviderFormErrors = {}

  const promptError = validateMaxPrice(values.maxPricePrompt)
  if (promptError) errors.maxPricePrompt = promptError

  const completionError = validateMaxPrice(values.maxPriceCompletion)
  if (completionError) errors.maxPriceCompletion = completionError

  const advanced = parseAdvancedJson(values.advancedJson)
  if (!advanced.ok) errors.advancedJson = advanced.message

  return errors
}

function hasProviderErrors(errors: ProviderFormErrors): boolean {
  return Object.keys(errors).length > 0
}

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

  const scheduleErrors = validateProviderForm(values.scheduleProvider)
  if (hasProviderErrors(scheduleErrors))
    errors.scheduleProvider = scheduleErrors

  const manualErrors = validateProviderForm(values.manualProvider)
  if (hasProviderErrors(manualErrors)) errors.manualProvider = manualErrors

  return errors
}

export function hasErrors(errors: AiModelFormErrors): boolean {
  return Object.keys(errors).length > 0
}
