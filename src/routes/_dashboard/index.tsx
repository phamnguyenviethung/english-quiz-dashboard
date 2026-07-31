import { Link, createFileRoute } from "@tanstack/react-router"
import { IconArrowRight, IconDatabase, IconTags } from "@tabler/icons-react"

import { PageHeader } from "@/components/common/page-header.tsx"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useTopics } from "@/features/topics/hooks/use-topics.ts"
import { formatNumber } from "@/lib/format.ts"

export const Route = createFileRoute("/_dashboard/")({
  component: OverviewPage,
})

function OverviewPage() {
  const { topics, isPending, isError } = useTopics()

  return (
    <>
      <PageHeader
        title="Bảng điều khiển"
        description="Theo dõi chủ đề và kho câu hỏi dùng cho bot quiz tiếng Anh."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="transition-colors hover:border-primary/40">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <IconTags
                  className="size-4 text-muted-foreground"
                  stroke={1.5}
                />
                <CardTitle>Chủ đề</CardTitle>
              </div>
              <Link
                to="/topics"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                Xem
                <IconArrowRight className="size-3.5" stroke={1.5} />
              </Link>
            </div>
            {isPending ? (
              <Skeleton className="mt-2 h-9 w-20" />
            ) : (
              <p className="mt-1 text-3xl font-semibold tabular-nums">
                {isError ? "-" : formatNumber(topics.length)}
              </p>
            )}
            <CardDescription>
              {isError
                ? "Không tải được danh sách chủ đề."
                : "Chủ đề đang bật, dùng để phân loại câu hỏi."}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="transition-colors hover:border-primary/40">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <IconDatabase
                  className="size-4 text-muted-foreground"
                  stroke={1.5}
                />
                <CardTitle>Kho câu hỏi</CardTitle>
              </div>
              <Link
                to="/question-pool"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                Xem
                <IconArrowRight className="size-3.5" stroke={1.5} />
              </Link>
            </div>
            <CardDescription className="mt-1">
              Xem số câu hỏi còn lại theo cấp độ và loại câu hỏi, tạo job bổ
              sung khi bucket sắp cạn.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </>
  )
}
