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

export function formatOptionCountLabel(count: number): string {
  return `${count} đáp án`
}
