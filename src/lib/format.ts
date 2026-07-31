const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

const numberFormatter = new Intl.NumberFormat("vi-VN")

export function formatDateTime(
  value: string | number | null | undefined
): string {
  if (value === null || value === undefined || value === "") return "-"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"

  return dateTimeFormatter.format(date)
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "-"
  return numberFormatter.format(value)
}
