import { TableSkeletonRows } from "@/components/common/table-skeleton-rows.tsx"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDateTime } from "@/lib/format.ts"

import { API_KEY_STATUS_META } from "../constants.ts"
import type { TenantApiKey } from "../types.ts"
import { RevokeApiKeyDialog } from "./revoke-api-key-dialog.tsx"

const COLUMN_COUNT = 6

export function TenantApiKeysTable({
  apiKeys,
  isPending,
  isRevoking,
  onRevoke,
}: {
  apiKeys: TenantApiKey[]
  isPending: boolean
  isRevoking: boolean
  onRevoke: (apiKeyId: number) => void
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead>Nhãn</TableHead>
            <TableHead className="w-32">Trạng thái</TableHead>
            <TableHead className="w-40">Dùng lần cuối</TableHead>
            <TableHead className="w-40">Tạo lúc</TableHead>
            <TableHead className="w-28" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <TableSkeletonRows columns={COLUMN_COUNT} />
          ) : (
            apiKeys.map((apiKey) => {
              const status =
                API_KEY_STATUS_META[apiKey.isActive ? "active" : "revoked"]

              return (
                <TableRow key={apiKey.id}>
                  <TableCell>
                    <span className="font-mono text-xs text-muted-foreground">
                      #{apiKey.id}
                    </span>
                  </TableCell>
                  <TableCell>
                    {apiKey.label ? (
                      <span className="font-medium text-foreground">
                        {apiKey.label}
                      </span>
                    ) : (
                      <span className="text-xs italic text-muted-foreground">
                        Không có nhãn
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant} className="gap-1.5">
                      <span
                        className={`size-1.5 rounded-full ${
                          apiKey.isActive ? "bg-emerald-500" : "bg-zinc-400"
                        }`}
                      />
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground tabular-nums">
                    {formatDateTime(apiKey.lastUsedAt)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground tabular-nums">
                    {formatDateTime(apiKey.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    {apiKey.isActive ? (
                      <RevokeApiKeyDialog
                        apiKeyId={apiKey.id}
                        label={apiKey.label}
                        disabled={isRevoking}
                        onConfirm={() => onRevoke(apiKey.id)}
                      />
                    ) : null}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
