import type {
  PostEnglishGenerateByQuizType200Data,
  PostEnglishGenerateByQuizTypeBodyOneOptionCount,
  PostEnglishGenerateReading200Data,
} from "@/apis/model"
import type { EngLevel, QuizType } from "@/features/quiz/types.ts"

export const READING_QUIZ_TYPE = "reading"

export type GenerateQuizType = QuizType | typeof READING_QUIZ_TYPE
export type GenerateOptionCount =
  PostEnglishGenerateByQuizTypeBodyOneOptionCount

export type GeneratedQuestionData =
  PostEnglishGenerateByQuizType200Data | PostEnglishGenerateReading200Data

export interface GeneratedOption {
  text: string
  isCorrect: boolean
  translation?: string
  explanation?: string
}

export interface GeneratedContextBlock {
  kind: "sentence" | "paragraph" | "dialogue" | "prose"
  label: string
  lines: string[]
  translation?: string
  highlight?: string
}

export interface GeneratedMetaItem {
  label: string
  value: string
}

export interface GeneratedUsage {
  inputTokens: number
  outputTokens: number
  model: string
}

export interface GeneratedQuestionView {
  quizType: GenerateQuizType
  promptLabel: string
  prompt: string
  contextBlocks: GeneratedContextBlock[]
  options: GeneratedOption[]
  explanation?: string
  example?: { sentence: string; translation?: string }
  meta: GeneratedMetaItem[]
  usage?: GeneratedUsage
  raw: unknown
}

export interface GenerateFormValues {
  quizType: GenerateQuizType
  engLevel: EngLevel
  optionCount: GenerateOptionCount
  topic: string
  model: string
  excludeWords: string
  /** Sinh bằng prompt người mới (≤ B1, ≤ 4 đáp án). Không áp dụng cho reading. */
  forBeginner: boolean
}

export type GenerateFormErrors = Partial<
  Record<keyof GenerateFormValues, string>
>
