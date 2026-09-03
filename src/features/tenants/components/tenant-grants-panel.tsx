import { useMemo } from "react"
import {
  IconAlertTriangle,
  IconBook,
  IconCategory,
  IconPencil,
} from "@tabler/icons-react"

import { QueryError } from "@/components/common/query-error.tsx"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { QUIZ_TYPES, getQuizTypeLabel } from "@/features/quiz/constants.ts"
import {
  formatTopicLabel,
  useTopics,
} from "@/features/topics/hooks/use-topics.ts"

import {
  useTenantQuizTypeGrants,
  useTenantTopicGrants,
} from "../hooks/use-tenant-grants.ts"
import type { Tenant } from "../types.ts"
import type { GrantOption } from "./grant-picker.tsx"
import { GrantPicker } from "./grant-picker.tsx"
import { TenantFormDialog } from "./tenant-form-dialog.tsx"

function GrantSection({
  icon,
  title,
  description,
  badge,
  bypassed,
  bypassNote,
  tenant,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  badge: React.ReactNode
  bypassed: boolean
  bypassNote: string
  tenant: Tenant
  children: React.ReactNode
}) {
  return (
    <Card className="rounded-3xl border shadow-xs">
      <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {icon}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              {badge}
            </div>
            <CardDescription className="max-w-[70ch]">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {bypassed ? (
          <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200">
            <IconAlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <AlertTitle className="text-sm font-semibold">
                  Allow-list đang bị bỏ qua
                </AlertTitle>
                <AlertDescription className="text-xs text-amber-800 dark:text-amber-300">
                  {bypassNote}
                </AlertDescription>
              </div>
              <TenantFormDialog
                tenant={tenant}
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 shrink-0 text-xs border-amber-500/40 bg-background/80 hover:bg-background"
                  >
                    <IconPencil
                      stroke={1.5}
                      className="size-3.5"
                      data-icon="inline-start"
                    />
                    Đổi cài đặt
                  </Button>
                }
              />
            </div>
          </Alert>
        ) : null}

        {children}
      </CardContent>
    </Card>
  )
}

function TopicGrants({ tenant }: { tenant: Tenant }) {
  const { topics, isPending: isTopicsPending } = useTopics()
  const grants = useTenantTopicGrants(tenant.id)

  const options = useMemo<GrantOption[]>(
    () =>
      topics.map((topic) => ({
        value: String(topic.id),
        label: formatTopicLabel(topic),
        hint: topic.name,
      })),
    [topics]
  )

  const value = useMemo(() => grants.topicIds.map(String), [grants.topicIds])

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
      icon={<IconBook className="size-5" stroke={1.5} />}
      title="Phân quyền chủ đề"
      description="Giới hạn câu hỏi tenant được lấy theo chủ đề. Câu hỏi không gắn chủ đề luôn được phép truy cập."
      badge={
        <Badge
          variant={tenant.allowAllTopics ? "secondary" : "outline"}
          className="text-[11px]"
        >
          {tenant.allowAllTopics
            ? "Mọi chủ đề (Bỏ qua)"
            : `${grants.topicIds.length}/${topics.length} chủ đề`}
        </Badge>
      }
      bypassed={tenant.allowAllTopics}
      bypassNote='Tenant đang bật "Cho phép mọi chủ đề" nên truy cập được tất cả. Tắt cờ này để danh sách allow-list bên dưới có hiệu lực.'
      tenant={tenant}
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
      icon={<IconCategory className="size-5" stroke={1.5} />}
      title="Phân quyền dạng quiz"
      description="Giới hạn các dạng câu hỏi mà client của tenant được sinh hoặc lấy từ question pool."
      badge={
        <Badge
          variant={tenant.allowAllQuizTypes ? "secondary" : "outline"}
          className="text-[11px]"
        >
          {tenant.allowAllQuizTypes
            ? "Mọi dạng quiz (Bỏ qua)"
            : `${grants.quizTypes.length}/${QUIZ_TYPES.length} dạng quiz`}
        </Badge>
      }
      bypassed={tenant.allowAllQuizTypes}
      bypassNote='Tenant đang bật "Cho phép mọi dạng quiz" nên được gọi tất cả. Tắt cờ này để danh sách allow-list bên dưới có hiệu lực.'
      tenant={tenant}
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
    <div className="flex flex-col gap-6">
      <TopicGrants tenant={tenant} />
      <QuizTypeGrants tenant={tenant} />
    </div>
  )
}
