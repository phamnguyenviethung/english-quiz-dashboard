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

const secondsFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 1,
})

const percentFormatter = new Intl.NumberFormat("vi-VN", {
  style: "percent",
  maximumFractionDigits: 1,
})

export function formatDuration(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value))
    return "-"
  if (value < 1000) return `${Math.round(value)} ms`

  const totalSeconds = value / 1000
  if (totalSeconds < 60) return `${secondsFormatter.format(totalSeconds)} s`

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.round(totalSeconds % 60)
  return seconds === 0 ? `${minutes} phút` : `${minutes} phút ${seconds} s`
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value))
    return "-"
  return percentFormatter.format(value)
}
