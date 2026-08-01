import { useMemo } from "react"

import { useGetEnglishTopics } from "@/apis/english-topics/english-topics.ts"
import type { GetEnglishTopics200DataItem } from "@/apis/model"

export type Topic = GetEnglishTopics200DataItem

export function useTopics() {
  const query = useGetEnglishTopics()

  const topics = useMemo(() => {
    const items = query.data?.data ?? []
    return [...items].sort((a, b) => a.name.localeCompare(b.name, "vi"))
  }, [query.data])

  return {
    topics,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  }
}

export function useTopicOptions() {
  const { topics, isPending, isError } = useTopics()

  const items = useMemo(() => {
    const record: Record<string, string> = {}
    for (const topic of topics) {
      record[String(topic.id)] = topic.displayName ?? topic.name
    }
    return record
  }, [topics])

  return { topics, items, isPending, isError }
}

export function useTopicNameOptions() {
  const { topics, isPending, isError } = useTopics()

  const items = useMemo(() => {
    const record: Record<string, string> = {}
    for (const topic of topics) {
      record[topic.name] = topic.displayName ?? topic.name
    }
    return record
  }, [topics])

  return { topics, items, isPending, isError }
}
