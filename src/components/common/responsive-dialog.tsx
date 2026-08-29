import type { ComponentProps, ReactElement, ReactNode } from "react"
import { createContext, useContext } from "react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

/**
 * Dialog ở màn hình lớn, bottom sheet ở điện thoại. Form dài trong dialog canh
 * giữa sẽ tràn khỏi màn hình iPhone và bị bàn phím ảo đẩy lên; drawer thì cuộn
 * dọc tự nhiên và giữ được nút submit ở đáy.
 *
 * Chỗ này rẽ nhánh bằng `useIsMobile` chứ không ẩn/hiện hai bản bằng CSS như
 * refill-summary.tsx, vì hai nhánh là hai cây component khác nhau nhưng cùng giữ
 * một state `open` — dựng cả hai sẽ nhân đôi state. Hook trả false ở render đầu
 * nên về lý thuyết có nháy, nhưng dialog luôn mount ở trạng thái đóng nên không
 * nhìn thấy được. Sidebar cũng đang rẽ nhánh kiểu này.
 */
const ResponsiveDialogContext = createContext(false)

/** Cho detail-dialog.tsx dựng bố cục riêng trên cùng cây context này. */
export function useIsDrawer() {
  return useContext(ResponsiveDialogContext)
}

export function ResponsiveDialog({
  children,
  ...props
}: {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const Root = isMobile ? Drawer : Dialog

  return (
    <ResponsiveDialogContext.Provider value={isMobile}>
      <Root {...(isMobile ? { showSwipeHandle: true } : {})} {...props}>
        {children}
      </Root>
    </ResponsiveDialogContext.Provider>
  )
}

export function ResponsiveDialogTrigger({ render }: { render: ReactElement }) {
  const isDrawer = useIsDrawer()
  return isDrawer ? (
    <DrawerTrigger render={render} />
  ) : (
    <DialogTrigger render={render} />
  )
}

export function ResponsiveDialogContent({
  children,
  className,
}: {
  children: ReactNode
  /** Chỉ áp cho nhánh dialog — drawer luôn rộng hết màn hình. */
  className?: string
}) {
  const isDrawer = useIsDrawer()

  if (isDrawer) return <DrawerContent>{children}</DrawerContent>

  return (
    <DialogContent className={cn("max-h-[85dvh] overflow-y-auto", className)}>
      {children}
    </DialogContent>
  )
}

export function ResponsiveDialogHeader({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const isDrawer = useIsDrawer()
  return isDrawer ? (
    <DrawerHeader className={cn("text-left", className)}>
      {children}
    </DrawerHeader>
  ) : (
    <DialogHeader className={className}>{children}</DialogHeader>
  )
}

export function ResponsiveDialogTitle(
  props: ComponentProps<typeof DialogTitle>
) {
  const isDrawer = useIsDrawer()
  return isDrawer ? <DrawerTitle {...props} /> : <DialogTitle {...props} />
}

export function ResponsiveDialogDescription(
  props: ComponentProps<typeof DialogDescription>
) {
  const isDrawer = useIsDrawer()
  return isDrawer ? (
    <DrawerDescription {...props} />
  ) : (
    <DialogDescription {...props} />
  )
}

/** Vùng nội dung cuộn được. Trong drawer nó chiếm phần còn lại giữa header và footer. */
export function ResponsiveDialogBody({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const isDrawer = useIsDrawer()

  return (
    <div
      className={cn(
        isDrawer && "min-h-0 flex-1 overflow-y-auto overscroll-contain p-4",
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Footer dính đáy ở drawer, nút con xếp dọc và full-width. `env(safe-area-inset-bottom)`
 * hôm nay bằng 0 nhưng viết sẵn cho chế độ standalone.
 */
export function ResponsiveDialogFooter({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const isDrawer = useIsDrawer()

  if (isDrawer) {
    return (
      <DrawerFooter
        className={cn(
          "flex-col-reverse pb-[max(1rem,env(safe-area-inset-bottom))] *:h-11 *:w-full",
          className
        )}
      >
        {children}
      </DrawerFooter>
    )
  }

  return <DialogFooter className={className}>{children}</DialogFooter>
}

export function ResponsiveDialogClose({
  render,
  children,
}: {
  render: ReactElement
  children?: ReactNode
}) {
  const isDrawer = useIsDrawer()
  return isDrawer ? (
    <DrawerClose render={render}>{children}</DrawerClose>
  ) : (
    <DialogClose render={render}>{children}</DialogClose>
  )
}
