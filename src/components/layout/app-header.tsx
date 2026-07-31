import { useRouterState } from "@tanstack/react-router"

import type { NavPath } from "@/configs/navigation.ts"
import { NAV_ITEMS_BY_PATH } from "@/configs/navigation.ts"
import { ThemeToggle } from "@/components/theme/theme-toggle.tsx"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function AppHeader() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const current = NAV_ITEMS_BY_PATH.get(pathname as NavPath)

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-sm">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-1 data-[orientation=vertical]:h-4"
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>
              {current?.label ?? "Bảng điều khiển"}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  )
}
