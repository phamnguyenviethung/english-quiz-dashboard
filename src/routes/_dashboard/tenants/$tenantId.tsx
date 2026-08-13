import { createFileRoute, useNavigate } from "@tanstack/react-router"
import {
  IconArrowLeft,
  IconKey,
  IconPencil,
  IconShieldCheck,
  IconUserSquare,
} from "@tabler/icons-react"

import { PageHeader } from "@/components/common/page-header.tsx"
import { QueryError } from "@/components/common/query-error.tsx"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TenantApiKeysPanel } from "@/features/tenants/components/tenant-api-keys-panel.tsx"
import { TenantFormDialog } from "@/features/tenants/components/tenant-form-dialog.tsx"
import { TenantGrantsPanel } from "@/features/tenants/components/tenant-grants-panel.tsx"
import { TenantOverviewPanel } from "@/features/tenants/components/tenant-overview-panel.tsx"
import { TenantStatusToggle } from "@/features/tenants/components/tenant-status-toggle.tsx"
import { TENANT_STATUS_META } from "@/features/tenants/constants.ts"
import { useTenant } from "@/features/tenants/hooks/use-tenant.ts"

const TABS = ["overview", "keys", "grants"] as const
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
  const activeTab = search.tab ?? "overview"

  const backButton = (
    <Button
      variant="ghost"
      onClick={() => void navigate({ to: "/tenants", search: {} })}
    >
      <IconArrowLeft stroke={1.5} data-icon="inline-start" />
      Danh sách tenant
    </Button>
  )

  if (isError) {
    return (
      <>
        <PageHeader title="Tenant" actions={backButton} />
        <QueryError
          title="Không tải được tenant"
          error={error}
          onRetry={() => void refetch()}
        />
      </>
    )
  }

  if (isPending || !tenant) {
    return (
      <>
        <PageHeader title="Tenant" actions={backButton} />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </>
    )
  }

  const status = TENANT_STATUS_META[tenant.isActive ? "active" : "inactive"]

  return (
    <>
      <PageHeader
        title={tenant.name}
        description={tenant.description ?? undefined}
        actions={
          <>
            {backButton}
            <TenantFormDialog
              tenant={tenant}
              trigger={
                <Button variant="outline">
                  <IconPencil stroke={1.5} data-icon="inline-start" />
                  Sửa tenant
                </Button>
              }
            />
            <TenantStatusToggle tenant={tenant} />
          </>
        }
      />

      <div className="flex items-center gap-2">
        <Badge variant={status.variant}>{status.label}</Badge>
        <span className="font-mono text-xs text-muted-foreground">
          ID {tenant.id}
        </span>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          void navigate({
            search: {
              tab: value === "overview" ? undefined : (value as TenantTab),
            },
            replace: true,
          })
        }
      >
        <TabsList>
          <TabsTrigger value="overview">
            <IconUserSquare stroke={1.5} data-icon="inline-start" />
            Tổng quan
          </TabsTrigger>
          <TabsTrigger value="keys">
            <IconKey stroke={1.5} data-icon="inline-start" />
            API key
          </TabsTrigger>
          <TabsTrigger value="grants">
            <IconShieldCheck stroke={1.5} data-icon="inline-start" />
            Phân quyền
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-4">
          <TenantOverviewPanel tenant={tenant} />
        </TabsContent>
        <TabsContent value="keys" className="pt-4">
          <TenantApiKeysPanel tenantId={tenant.id} />
        </TabsContent>
        <TabsContent value="grants" className="pt-4">
          <TenantGrantsPanel tenant={tenant} />
        </TabsContent>
      </Tabs>
    </>
  )
}
