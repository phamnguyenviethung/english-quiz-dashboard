import { Link } from "@tanstack/react-router"
import { IconSchool } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"

import { NAV_GROUPS } from "@/configs/navigation.ts"
import { sessionQueryOptions } from "@/configs/authClient.ts"
import { SidebarUser } from "@/features/auth/components/sidebar-user.tsx"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

import { NavMain } from "./nav-main.tsx"

export function AppSidebar() {
  const { data: session } = useQuery(sessionQueryOptions)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={
                <Link to="/">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <IconSchool className="size-4" stroke={1.5} />
                  </div>
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate font-semibold">English Quiz</span>
                    <span className="truncate text-xs text-muted-foreground">
                      Bảng quản trị
                    </span>
                  </div>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain groups={NAV_GROUPS} />
      </SidebarContent>

      {session?.user ? (
        <SidebarFooter>
          <SidebarUser
            name={session.user.name}
            email={session.user.email}
            image={session.user.image}
          />
        </SidebarFooter>
      ) : null}

      <SidebarRail />
    </Sidebar>
  )
}
