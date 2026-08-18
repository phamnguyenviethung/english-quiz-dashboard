import { Link, createFileRoute } from "@tanstack/react-router"
import {
  IconAdjustmentsAlt,
  IconArrowRight,
  IconClockBolt,
  IconDatabase,
  IconListDetails,
  IconSparkles,
  IconTags,
} from "@tabler/icons-react"

import { PageHeader } from "@/components/common/page-header.tsx"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { NavPath } from "@/configs/navigation.ts"
import { useTopics } from "@/features/topics/hooks/use-topics.ts"
import { formatNumber } from "@/lib/format.ts"

export const Route = createFileRoute("/_dashboard/")({
  component: OverviewPage,
})

const SHORTCUTS: {
  to: NavPath
  title: string
  description: string
  icon: typeof IconSparkles
}[] = [
  {
    to: "/generate",
    title: "Tạo thử",
    description:
      "Thử prompt và model cho từng loại câu hỏi, xem trước kết quả trước khi đưa vào kho.",
    icon: IconSparkles,
  },
  {
    to: "/config",
    title: "Cấu hình",
    description:
      "Ngưỡng tồn kho, phân bổ loại câu hỏi và cờ bật/tắt các job nền.",
    icon: IconAdjustmentsAlt,
  },
  {
    to: "/cron-runs",
    title: "Lịch sử cron",
    description:
      "Theo dõi các lượt chạy job nền, số câu hỏi sinh ra và lỗi phát sinh.",
    icon: IconClockBolt,
  },
  {
    to: "/metadata",
    title: "Metadata & Health",
    description:
      "Dữ liệu tham chiếu của API và tình trạng hoạt động của dịch vụ.",
    icon: IconListDetails,
  },
]

function ShortcutCard({
  to,
  title,
  description,
  icon: ShortcutIcon,
}: (typeof SHORTCUTS)[number]) {
  return (
    <Card className="transition-colors hover:border-primary/40">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShortcutIcon
              className="size-4 text-muted-foreground"
              stroke={1.5}
            />
            <CardTitle>{title}</CardTitle>
          </div>
          <Link
            to={to}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            Xem
            <IconArrowRight className="size-3.5" stroke={1.5} />
          </Link>
        </div>
        <CardDescription className="mt-1">{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}

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

        {SHORTCUTS.map((shortcut) => (
          <ShortcutCard key={shortcut.to} {...shortcut} />
        ))}
      </div>
    </>
  )
}
