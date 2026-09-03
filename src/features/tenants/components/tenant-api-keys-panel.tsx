import { IconKey, IconPlus } from "@tabler/icons-react"

import { QueryError } from "@/components/common/query-error.tsx"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

import {
  useRevokeApiKey,
  useTenantApiKeys,
} from "../hooks/use-tenant-api-keys.ts"
import { IssueApiKeyDialog } from "./issue-api-key-dialog.tsx"
import { TenantApiKeysTable } from "./tenant-api-keys-table.tsx"

export function TenantApiKeysPanel({ tenantId }: { tenantId: number }) {
  const { apiKeys, isPending, isError, error, refetch } =
    useTenantApiKeys(tenantId)
  const { revokeApiKey, isPending: isRevoking } = useRevokeApiKey(tenantId)

  const handleRevoke = (apiKeyId: number) => {
    void revokeApiKey(apiKeyId).catch(() => {
      // toast đã bắn từ hook
    })
  }

  const activeCount = apiKeys.filter((k) => k.isActive).length

  if (isError) {
    return (
      <QueryError
        title="Không tải được danh sách API key"
        error={error}
        onRetry={() => void refetch()}
      />
    )
  }

  return (
    <Card className="rounded-3xl border shadow-xs">
      <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <IconKey className="size-5" stroke={1.5} />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg font-semibold">
                Quản lý API Key
              </CardTitle>
              {!isPending && apiKeys.length > 0 ? (
                <Badge variant="outline" className="text-[11px]">
                  {activeCount} / {apiKeys.length} đang hoạt động
                </Badge>
              ) : null}
            </div>
            <CardDescription className="max-w-[70ch]">
              Key có tiền tố <code className="font-mono text-xs font-semibold text-foreground">eqk_...</code>,
              dùng xác thực trong header HTTP Bearer. Thu hồi sẽ ngay lập tức chặn client tương ứng.
            </CardDescription>
          </div>
        </div>

        <IssueApiKeyDialog
          tenantId={tenantId}
          trigger={
            <Button className="shrink-0">
              <IconPlus stroke={1.5} data-icon="inline-start" />
              Cấp API key
            </Button>
          }
        />
      </CardHeader>

      <CardContent>
        {!isPending && apiKeys.length === 0 ? (
          <Empty className="rounded-2xl border border-dashed py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconKey stroke={1.5} />
              </EmptyMedia>
              <EmptyTitle>Chưa có API key nào</EmptyTitle>
              <EmptyDescription className="max-w-md">
                Tenant chưa thể gửi request tới các API endpoint cho đến khi bạn tạo ít nhất một API key đang hoạt động.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <IssueApiKeyDialog
                tenantId={tenantId}
                trigger={
                  <Button>
                    <IconPlus stroke={1.5} data-icon="inline-start" />
                    Cấp API key đầu tiên
                  </Button>
                }
              />
            </EmptyContent>
          </Empty>
        ) : (
          <TenantApiKeysTable
            apiKeys={apiKeys}
            isPending={isPending}
            isRevoking={isRevoking}
            onRevoke={handleRevoke}
          />
        )}
      </CardContent>
    </Card>
  )
}
