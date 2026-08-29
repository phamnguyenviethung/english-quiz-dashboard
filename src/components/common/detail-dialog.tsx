import type { ComponentProps, ReactNode } from "react"
import { IconX } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

import { ResponsiveDialog, useIsDrawer } from "./responsive-dialog.tsx"

/**
 * Khung cho các màn xem chi tiết: popup canh giữa ở màn lớn, drawer đáy vuốt-xuống-
 * đóng ở điện thoại. Khác `ResponsiveDialog` (dành cho form ngắn) ở chỗ chiều cao
 * bị chốt và vùng cuộn là `DetailDialogBody` chứ không phải cả popup — nhờ vậy
 * tiêu đề và hàng nút luôn đứng yên dù nội dung dài.
 *
 * Root dùng lại `ResponsiveDialog` nên thừa hưởng luôn context và swipe handle.
 */
export { ResponsiveDialog as DetailDialog }

export function DetailDialogContent({
  children,
  className,
}: {
  children: ReactNode
  /** Chỉ áp cho nhánh dialog — drawer luôn rộng hết màn hình. */
  className?: string
}) {
  const isDrawer = useIsDrawer()

  if (isDrawer) {
    // Chốt chiều cao thay vì dùng snapPoints: `data-snap-points` ép popup lên
    // 100dvh và mất kiểu float bo góc. Biến max-height phải lặp lại variant
    // `data-[swipe-axis=y]` mới thắng được mặc định `calc(100dvh-6rem)`.
    return (
      <DrawerContent className="[--drawer-height:92dvh] data-[swipe-axis=y]:[--drawer-content-max-height:92dvh]">
        {children}
      </DrawerContent>
    )
  }

  return (
    <DialogContent
      className={cn(
        "flex max-h-[85dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl",
        className
      )}
    >
      {children}
    </DialogContent>
  )
}

export function DetailDialogHeader({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const isDrawer = useIsDrawer()

  return (
    <div
      data-slot="detail-dialog-header"
      className={cn(
        "flex shrink-0 items-start gap-3 border-b px-4 py-3 text-left md:px-6 md:py-4",
        // Chừa chỗ cho nút X sẵn có của DialogContent.
        !isDrawer && "pr-14",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">{children}</div>

      {isDrawer ? (
        <DrawerClose
          render={
            <Button variant="ghost" size="icon" className="-mr-2 size-11" />
          }
        >
          <IconX stroke={1.5} />
          <span className="sr-only">Đóng</span>
        </DrawerClose>
      ) : null}
    </div>
  )
}

export function DetailDialogTitle(props: ComponentProps<typeof DialogTitle>) {
  const isDrawer = useIsDrawer()
  return isDrawer ? <DrawerTitle {...props} /> : <DialogTitle {...props} />
}

export function DetailDialogDescription(
  props: ComponentProps<typeof DialogDescription>
) {
  const isDrawer = useIsDrawer()
  return isDrawer ? (
    <DrawerDescription {...props} />
  ) : (
    <DialogDescription {...props} />
  )
}

/** Vùng cuộn duy nhất của popup. */
export function DetailDialogBody({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      data-slot="detail-dialog-body"
      className={cn(
        "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 md:px-6 md:py-6",
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Hàng nút dính đáy. Trên điện thoại nút xếp dọc, full-width, cao 44px cho vừa
 * ngón tay — nên các `Button` phải là con trực tiếp, đừng bọc thêm div.
 */
export function DetailDialogFooter({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const isDrawer = useIsDrawer()

  return (
    <div
      data-slot="detail-dialog-footer"
      className={cn(
        "flex shrink-0 gap-2 border-t bg-popover px-4 py-3 md:px-6 md:py-4",
        isDrawer
          ? "flex-col-reverse pb-[max(1rem,env(safe-area-inset-bottom))] *:h-11 *:w-full"
          : "flex-row flex-wrap items-center justify-end",
        className
      )}
    >
      {children}
    </div>
  )
}
