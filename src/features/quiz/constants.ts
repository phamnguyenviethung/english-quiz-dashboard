import type { Icon } from "@tabler/icons-react"
import {
  IconAbc,
  IconArrowsShuffle,
  IconBlockquote,
  IconBook2,
  IconBubbleText,
  IconExchange,
  IconFileDescription,
  IconMessageChatbot,
  IconMoodSmile,
  IconTextRecognition,
  IconVocabulary,
} from "@tabler/icons-react"

import {
  GetEnglishPoolCountEngLevel,
  GetEnglishPoolCountQuizType,
  PostEnglishPoolFillBodyOneOptionCount,
} from "@/apis/model"

import type { EngLevel, OptionCount, QuizType } from "./types.ts"

export const ENG_LEVELS: EngLevel[] = [
  GetEnglishPoolCountEngLevel.A1,
  GetEnglishPoolCountEngLevel.A2,
  GetEnglishPoolCountEngLevel.B1,
  GetEnglishPoolCountEngLevel.B2,
]

export const OPTION_COUNTS: OptionCount[] = [
  PostEnglishPoolFillBodyOneOptionCount.NUMBER_4,
  PostEnglishPoolFillBodyOneOptionCount.NUMBER_5,
]

export const QUIZ_TYPE_META: Record<QuizType, { label: string; icon: Icon }> = {
  vocab: { label: "Vocabulary", icon: IconVocabulary },
  fillblank: { label: "Fill in the blank", icon: IconTextRecognition },
  phrase: { label: "Phrase", icon: IconAbc },
  conversation: { label: "Conversation", icon: IconMessageChatbot },
  description: { label: "Description", icon: IconFileDescription },
  synonym: { label: "Synonym", icon: IconExchange },
  slang: { label: "Slang", icon: IconMoodSmile },
  "odd-one-out": { label: "Odd one out", icon: IconArrowsShuffle },
  paragraph: { label: "Paragraph", icon: IconBlockquote },
  idiom: { label: "Idiom", icon: IconBubbleText },
  "verb-use-match": { label: "Verb use match", icon: IconBook2 },
}

export const QUIZ_TYPES: QuizType[] = Object.values(GetEnglishPoolCountQuizType)

/** API trả quizType dạng `string` ở nhiều nơi, nên tra cứu phải có fallback. */
export function getQuizTypeLabel(quizType: string): string {
  return Object.hasOwn(QUIZ_TYPE_META, quizType)
    ? QUIZ_TYPE_META[quizType as QuizType].label
    : quizType
}

/** Bản đầy đủ của getQuizTypeLabel, dùng khi cần render icon kèm nhãn (vd: badge trong table). */
export function getQuizTypeMeta(quizType: string): {
  label: string
  icon?: Icon
} {
  return Object.hasOwn(QUIZ_TYPE_META, quizType)
    ? QUIZ_TYPE_META[quizType as QuizType]
    : { label: quizType }
}

export function formatOptionCountLabel(count: number): string {
  return `${count} đáp án`
}

// Màu mang nghĩa thang độ khó (A1 dễ nhất → B2 khó nhất), không phải trang trí.
// Giá trị opacity thấp (~12-15%) để badge không lấn át brand hồng của dashboard.
export const ENG_LEVEL_BADGE_CLASS: Record<EngLevel, string> = {
  A1: "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  A2: "bg-sky-500/12 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
  B1: "bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  B2: "bg-rose-500/12 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
}

/** API trả engLevel dạng `string` ở nhiều nơi, nên tra cứu phải có fallback. */
export function getEngLevelBadgeClass(engLevel: string): string {
  return Object.hasOwn(ENG_LEVEL_BADGE_CLASS, engLevel)
    ? ENG_LEVEL_BADGE_CLASS[engLevel as EngLevel]
    : ""
}

/** Model thường có dạng `provider/name:suffix` (vd `google/gemini-2.5-flash-lite:nitro`). */
export function formatModelName(model: string): {
  provider: string | undefined
  name: string
  suffix: string | undefined
} {
  const [providerAndName, suffix] = model.split(":")
  const slashIndex = providerAndName.lastIndexOf("/")
  if (slashIndex === -1)
    return { provider: undefined, name: providerAndName, suffix }
  return {
    provider: providerAndName.slice(0, slashIndex),
    name: providerAndName.slice(slashIndex + 1),
    suffix,
  }
}
