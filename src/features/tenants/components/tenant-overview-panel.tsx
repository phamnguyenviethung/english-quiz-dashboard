import { IconAlertTriangle } from "@tabler/icons-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { formatDateTime } from "@/lib/format.ts"

import { SCOPE_OPTIONS, isKnownScope } from "../constants.ts"
import type { Tenant } from "../types.ts"

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr] sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  )
}

export function TenantOverviewPanel({ tenant }: { tenant: Tenant }) {
  const granted = new Set(tenant.scopes)
  const unknownScopes = tenant.scopes.filter(
    (scope) => scope.trim().length > 0 && !isKnownScope(scope)
  )

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
                {tenant.allowAllTopics ? "Mọi chủ đề" : "Chủ đề theo allow-list"}
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

      <section className="flex flex-col gap-3">
        <div className="space-y-1">
          <h2 className="text-base font-semibold tracking-tight">Scopes</h2>
          <p className="max-w-[70ch] text-sm text-muted-foreground">
            Endpoint ngoài scope đã cấp sẽ trả 403. Bấm "Sửa tenant" để thay đổi.
          </p>
        </div>

        <ul className="divide-y rounded-2xl border px-4">
          {SCOPE_OPTIONS.map((option) => (
            <li
              key={option.value}
              className="flex items-center justify-between gap-4 py-3"
            >
              <div className="grid gap-0.5">
                <span className="text-sm font-medium">{option.label}</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {option.value}
                </span>
              </div>
              <Badge
                variant={granted.has(option.value) ? "secondary" : "outline"}
              >
                {granted.has(option.value) ? "Đã cấp" : "Chưa cấp"}
              </Badge>
            </li>
          ))}
        </ul>

        {unknownScopes.length > 0 ? (
          <Alert variant="destructive">
            <IconAlertTriangle stroke={1.5} />
            <AlertTitle>Scope không xác định</AlertTitle>
            <AlertDescription>
              Tenant đang giữ {unknownScopes.join(", ")}. Backend không dùng các
              giá trị này, mở "Sửa tenant" và lưu lại để dọn.
            </AlertDescription>
          </Alert>
        ) : null}
      </section>
    </div>
  )
}
