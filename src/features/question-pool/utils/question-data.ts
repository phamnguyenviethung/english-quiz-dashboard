export interface ParsedQuestion {
  prompt?: string
  options?: string[]
  answer?: string
}

export type QuestionDataResult =
  | { kind: "structured"; question: ParsedQuestion; raw: unknown }
  | { kind: "raw"; text: string }

const PROMPT_KEYS = ["question", "prompt", "text", "sentence", "content"]
const ANSWER_KEYS = ["answer", "correctAnswer", "correct", "solution"]
const OPTION_KEYS = ["options", "choices", "answers"]

function pickString(
  source: Record<string, unknown>,
  keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === "string" && value.trim()) return value
    if (typeof value === "number") return String(value)
  }
  return undefined
}

function pickOptions(source: Record<string, unknown>): string[] | undefined {
  for (const key of OPTION_KEYS) {
    const value = source[key]
    if (!Array.isArray(value)) continue

    const options = value.map((entry) => {
      if (typeof entry === "string") return entry
      if (typeof entry === "number") return String(entry)
      if (entry !== null && typeof entry === "object") {
        const record = entry as Record<string, unknown>
        return (
          pickString(record, ["label", "text", "value", "content"]) ??
          JSON.stringify(entry)
        )
      }
      return String(entry)
    })

    if (options.length > 0) return options
  }
  return undefined
}

export function parseQuestionData(raw: string): QuestionDataResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { kind: "raw", text: raw }
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { kind: "raw", text: JSON.stringify(parsed, null, 2) }
  }

  const record = parsed as Record<string, unknown>
  const question: ParsedQuestion = {
    prompt: pickString(record, PROMPT_KEYS),
    options: pickOptions(record),
    answer: pickString(record, ANSWER_KEYS),
  }

  if (!question.prompt && !question.options) {
    return { kind: "raw", text: JSON.stringify(parsed, null, 2) }
  }

  return { kind: "structured", question, raw: parsed }
}
