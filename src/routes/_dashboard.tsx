import { Outlet, createFileRoute } from "@tanstack/react-router"

import { getGetEnglishTopicsQueryOptions } from "@/apis/english-topics/english-topics.ts"
import { AppHeader } from "@/components/layout/app-header.tsx"
import { AppSidebar } from "@/components/layout/app-sidebar.tsx"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export const Route = createFileRoute("/_dashboard")({
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(getGetEnglishTopicsQueryOptions())
  },
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex min-h-[calc(100dvh-4rem)] flex-1 flex-col gap-6 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
