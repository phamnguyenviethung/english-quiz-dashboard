import { Link, useRouterState } from "@tanstack/react-router"

import type { NavGroup } from "@/configs/navigation.ts"
import { isNavItemActive } from "@/configs/navigation.ts"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export function NavMain({ groups }: { groups: NavGroup[] }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  // Trên mobile sidebar là Sheet phủ toàn màn: không tự đóng thì bấm xong vẫn
  // đứng nguyên ở menu, tưởng như điều hướng không ăn.
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <div className="flex flex-col gap-1">
      {groups.map((group) => {
        const hasLabel = Boolean(group.label)

        return (
          <SidebarGroup
            key={group.key}
            className={cn(
              "px-2.5 py-0.5 group-data-[collapsible=icon]:p-0",
              hasLabel && "pt-2"
            )}
          >
            {hasLabel ? (
              <SidebarGroupLabel className="h-6 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/75 select-none group-data-[collapsible=icon]:hidden">
                {group.label}
              </SidebarGroupLabel>
            ) : null}
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => {
                  const isActive = isNavItemActive(pathname, item.to)
                  const Icon = item.icon

                  return (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.label}
                        className={cn(
                          "h-9 rounded-xl px-2.5 text-sm font-medium transition-all duration-150",
                          isActive
                            ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary dark:bg-primary/20 dark:text-primary-foreground dark:hover:bg-primary/25"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                        )}
                        render={
                          <Link
                            to={item.to}
                            onClick={() => {
                              if (isMobile) setOpenMobile(false)
                            }}
                          >
                            <Icon
                              stroke={isActive ? 2 : 1.5}
                              className={cn(
                                "size-4 shrink-0 transition-colors",
                                isActive
                                  ? "text-primary dark:text-primary-foreground"
                                  : "text-muted-foreground group-hover/menu-button:text-sidebar-foreground"
                              )}
                            />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        }
                      />
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )
      })}
    </div>
  )
}
