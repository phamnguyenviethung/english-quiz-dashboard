import { useState } from "react"
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import {
  IconArrowLeft,
  IconCheck,
  IconCopy,
  IconKey,
  IconPencil,
  IconShieldCheck,
} from "@tabler/icons-react"

import { QueryError } from "@/components/common/query-error.tsx"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/toast"
import { TenantApiKeysPanel } from "@/features/tenants/components/tenant-api-keys-panel.tsx"
import { TenantFormDialog } from "@/features/tenants/components/tenant-form-dialog.tsx"
import { TenantGrantsPanel } from "@/features/tenants/components/tenant-grants-panel.tsx"
import { TenantStatusToggle } from "@/features/tenants/components/tenant-status-toggle.tsx"
import { useTenantApiKeys } from "@/features/tenants/hooks/use-tenant-api-keys.ts"
import {
  useTenantQuizTypeGrants,
  useTenantTopicGrants,
} from "@/features/tenants/hooks/use-tenant-grants.ts"
import { useTenant } from "@/features/tenants/hooks/use-tenant.ts"
import { copyText } from "@/lib/clipboard.ts"
import { formatDateTime } from "@/lib/format.ts"

const TABS = ["keys", "grants"] as const
type TenantTab = (typeof TABS)[number]

interface TenantDetailSearch {
  tab?: TenantTab
}

export const Route = createFileRoute("/_dashboard/tenants/$tenantId")({
  validateSearch: (search: Record<string, unknown>): TenantDetailSearch => {
    const tab = TABS.find((value) => value === search.tab)
    return tab ? { tab } : {}
  },
  component: TenantDetailPage,
})

function TenantDetailPage() {
  const { tenantId } = Route.useParams()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const id = Number(tenantId)
  const { tenant, isPending, isError, error, refetch } = useTenant(id)
  const { apiKeys } = useTenantApiKeys(id)
  const { topicIds } = useTenantTopicGrants(id)
  const { quizTypes } = useTenantQuizTypeGrants(id)

  const [idCopied, setIdCopied] = useState(false)
  const activeTab = search.tab ?? "keys"

  const handleCopyId = async () => {
    if (!tenant) return
    const ok = await copyText(String(tenant.id))
    if (ok) {
      setIdCopied(true)
      toast.add({
        type: "info",
        title: "Đã sao chép ID",
        description: `ID tenant #${tenant.id} đã được lưu vào clipboard.`,
      })
      setTimeout(() => setIdCopied(false), 2000)
    }
  }

  const handleTabChange = (tab: TenantTab) => {
    void navigate({
      search: {
        tab: tab === "keys" ? undefined : tab,
      },
      replace: true,
    })
  }

  const backButton = (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1 text-muted-foreground hover:text-foreground"
      onClick={() => void navigate({ to: "/tenants", search: {} })}
    >
      <IconArrowLeft stroke={1.5} className="size-4" data-icon="inline-start" />
      Danh sách tenant
    </Button>
  )

  if (isError) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          {backButton}
        </div>
        <QueryError
          title="Không tải được thông tin tenant"
          error={error}
          onRetry={() => void refetch()}
        />
      </div>
    )
  }

  if (isPending || !tenant) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          {backButton}
        </div>
        <Card className="flex flex-col gap-4 rounded-3xl border p-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-48 rounded-xl" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-4 w-72" />
        </Card>
        <Skeleton className="h-10 w-80 rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    )
  }

  const activeKeysCount = apiKeys.filter((k) => k.isActive).length

  return (
    <div className="flex flex-col gap-6">
      {/* Top Bar: Breadcrumbs & Fast Back */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Breadcrumb className="text-xs">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                render={
                  <Link to="/tenants" search={{}} className="hover:text-foreground">
                    Danh sách tenant
                  </Link>
                }
              />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-foreground">
                {tenant.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center self-start sm:self-auto">
          {backButton}
        </div>
      </div>

      {/* Hero Header Card */}
      <Card className="relative overflow-hidden rounded-3xl border bg-card/70 p-5 sm:p-6 backdrop-blur-xs shadow-xs">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          {/* Tenant Identity & Details */}
          <div className="flex flex-col gap-3 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {tenant.name}
              </h1>

              {/* Status Pill Badge */}
              <Badge
                variant={tenant.isActive ? "secondary" : "outline"}
                className={`gap-1.5 py-1 px-2.5 text-xs font-medium ${
                  tenant.isActive
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-zinc-500/30 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    tenant.isActive ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"
                  }`}
                />
                {tenant.isActive ? "Đang hoạt động" : "Đã tắt"}
              </Badge>

              {/* 1-Click Copyable ID */}
              <button
                type="button"
                onClick={handleCopyId}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 font-mono text-xs text-muted-foreground transition-all hover:border-primary/40 hover:bg-background hover:text-foreground"
                title="Nhấn để sao chép Tenant ID"
              >
                <span>#{tenant.id}</span>
                {idCopied ? (
                  <IconCheck className="size-3 text-emerald-500" />
                ) : (
                  <IconCopy className="size-3" />
                )}
              </button>
            </div>

            {/* Description */}
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {tenant.description ? (
                tenant.description
              ) : (
                <span className="italic text-muted-foreground/70">
                  Chưa có mô tả cho client này.
                </span>
              )}
            </p>

            {/* Access Scope Tags & Meta */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-muted-foreground text-[11px]">Chế độ:</span>
              <Badge
                variant={tenant.allowAllTopics ? "secondary" : "outline"}
                className="text-[11px] font-normal"
              >
                {tenant.allowAllTopics
                  ? "Mọi chủ đề"
                  : `Chủ đề: ${topicIds.length} được cấp`}
              </Badge>
              <Badge
                variant={tenant.allowAllQuizTypes ? "secondary" : "outline"}
                className="text-[11px] font-normal"
              >
                {tenant.allowAllQuizTypes
                  ? "Mọi dạng quiz"
                  : `Dạng quiz: ${quizTypes.length} được cấp`}
              </Badge>
              <span className="text-muted-foreground/40 text-[11px]">•</span>
              <span className="text-muted-foreground text-[11px]">
                Tạo lúc: {formatDateTime(tenant.createdAt)}
              </span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0 shrink-0">
            <TenantFormDialog
              tenant={tenant}
              trigger={
                <Button variant="outline" className="h-9 gap-1.5 text-xs sm:text-sm">
                  <IconPencil
                    stroke={1.5}
                    className="size-4"
                    data-icon="inline-start"
                  />
                  Sửa tenant
                </Button>
              }
            />
            <TenantStatusToggle tenant={tenant} />
          </div>
        </div>
      </Card>

      {/* Tabs Layout */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => handleTabChange(val as TenantTab)}
        className="flex flex-col gap-6"
      >
        <div className="overflow-x-auto pb-1">
          <TabsList className="h-11 rounded-2xl bg-muted/60 p-1">
            <TabsTrigger
              value="keys"
              className="gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-medium"
            >
              <IconKey
                stroke={1.5}
                className="size-4"
                data-icon="inline-start"
              />
              API key
              <span className="ml-0.5 rounded-full bg-muted-foreground/15 px-1.5 py-0.2 text-[10px] font-semibold text-foreground">
                {activeKeysCount}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="grants"
              className="gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-medium"
            >
              <IconShieldCheck
                stroke={1.5}
                className="size-4"
                data-icon="inline-start"
              />
              Phân quyền
              <span className="ml-0.5 rounded-full bg-muted-foreground/15 px-1.5 py-0.2 text-[10px] font-semibold text-foreground">
                {tenant.allowAllTopics && tenant.allowAllQuizTypes
                  ? "Tất cả"
                  : `${topicIds.length + quizTypes.length}`}
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="keys">
          <TenantApiKeysPanel tenantId={tenant.id} />
        </TabsContent>

        <TabsContent value="grants">
          <TenantGrantsPanel tenant={tenant} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
