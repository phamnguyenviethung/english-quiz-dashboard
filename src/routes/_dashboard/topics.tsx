import { createFileRoute } from "@tanstack/react-router"
import { IconRefresh, IconTagsOff } from "@tabler/icons-react"

import { PageHeader } from "@/components/common/page-header.tsx"
import { QueryError } from "@/components/common/query-error.tsx"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { CreateTopicDialog } from "@/features/topics/components/create-topic-dialog.tsx"
import { TopicsTable } from "@/features/topics/components/topics-table.tsx"
import { useTopics } from "@/features/topics/hooks/use-topics.ts"

export const Route = createFileRoute("/_dashboard/topics")({
  component: TopicsPage,
})

function TopicsPage() {
  const { topics, isPending, isError, error, refetch, isRefetching } =
    useTopics()

  return (
    <>
      <PageHeader
        title="Chủ đề"
        description="Chủ đề dùng để phân loại câu hỏi khi tạo mới."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => void refetch()}
              disabled={isRefetching}
            >
              <IconRefresh stroke={1.5} data-icon="inline-start" />
              Làm mới
            </Button>
            <CreateTopicDialog />
          </>
        }
      />

      {isError ? (
        <QueryError
          title="Không tải được danh sách chủ đề"
          error={error}
          onRetry={() => void refetch()}
        />
      ) : !isPending && topics.length === 0 ? (
        <Empty className="rounded-2xl border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconTagsOff stroke={1.5} />
            </EmptyMedia>
            <EmptyTitle>Chưa có chủ đề nào</EmptyTitle>
            <EmptyDescription>
              Tạo chủ đề đầu tiên để bắt đầu phân loại câu hỏi theo từng nhóm
              nội dung.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateTopicDialog />
          </EmptyContent>
        </Empty>
      ) : (
        <TopicsTable topics={topics} isPending={isPending} />
      )}
    </>
  )
}
