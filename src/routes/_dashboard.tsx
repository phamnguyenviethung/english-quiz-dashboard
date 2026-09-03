import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import { getGetEnglishTopicsQueryOptions } from "@/apis/english-topics/english-topics.ts"
import { AppHeader } from "@/components/layout/app-header.tsx"
import { AppSidebar } from "@/components/layout/app-sidebar.tsx"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { isAdminSession, sessionQueryOptions } from "@/configs/authClient.ts"

export const Route = createFileRoute("/_dashboard")({
  // beforeLoad của layout chạy trước mọi loader con nên không route nào fetch
  // được data khi chưa đăng nhập.
  beforeLoad: async ({ context, location }) => {
    const session =
      await context.queryClient.ensureQueryData(sessionQueryOptions)

    if (!session?.user) {
      throw redirect({ to: "/login", search: { redirect: location.href } })
    }
    if (!isAdminSession(session)) {
      throw redirect({ to: "/login", search: { error: "forbidden" } })
    }

    return { session }
  },
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(getGetEnglishTopicsQueryOptions())
  },
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <AppHeader />
        <main className="flex min-h-[calc(100dvh-4rem)] flex-1 flex-col gap-6 p-4 md:p-6 min-w-0">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
