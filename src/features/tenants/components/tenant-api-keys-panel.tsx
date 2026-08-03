import { IconKey } from "@tabler/icons-react"

import { QueryError } from "@/components/common/query-error.tsx"
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-[65ch] text-sm text-muted-foreground">
          Key có dạng <code className="font-mono">eqk_...</code> và mang đúng
          scope của tenant này. Thu hồi để chặn ngay client đang dùng.
        </p>
        <IssueApiKeyDialog tenantId={tenantId} />
      </div>

      {!isPending && apiKeys.length === 0 ? (
        <Empty className="rounded-2xl border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconKey stroke={1.5} />
            </EmptyMedia>
            <EmptyTitle>Chưa có API key</EmptyTitle>
            <EmptyDescription>
              Tenant chưa gọi được API cho tới khi có ít nhất một key đang hoạt
              động.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <IssueApiKeyDialog tenantId={tenantId} />
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
    </div>
  )
}
