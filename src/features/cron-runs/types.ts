import type {
  GetEnglishCronRuns200DataItem,
  GetEnglishCronRunsByRunId200Data,
  GetEnglishCronRunsByRunId200DataAttemptsItem,
  GetEnglishCronRunsByRunId200DataBucketsItem,
} from "@/apis/model"

export type CronRun = GetEnglishCronRuns200DataItem
export type CronRunDetail = GetEnglishCronRunsByRunId200Data
export type CronRunBucket = GetEnglishCronRunsByRunId200DataBucketsItem
export type CronRunAttempt = GetEnglishCronRunsByRunId200DataAttemptsItem
