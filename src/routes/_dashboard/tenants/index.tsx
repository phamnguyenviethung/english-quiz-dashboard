import { createFileRoute } from "@tanstack/react-router"
import { IconPlus, IconRefresh, IconUsersGroup } from "@tabler/icons-react"

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
import { TenantFormDialog } from "@/features/tenants/components/tenant-form-dialog.tsx"
import { TenantsTable } from "@/features/tenants/components/tenants-table.tsx"
import { useTenants } from "@/features/tenants/hooks/use-tenants.ts"

export const Route = createFileRoute("/_dashboard/tenants/")({
  component: TenantsPage,
})

const CREATE_TRIGGER = (
  <Button>
    <IconPlus stroke={1.5} data-icon="inline-start" />
    Tạo tenant
  </Button>
)

function TenantsPage() {
  const { tenants, isPending, isError, error, refetch, isRefetching } =
    useTenants()

  return (
    <>
      <PageHeader
        title="Tenant"
        description="Mỗi tenant là một client gọi API. Mở chi tiết để cấp API key và phân quyền chủ đề, dạng quiz."
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
            <TenantFormDialog trigger={CREATE_TRIGGER} />
          </>
        }
      />

      {isError ? (
        <QueryError
          title="Không tải được danh sách tenant"
          error={error}
          onRetry={() => void refetch()}
        />
      ) : !isPending && tenants.length === 0 ? (
        <Empty className="rounded-2xl border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconUsersGroup stroke={1.5} />
            </EmptyMedia>
            <EmptyTitle>Chưa có tenant nào</EmptyTitle>
            <EmptyDescription>
              Tạo tenant đầu tiên để cấp API key cho bot hoặc service gọi vào.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <TenantFormDialog trigger={CREATE_TRIGGER} />
          </EmptyContent>
        </Empty>
      ) : (
        <TenantsTable tenants={tenants} isPending={isPending} />
      )}
    </>
  )
}
