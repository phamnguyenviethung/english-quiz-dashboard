import { Link, useRouterState } from "@tanstack/react-router"

import type { NavGroup } from "@/configs/navigation.ts"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const UNAVAILABLE_LABEL = "Sắp có"

export function NavMain({ groups }: { groups: NavGroup[] }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  // Trên mobile sidebar là Sheet phủ toàn màn: không tự đóng thì bấm xong vẫn
  // đứng nguyên ở menu, tưởng như điều hướng không ăn.
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <>
      {groups.map((group) => (
        <SidebarGroup key={group.key}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.key}>
                  {item.to ? (
                    <SidebarMenuButton
                      isActive={pathname === item.to}
                      tooltip={item.label}
                      render={
                        <Link
                          to={item.to}
                          onClick={() => {
                            if (isMobile) setOpenMobile(false)
                          }}
                        >
                          <item.icon stroke={1.5} />
                          <span>{item.label}</span>
                        </Link>
                      }
                    />
                  ) : (
                    <>
                      <SidebarMenuButton
                        aria-disabled="true"
                        tooltip={`${item.label} (${UNAVAILABLE_LABEL})`}
                        className="cursor-default opacity-50 hover:bg-transparent hover:text-sidebar-foreground"
                        onClick={(event) => event.preventDefault()}
                      >
                        <item.icon stroke={1.5} />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                      <SidebarMenuBadge className="text-muted-foreground">
                        {UNAVAILABLE_LABEL}
                      </SidebarMenuBadge>
                    </>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  )
}
