import { Link } from "@tanstack/react-router"
import { IconSchool } from "@tabler/icons-react"

import { NAV_GROUPS } from "@/configs/navigation.ts"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

import { NavMain } from "./nav-main.tsx"

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border/60 pb-2.5 group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:pb-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="h-11 rounded-xl transition-colors hover:bg-sidebar-accent/50"
              render={
                <Link to="/">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs shadow-primary/25 ring-1 ring-primary/20">
                    <IconSchool className="size-4.5" stroke={1.75} />
                  </div>
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
                      English Quiz
                    </span>
                    <span className="truncate text-[11px] font-medium text-muted-foreground/80">
                      Bảng quản trị
                    </span>
                  </div>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <NavMain groups={NAV_GROUPS} />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
