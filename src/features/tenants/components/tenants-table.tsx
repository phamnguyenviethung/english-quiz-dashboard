import { useNavigate } from "@tanstack/react-router"

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

import { TENANT_STATUS_META } from "../constants.ts"
import type { Tenant } from "../types.ts"

const COLUMN_COUNT = 5

function AccessCell({ tenant }: { tenant: Tenant }) {
  if (!tenant.allowAllTopics && !tenant.allowAllQuizTypes) {
    return (
      <span className="text-xs text-muted-foreground">Theo allow-list</span>
    )
  }

  return (
    <div className="flex flex-wrap gap-1">
      {tenant.allowAllTopics ? (
        <Badge variant="ghost" className="font-normal">
          Mọi chủ đề
        </Badge>
      ) : null}
      {tenant.allowAllQuizTypes ? (
        <Badge variant="ghost" className="font-normal">
          Mọi dạng quiz
        </Badge>
      ) : null}
    </div>
  )
}

export function TenantsTable({
  tenants,
  isPending,
}: {
  tenants: Tenant[]
  isPending: boolean
}) {
  const navigate = useNavigate()

  return (
    <div className="overflow-x-auto rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead>Tên</TableHead>
            <TableHead className="w-44">Phạm vi truy cập</TableHead>
            <TableHead className="w-32">Trạng thái</TableHead>
            <TableHead className="w-40">Tạo lúc</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <TableSkeletonRows columns={COLUMN_COUNT} />
          ) : (
            tenants.map((tenant) => {
              const status =
                TENANT_STATUS_META[tenant.isActive ? "active" : "inactive"]

              return (
                <TableRow
                  key={tenant.id}
                  className="cursor-pointer"
                  onClick={() =>
                    void navigate({
                      to: "/tenants/$tenantId",
                      params: { tenantId: String(tenant.id) },
                    })
                  }
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {tenant.id}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{tenant.name}</div>
                    {tenant.description ? (
                      <div className="max-w-[36ch] truncate text-xs text-muted-foreground">
                        {tenant.description}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <AccessCell tenant={tenant} />
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground tabular-nums">
                    {formatDateTime(tenant.createdAt)}
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
