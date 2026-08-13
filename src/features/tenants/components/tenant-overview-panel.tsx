import { Badge } from "@/components/ui/badge"
import { formatDateTime } from "@/lib/format.ts"

import type { Tenant } from "../types.ts"

function DetailRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr] sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  )
}

export function TenantOverviewPanel({ tenant }: { tenant: Tenant }) {
  return (
    <div className="flex flex-col gap-6">
      <dl className="divide-y rounded-2xl border px-4">
        <DetailRow
          label="ID"
          value={<span className="font-mono text-xs">{tenant.id}</span>}
        />
        <DetailRow label="Tên" value={tenant.name} />
        <DetailRow
          label="Mô tả"
          value={
            tenant.description ?? (
              <span className="text-muted-foreground">Chưa có mô tả</span>
            )
          }
        />
        <DetailRow
          label="Phạm vi truy cập"
          value={
            <div className="flex flex-wrap gap-1">
              <Badge variant={tenant.allowAllTopics ? "secondary" : "outline"}>
                {tenant.allowAllTopics
                  ? "Mọi chủ đề"
                  : "Chủ đề theo allow-list"}
              </Badge>
              <Badge
                variant={tenant.allowAllQuizTypes ? "secondary" : "outline"}
              >
                {tenant.allowAllQuizTypes
                  ? "Mọi dạng quiz"
                  : "Dạng quiz theo allow-list"}
              </Badge>
            </div>
          }
        />
        <DetailRow label="Tạo lúc" value={formatDateTime(tenant.createdAt)} />
        <DetailRow
          label="Cập nhật lúc"
          value={formatDateTime(tenant.updatedAt)}
        />
      </dl>

      <p className="max-w-[70ch] text-sm text-muted-foreground">
        Tenant chỉ có quyền đọc quiz (sinh câu hỏi, lấy câu từ pool, đọc chủ đề
        và dạng quiz). Xem hoặc đổi chủ đề / dạng quiz được phép ở tab "Phân
        quyền".
      </p>
    </div>
  )
}
