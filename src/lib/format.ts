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

// Chi phí AI thường rất nhỏ (1 lượt gọi ~ $0.0024) nên 2 chữ số thập phân sẽ làm
// tròn về $0.00. Dùng en-US để ra ký hiệu "$" quen thuộc thay vì "US$" của vi-VN.
const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const usdSmallFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
})

/**
 * null/undefined = chưa tính được chi phí (model không có giá cache) → "-".
 * Khác hẳn 0 = có gọi thật nhưng model free, phải hiển thị "$0.00".
 */
export function formatUsd(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value))
    return "-"
  return value !== 0 && Math.abs(value) < 0.01
    ? usdSmallFormatter.format(value)
    : usdFormatter.format(value)
}

/**
 * Giá model lưu theo USD/token (vd 1e-7) — không đọc được trong bảng. OpenRouter
 * cũng niêm yết theo triệu token nên quy đổi cho khớp thói quen.
 */
export function formatUsdPerMillion(
  pricePerToken: number | null | undefined
): string {
  if (
    pricePerToken === null ||
    pricePerToken === undefined ||
    !Number.isFinite(pricePerToken)
  )
    return "-"
  return formatUsd(pricePerToken * 1_000_000)
}
