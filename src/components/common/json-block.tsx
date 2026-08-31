import { cn } from "@/lib/utils"

function stringify(value: unknown): string {
  if (typeof value === "string") return value
  if (value === undefined) return "undefined"
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export function JsonBlock({
  value,
  className,
  scroll = true,
}: {
  value: unknown
  className?: string
  /** `false` = không bọc vùng cuộn riêng (tránh bẫy cuộn khi đã nằm trong trang cuộn được). */
  scroll?: boolean
}) {
  return (
    <pre
      className={cn(
        "rounded-2xl bg-muted p-3 text-xs",
        scroll
          ? "max-h-64 overflow-auto"
          : "wrap-break-word whitespace-pre-wrap",
        className
      )}
    >
      {stringify(value)}
    </pre>
  )
}

export function CollapsibleJson({
  label,
  value,
  className,
}: {
  label: string
  value: unknown
  className?: string
}) {
  return (
    <details className={className}>
      <summary className="cursor-pointer text-xs text-muted-foreground select-none hover:text-foreground">
        {label}
      </summary>
      <JsonBlock value={value} className="mt-2" />
    </details>
  )
}
