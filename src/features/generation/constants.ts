import type { Icon } from "@tabler/icons-react"
import { IconBookmarks } from "@tabler/icons-react"

import {
  GetEnglishPoolCountEngLevel,
  PostEnglishGenerateByQuizTypeBodyOneOptionCount,
} from "@/apis/model"
import { QUIZ_TYPES, QUIZ_TYPE_META } from "@/features/quiz/constants.ts"

import type {
  GenerateFormValues,
  GenerateOptionCount,
  GenerateQuizType,
} from "./types.ts"
import { READING_QUIZ_TYPE } from "./types.ts"

export { READING_QUIZ_TYPE }

export const GENERATE_TYPE_META: Record<
  GenerateQuizType,
  { label: string; icon: Icon }
> = {
  ...QUIZ_TYPE_META,
  [READING_QUIZ_TYPE]: { label: "Reading", icon: IconBookmarks },
}

export const GENERATE_QUIZ_TYPES: GenerateQuizType[] = [
  ...QUIZ_TYPES,
  READING_QUIZ_TYPE,
]

export const GENERATE_OPTION_COUNTS: GenerateOptionCount[] = [
  PostEnglishGenerateByQuizTypeBodyOneOptionCount.NUMBER_3,
  PostEnglishGenerateByQuizTypeBodyOneOptionCount.NUMBER_4,
  PostEnglishGenerateByQuizTypeBodyOneOptionCount.NUMBER_5,
]

export const NO_TOPIC_VALUE = "none"
export const NO_TOPIC_LABEL = "Không chỉ định"

export const MAX_EXCLUDE_WORDS = 50
export const MAX_MODEL_LENGTH = 120

export const DEFAULT_GENERATE_VALUES: GenerateFormValues = {
  quizType: QUIZ_TYPES[0],
  engLevel: GetEnglishPoolCountEngLevel.A2,
  optionCount: PostEnglishGenerateByQuizTypeBodyOneOptionCount.NUMBER_4,
  topic: "",
  model: "",
  excludeWords: "",
}

export const PART_OF_SPEECH_LABELS: Record<string, string> = {
  noun: "Danh từ",
  verb: "Động từ",
  adjective: "Tính từ",
}

export const QUESTION_TYPE_LABELS: Record<string, string> = {
  synonym: "Đồng nghĩa",
  antonym: "Trái nghĩa",
}

export const DESCRIPTION_LANGUAGE_LABELS: Record<string, string> = {
  vi: "Tiếng Việt",
  en: "Tiếng Anh",
}

export const VERB_USE_FORMAT_LABELS: Record<string, string> = {
  "fill-blank": "Điền vào chỗ trống",
  "phrase-choice": "Chọn cụm từ",
}

export const DISTRACTOR_TACTIC_LABELS: Record<string, string> = {
  SUBSET_AMBIGUITY: "Nhập nhằng tập con",
  TEMPORAL_SHIFT: "Dịch chuyển thời gian",
  CONDITIONAL_EXCLUSION: "Loại trừ có điều kiện",
  UNIT_MISMATCH: "Sai đơn vị",
  PARTIAL_TOTAL: "Nhầm phần với tổng",
  ACCUMULATED_ACTION: "Cộng dồn hành động",
  SEMANTIC_NEGATION: "Phủ định ngữ nghĩa",
  PARALLEL_SELECTIVE: "Song song chọn lọc",
}

export function labelFor(map: Record<string, string>, value: string): string {
  return map[value] ?? value
}
