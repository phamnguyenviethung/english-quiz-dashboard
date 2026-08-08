import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { IconCheck, IconMinus } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

/**
 * Checkbox ba trạng thái cho dòng nhóm chủ đề: chọn hết / không chọn / chọn một phần.
 *
 * Không dùng `ui/checkbox.tsx` được vì component đó hard-code `IconCheck` trong
 * indicator, mà trạng thái "một phần" cần dấu gạch. Class giữ y hệt bản dùng chung
 * để hai loại checkbox trên cùng một danh sách trông như nhau.
 */
export function TriStateCheckbox({
  className,
  indeterminate,
  ...props
}: CheckboxPrimitive.Root.Props & { indeterminate?: boolean }) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      indeterminate={indeterminate}
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-[5px] border border-transparent bg-input/90 transition-shadow outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 dark:data-indeterminate:bg-primary data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        {indeterminate ? <IconMinus /> : <IconCheck />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
