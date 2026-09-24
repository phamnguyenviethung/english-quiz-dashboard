import {
  IconBook,
  IconDatabase,
  IconListCheck,
  IconTags,
} from "@tabler/icons-react"

import { StatTile, StatTileGrid } from "@/components/common/stat-tile.tsx"
import { Skeleton } from "@/components/ui/skeleton"
import { formatNumber, formatPercent } from "@/lib/format.ts"

export function BeginnerOverview({
  isPending,
  beginnerTopicCount,
  topicCount,
  enabledQuizTypeCount,
  quizTypeCount,
  poolFullRatio,
  poolBucketCount,
  readingFullRatio,
  readingBucketCount,
}: {
  isPending: boolean
  beginnerTopicCount: number
  topicCount: number
  enabledQuizTypeCount: number
  quizTypeCount: number
  poolFullRatio: number | null
  poolBucketCount: number
  readingFullRatio: number | null
  readingBucketCount: number
}) {
  if (isPending) {
    return (
      <StatTileGrid className="grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-2xl" />
        ))}
      </StatTileGrid>
    )
  }

  return (
    <StatTileGrid className="grid-cols-2 lg:grid-cols-4">
      <StatTile
        label="Chủ đề cho người mới"
        icon={IconTags}
        value={`${formatNumber(beginnerTopicCount)}/${formatNumber(topicCount)}`}
        hint="Chủ đề đang bật được sinh nội dung A1–B1"
        tone={beginnerTopicCount === 0 ? "danger" : "default"}
      />
      <StatTile
        label="Loại câu cho người mới"
        icon={IconListCheck}
        value={`${formatNumber(enabledQuizTypeCount)}/${formatNumber(quizTypeCount)}`}
        hint="Chỉ tính loại đang bật ở phân bổ chung"
        tone={enabledQuizTypeCount === 0 ? "danger" : "default"}
      />
      <StatTile
        label="Bucket câu hỏi đủ tồn kho"
        icon={IconDatabase}
        value={formatPercent(poolFullRatio)}
        hint={`${formatNumber(poolBucketCount)} bucket beginner`}
        tone={poolFullRatio === null ? "muted" : "default"}
      />
      <StatTile
        label="Bucket bài đọc đủ tồn kho"
        icon={IconBook}
        value={formatPercent(readingFullRatio)}
        hint={`${formatNumber(readingBucketCount)} bucket beginner`}
        tone={readingFullRatio === null ? "muted" : "default"}
      />
    </StatTileGrid>
  )
}
