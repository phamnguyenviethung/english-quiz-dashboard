import { useRouterState } from "@tanstack/react-router"

import { findNavLocation } from "@/configs/navigation.ts"
import { ThemeToggle } from "@/components/theme/theme-toggle.tsx"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function AppHeader() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const current = findNavLocation(pathname)

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-sm">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-1 data-[orientation=vertical]:h-4"
      />
      <Breadcrumb>
        <BreadcrumbList>
          {current?.group.label ? (
            <>
              <BreadcrumbItem className="hidden md:block">
                {current.group.label}
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
            </>
          ) : null}
          <BreadcrumbItem>
            <BreadcrumbPage>
              {current?.item.label ?? "Bảng điều khiển"}
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
