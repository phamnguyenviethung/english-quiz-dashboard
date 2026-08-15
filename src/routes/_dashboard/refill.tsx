import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { IconBook, IconDatabase } from "@tabler/icons-react"

import { getGetAdminModelsQueryOptions } from "@/apis/admin-models/admin-models.ts"
import { PageHeader } from "@/components/common/page-header.tsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ManualRefillPage } from "@/features/question-pool/components/manual-refill-page.tsx"
import { ReadingRefillPage } from "@/features/readings/components/reading-refill-page.tsx"

const TABS = ["questions", "readings"] as const
type RefillTab = (typeof TABS)[number]

const DEFAULT_TAB: RefillTab = "questions"

interface RefillSearch {
  tab?: RefillTab
}

export const Route = createFileRoute("/_dashboard/refill")({
  validateSearch: (search: Record<string, unknown>): RefillSearch => {
    const tab = TABS.find((value) => value === search.tab)
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
        description="Sinh thêm câu hỏi hoặc bài đọc cho nhiều bucket cùng lúc. Job chạy nền, theo dõi ở màn Lịch sử cron."
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
        <TabsList>
          <TabsTrigger value="questions">
            <IconDatabase stroke={1.5} data-icon="inline-start" />
            Câu hỏi
          </TabsTrigger>
          <TabsTrigger value="readings">
            <IconBook stroke={1.5} data-icon="inline-start" />
            Bài đọc
          </TabsTrigger>
        </TabsList>

        {/* Không đặt `keepMounted`: mỗi panel có một query preview bucket luôn bật,
            giữ mount cả hai sẽ bắn hai request mỗi lần đổi filter. */}
        <TabsContent value="questions" className="pt-4">
          <ManualRefillPage />
        </TabsContent>
        <TabsContent value="readings" className="pt-4">
          <ReadingRefillPage />
        </TabsContent>
      </Tabs>
    </>
  )
}
