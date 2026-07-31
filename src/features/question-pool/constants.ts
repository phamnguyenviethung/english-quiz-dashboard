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

import type { EngLevel, OptionCount, PoolStatus, QuizType } from "./types.ts"

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

export const POOL_LOW_THRESHOLD = 20

export function getPoolStatus(count: number): PoolStatus {
  if (count <= 0) return "empty"
  if (count < POOL_LOW_THRESHOLD) return "low"
  return "healthy"
}

export const POOL_STATUS_META: Record<
  PoolStatus,
  { label: string; variant: "destructive" | "outline" | "secondary" }
> = {
  empty: { label: "Empty", variant: "destructive" },
  low: { label: "Low", variant: "outline" },
  healthy: { label: "Healthy", variant: "secondary" },
}

export const ALL_TOPICS_VALUE = "all"
export const ALL_TOPICS_LABEL = "Tất cả chủ đề"

export function formatOptionCountLabel(count: number): string {
  return `${count} đáp án`
}

export const PENDING_FILL_POLL_MS = 15_000
export const PENDING_FILL_MAX_MS = 4 * 60_000
