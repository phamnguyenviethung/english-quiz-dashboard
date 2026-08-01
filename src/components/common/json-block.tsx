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
}: {
  value: unknown
  className?: string
}) {
  return (
    <pre
      className={cn(
        "max-h-64 overflow-auto rounded-2xl bg-muted p-3 text-xs",
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
