import type { ReactNode } from "react"

import { Table } from "@/components/ui/table"
import { cn } from "@/lib/utils"

/**
 * Ô ghim mép trái/phải khi bảng cuộn ngang. `bg-inherit` lấy nền từ `<tr>` nên
 * hàng bắt buộc phải có nền đặc (vd `bg-card`, `bg-muted`); nền trong suốt sẽ bị
 * vẽ chồng hai lần và lộ ra một sọc đậm hơn ở cột ghim.
 */
export const STICKY_CELL_LEFT = "sticky left-0 z-20 border-r bg-inherit"
export const STICKY_CELL_RIGHT = "sticky right-0 z-20 border-l bg-inherit"

/**
 * Bảng cuộn ngang có cột ghim được. Bắt buộc `border-separate` vì preflight của
 * tailwind đặt `border-collapse: collapse`, ở chế độ đó viền hàng thuộc về bảng
 * và được vẽ *dưới* nền ô, nên ô ghim sẽ che mất toàn bộ đường kẻ khi cuộn.
 * Viền vì vậy chuyển xuống từng ô.
 */
export function StickyTable({
  children,
  className,
  tableClassName,
}: {
  children: ReactNode
  /** Áp cho khung ngoài — dùng để giới hạn chiều cao / bật cuộn dọc. */
  className?: string
  tableClassName?: string
}) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border", className)}>
      <Table
        className={cn(
          "border-separate border-spacing-0",
          "[&_tbody_tr:last-child_td]:border-b-0 [&_td]:border-b [&_th]:border-b",
          tableClassName
        )}
      >
        {children}
      </Table>
    </div>
  )
}
