import { createFileRoute, useNavigate } from "@tanstack/react-router"
import {
  IconBook,
  IconCopyPlus,
  IconDatabase,
  IconHelpCircle,
} from "@tabler/icons-react"

import { getGetAdminModelsQueryOptions } from "@/apis/admin-models/admin-models.ts"
import { PageHeader } from "@/components/common/page-header.tsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ManualRefillPage } from "@/features/question-pool/components/manual-refill-page.tsx"
import { SiblingRefillPage } from "@/features/question-pool/components/sibling-refill-page.tsx"
import { ReadingQuestionRefillPage } from "@/features/reading-questions/components/reading-question-refill-page.tsx"
import { ReadingRefillPage } from "@/features/readings/components/reading-refill-page.tsx"

const REFILL_TABS = [
  { value: "questions", label: "Câu hỏi", icon: IconDatabase },
  { value: "siblings", label: "Câu tương tự", icon: IconCopyPlus },
  { value: "readings", label: "Bài đọc", icon: IconBook },
  {
    value: "reading-questions",
    label: "Câu hỏi đọc hiểu",
    icon: IconHelpCircle,
  },
] as const

type RefillTab = (typeof REFILL_TABS)[number]["value"]

const DEFAULT_TAB: RefillTab = "questions"

interface RefillSearch {
  tab?: RefillTab
}

export const Route = createFileRoute("/_dashboard/refill")({
  validateSearch: (search: Record<string, unknown>): RefillSearch => {
    const tab = REFILL_TABS.some((item) => item.value === search.tab)
      ? (search.tab as RefillTab)
      : undefined
    // Tab mặc định không đẩy vào URL để `/refill` luôn là URL chuẩn của nó.
    return tab && tab !== DEFAULT_TAB ? { tab } : {}
  },
  loader: ({ context }) =>
    context.queryClient.prefetchQuery(getGetAdminModelsQueryOptions()),
  component: RefillPage,
})

function RefillPage() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const activeTab = search.tab ?? DEFAULT_TAB

  return (
    <>
      <PageHeader
        title="Sinh hàng loạt"
        description="Sinh thêm câu hỏi, bài đọc hoặc câu hỏi đọc hiểu cho nhiều bucket cùng lúc. Job chạy nền, theo dõi ở màn Lịch sử cron."
      />

      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          void navigate({
            search: {
              tab: value === DEFAULT_TAB ? undefined : (value as RefillTab),
            },
            replace: true,
          })
        }
      >
        <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsList className="h-10 w-max shrink-0 p-1 sm:w-fit">
            {REFILL_TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="gap-2 px-3.5 py-1.5 text-xs font-medium shrink-0 sm:text-sm"
                >
                  <Icon stroke={1.5} data-icon="inline-start" />
                  {tab.label}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        {/* Không đặt `keepMounted`: mỗi panel có một query preview bucket luôn bật,
            giữ mount cả hai sẽ bắn hai request mỗi lần đổi filter. */}
        <TabsContent value="questions" className="pt-4">
          <ManualRefillPage />
        </TabsContent>
        <TabsContent value="siblings" className="pt-4">
          <SiblingRefillPage />
        </TabsContent>
        <TabsContent value="readings" className="pt-4">
          <ReadingRefillPage />
        </TabsContent>
        <TabsContent value="reading-questions" className="pt-4">
          <ReadingQuestionRefillPage />
        </TabsContent>
      </Tabs>
    </>
  )
}
