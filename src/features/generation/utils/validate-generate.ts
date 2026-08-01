import { MAX_EXCLUDE_WORDS, MAX_MODEL_LENGTH } from "../constants.ts"
import type { GenerateFormErrors, GenerateFormValues } from "../types.ts"

export function parseExcludeWords(raw: string): string[] {
  const seen = new Set<string>()
  for (const part of raw.split(/[,\n]/)) {
    const word = part.trim()
    if (word) seen.add(word)
  }
  return [...seen]
}

export function validateGenerateForm(
  values: GenerateFormValues
): GenerateFormErrors {
  const errors: GenerateFormErrors = {}

  if (values.model.trim().length > MAX_MODEL_LENGTH) {
    errors.model = `Tên model tối đa ${MAX_MODEL_LENGTH} ký tự.`
  }

  if (parseExcludeWords(values.excludeWords).length > MAX_EXCLUDE_WORDS) {
    errors.excludeWords = `Tối đa ${MAX_EXCLUDE_WORDS} từ cần loại trừ.`
  }

  return errors
}

export function hasErrors(errors: GenerateFormErrors): boolean {
  return Object.keys(errors).length > 0
}
