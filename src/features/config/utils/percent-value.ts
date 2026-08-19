/** Ratio 0..1 lưu ở DB nhưng ô nhập hiển thị 0..100 cho dễ đọc. */
const PERCENT_FACTOR = 100

/** Nhân/chia nổi có sai số (0.29 * 100 = 28.999...), làm tròn về số chữ số cần thiết. */
function round(value: number, digits: number): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

/** Giá trị lưu (0..1) -> giá trị hiển thị trong ô nhập (0..100). */
export function toPercentDisplay(raw: string): string {
  if (!raw.trim()) return raw
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return raw
  return String(round(parsed * PERCENT_FACTOR, 2))
}

/** Giá trị người dùng gõ (0..100) -> giá trị lưu (0..1). */
export function fromPercentDisplay(raw: string): string {
  if (!raw.trim()) return raw
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return raw
  return String(round(parsed / PERCENT_FACTOR, 4))
}

export function scalePercentBound(
  bound: number | undefined
): number | undefined {
  return bound === undefined ? undefined : round(bound * PERCENT_FACTOR, 2)
}
