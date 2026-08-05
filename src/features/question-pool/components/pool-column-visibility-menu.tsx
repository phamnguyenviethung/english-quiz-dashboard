import { IconColumns3 } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { PoolTable } from "../hooks/use-pool-table.ts"

export function PoolColumnVisibilityMenu({
  table,
  onReset,
}: {
  table: PoolTable
  onReset: () => void
}) {
  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide())
  const hiddenCount = columns.filter((column) => !column.getIsVisible()).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline">
            <IconColumns3 stroke={1.5} data-icon="inline-start" />
            Cột
            {hiddenCount > 0 ? (
              <span className="text-muted-foreground">({hiddenCount} ẩn)</span>
            ) : null}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-52">
        {/* Base UI: GroupLabel throw nếu không nằm trong Menu.Group — và chỉ nổ lúc
            mở menu, vì Portal chưa render gì cho tới khi mounted. */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>Hiện cột</DropdownMenuLabel>
          {columns.map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(checked) => column.toggleVisibility(checked)}
            >
              {column.columnDef.meta?.label ?? column.id}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={hiddenCount === 0} onClick={onReset}>
          Hiện lại tất cả
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
