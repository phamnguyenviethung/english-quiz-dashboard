import type {
  GetEnglishTopicsRandomPairs200DataItemItem0,
  GetEnglishTopicsRandomPairs200DataItemItem1,
} from "@/apis/model"

export type TopicPair = [
  GetEnglishTopicsRandomPairs200DataItemItem0,
  GetEnglishTopicsRandomPairs200DataItemItem1,
]

export interface QuizTypeDiff {
  inSync: boolean
  /** API có nhưng hằng phía UI chưa khai báo. */
  missingLocally: string[]
  /** UI khai báo nhưng API không còn trả về. */
  missingRemotely: string[]
}
