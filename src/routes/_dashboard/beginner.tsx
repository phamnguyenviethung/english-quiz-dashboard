import { useMemo } from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import {
  IconChartGridDots,
  IconListCheck,
  IconPlus,
  IconRefresh,
  IconTags,
} from "@tabler/icons-react"

import { getGetAdminPoolBucketsQueryOptions } from "@/apis/admin-pool/admin-pool.ts"
import { getGetAdminReadingsBucketsQueryOptions } from "@/apis/admin-readings/admin-readings.ts"
import { getGetEnglishConfigQueryOptions } from "@/apis/english-config/english-config.ts"
import { getGetEnglishTopicsQueryOptions } from "@/apis/english-topics/english-topics.ts"
import { PageHeader } from "@/components/common/page-header.tsx"
import { QueryError } from "@/components/common/query-error.tsx"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BeginnerCoverageMatrix } from "@/features/beginner/components/beginner-coverage-matrix.tsx"
import { BeginnerOverview } from "@/features/beginner/components/beginner-overview.tsx"
import { BeginnerQuizTypesPanel } from "@/features/beginner/components/beginner-quiz-types-panel.tsx"
import { BeginnerTopicsPanel } from "@/features/beginner/components/beginner-topics-panel.tsx"
import { useBeginnerHub } from "@/features/beginner/hooks/use-beginner-hub.ts"

export const Route = createFileRoute("/_dashboard/beginner")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.prefetchQuery(getGetEnglishTopicsQueryOptions()),
      context.queryClient.prefetchQuery(getGetEnglishConfigQueryOptions()),
      context.queryClient.prefetchQuery(
        getGetAdminPoolBucketsQueryOptions({
          audience: "beginner",
          scope: "all",
        })
      ),
      context.queryClient.prefetchQuery(
        getGetAdminReadingsBucketsQueryOptions({
          audience: "beginner",
          scope: "all",
        })
      ),
    ]),
  component: BeginnerHubPage,
})

function BeginnerHubPage() {
  const hub = useBeginnerHub()

  const topicsById = useMemo(
    () => new Map(hub.topics.map((topic) => [topic.id, topic])),
    [hub.topics]
  )
  const effectiveQuizTypeCount = hub.quizTypes.filter(
    (item) => item.enabled && !item.globallyDisabled
  ).length

  return (
    <>
      <PageHeader
        title="Người mới bắt đầu"
        description="Nội dung dành cho người mới học: tối đa B1, 4 đáp án, từ vựng thường ngày. Chọn chủ đề, loại câu và theo dõi độ phủ kho câu hỏi, bài đọc."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => void hub.refetch()}
              disabled={hub.isRefetching}
            >
              <IconRefresh stroke={1.5} data-icon="inline-start" />
              Làm mới
            </Button>
            <Button
              render={<Link to="/refill" search={{ audience: "beginner" }} />}
            >
              <IconPlus stroke={1.5} data-icon="inline-start" />
              Sinh nội dung
            </Button>
          </>
        }
      />

      {hub.isError ? (
        <QueryError
          title="Không tải được dữ liệu người mới"
          error={hub.error}
          onRetry={() => void hub.refetch()}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <BeginnerOverview
            isPending={hub.isPending}
            beginnerTopicCount={hub.beginnerTopics.length}
            topicCount={hub.topics.length}
            enabledQuizTypeCount={effectiveQuizTypeCount}
            quizTypeCount={hub.quizTypes.length}
            poolFullRatio={hub.poolFullRatio}
            poolBucketCount={hub.poolBucketCount}
            readingFullRatio={hub.readingFullRatio}
            readingBucketCount={hub.readingBucketCount}
          />

          <div className="grid gap-4 xl:grid-cols-2 xl:items-start">
            <Card>
              <CardHeader>
                <CardTitle>
                  <IconTags stroke={1.5} data-icon="inline-start" />
                  Chủ đề cho người mới
                </CardTitle>
                <CardDescription>
                  Bật chủ đề để cron sinh câu hỏi và bài đọc A1–B1 riêng cho
                  người mới. Tắt chỉ dừng sinh mới, nội dung đã có vẫn giữ.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BeginnerTopicsPanel
                  topics={hub.topics}
                  isPending={hub.isPending}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <IconListCheck stroke={1.5} data-icon="inline-start" />
                  Loại câu cho người mới
                </CardTitle>
                <CardDescription>
                  Chỉ loại vừa bật ở đây vừa đang bật ở phân bổ chung mới được
                  sinh và phục vụ cho người mới.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BeginnerQuizTypesPanel
                  quizTypes={hub.quizTypes}
                  isPending={hub.isPending}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                <IconChartGridDots stroke={1.5} data-icon="inline-start" />
                Độ phủ nội dung người mới
              </CardTitle>
              <CardDescription>
                Tồn kho so với mục tiêu theo từng chủ đề và cấp độ. Bấm "Bổ
                sung" để mở màn sinh hàng loạt với bộ lọc sẵn.
              </CardDescription>
              <CardAction>
                <Button
                  variant="ghost"
                  size="sm"
                  render={
                    <Link
                      to="/refill"
                      search={{ tab: "readings", audience: "beginner" }}
                    />
                  }
                >
                  Sinh bài đọc
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <BeginnerCoverageMatrix
                rows={hub.coverage}
                topicsById={topicsById}
                isPending={hub.isPending}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
