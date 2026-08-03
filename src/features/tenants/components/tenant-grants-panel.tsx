import { useMemo } from "react"
import { IconInfoCircle } from "@tabler/icons-react"

import { QueryError } from "@/components/common/query-error.tsx"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { QUIZ_TYPES, getQuizTypeLabel } from "@/features/quiz/constants.ts"
import { useTopics } from "@/features/topics/hooks/use-topics.ts"

import {
  useTenantQuizTypeGrants,
  useTenantTopicGrants,
} from "../hooks/use-tenant-grants.ts"
import type { Tenant } from "../types.ts"
import type { GrantOption } from "./grant-picker.tsx"
import { GrantPicker } from "./grant-picker.tsx"

function GrantSection({
  title,
  description,
  bypassed,
  bypassNote,
  children,
}: {
  title: string
  description: string
  bypassed: boolean
  bypassNote: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="space-y-1">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <p className="max-w-[70ch] text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      {bypassed ? (
        <Alert>
          <IconInfoCircle stroke={1.5} />
          <AlertTitle>Allow-list đang bị bỏ qua</AlertTitle>
          <AlertDescription>{bypassNote}</AlertDescription>
        </Alert>
      ) : null}

      {children}
    </section>
  )
}

function TopicGrants({ tenant }: { tenant: Tenant }) {
  const { topics, isPending: isTopicsPending } = useTopics()
  const grants = useTenantTopicGrants(tenant.id)

  const options = useMemo<GrantOption[]>(
    () =>
      topics.map((topic) => ({
        value: String(topic.id),
        label: topic.displayName ?? topic.name,
        hint: topic.name,
      })),
    [topics]
  )

  const value = useMemo(
    () => grants.topicIds.map(String),
    [grants.topicIds]
  )

  if (grants.isError) {
    return (
      <QueryError
        title="Không tải được chủ đề đã cấp"
        error={grants.error}
        onRetry={() => void grants.refetch()}
      />
    )
  }

  return (
    <GrantSection
      title="Chủ đề"
      description="Tenant chỉ lấy được câu hỏi thuộc các chủ đề được tick. Câu hỏi không gắn chủ đề luôn được phép."
      bypassed={tenant.allowAllTopics}
      bypassNote='Tenant đang bật "Cho phép mọi chủ đề" nên truy cập được tất cả, bất kể danh sách dưới đây. Tắt cờ đó trong tab Tổng quan để allow-list có hiệu lực.'
    >
      <GrantPicker
        options={options}
        value={value}
        isLoading={grants.isPending || isTopicsPending}
        isSaving={grants.isSaving}
        emptyLabel="Chưa có chủ đề nào trong hệ thống."
        idPrefix={`tenant-${tenant.id}-topic`}
        onSave={(next) => {
          void grants.saveTopicIds(next.map(Number)).catch(() => {
            // toast đã bắn từ hook
          })
        }}
      />
    </GrantSection>
  )
}

function QuizTypeGrants({ tenant }: { tenant: Tenant }) {
  const grants = useTenantQuizTypeGrants(tenant.id)

  const options = useMemo<GrantOption[]>(
    () =>
      QUIZ_TYPES.map((quizType) => ({
        value: quizType,
        label: getQuizTypeLabel(quizType),
        hint: quizType,
      })),
    []
  )

  if (grants.isError) {
    return (
      <QueryError
        title="Không tải được dạng quiz đã cấp"
        error={grants.error}
        onRetry={() => void grants.refetch()}
      />
    )
  }

  return (
    <GrantSection
      title="Dạng quiz"
      description="Giới hạn dạng câu hỏi tenant được sinh và lấy từ pool."
      bypassed={tenant.allowAllQuizTypes}
      bypassNote='Tenant đang bật "Cho phép mọi dạng quiz" nên dùng được tất cả, bất kể danh sách dưới đây. Tắt cờ đó trong tab Tổng quan để allow-list có hiệu lực.'
    >
      <GrantPicker
        options={options}
        value={grants.quizTypes}
        isLoading={grants.isPending}
        isSaving={grants.isSaving}
        emptyLabel="Không có dạng quiz nào."
        idPrefix={`tenant-${tenant.id}-quiz-type`}
        onSave={(next) => {
          void grants.saveQuizTypes(next).catch(() => {
            // toast đã bắn từ hook
          })
        }}
      />
    </GrantSection>
  )
}

export function TenantGrantsPanel({ tenant }: { tenant: Tenant }) {
  return (
    <div className="flex flex-col gap-8">
      <TopicGrants tenant={tenant} />
      <QuizTypeGrants tenant={tenant} />
    </div>
  )
}
