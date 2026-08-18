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
          {group.label ? (
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          ) : null}
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    isActive={isNavItemActive(pathname, item.to)}
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
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  )
}
