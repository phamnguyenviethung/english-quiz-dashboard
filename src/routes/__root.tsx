import type { QueryClient } from "@tanstack/react-query"
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { IconAlertOctagon, IconMoodSad } from "@tabler/icons-react"

import { ThemeScript } from "@/components/theme/theme-script.tsx"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Toaster } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/api-error.ts"

import appCss from "../styles.css?url"

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        name: "color-scheme",
        content: "light dark",
      },
      {
        title: "English Quiz · Quản trị",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  notFoundComponent: () => (
    <main className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 pt-24 text-center">
      <IconMoodSad className="size-10 text-muted-foreground" stroke={1.5} />
      <h1 className="text-2xl font-semibold tracking-tight">
        Không tìm thấy trang
      </h1>
      <p className="text-sm text-muted-foreground">
        Đường dẫn bạn truy cập không tồn tại hoặc đã bị đổi tên.
      </p>
    </main>
  ),
  errorComponent: ({ error }) => (
    <main className="mx-auto max-w-lg px-4 pt-24">
      <Alert variant="destructive">
        <IconAlertOctagon stroke={1.5} />
        <AlertTitle>Ứng dụng gặp lỗi</AlertTitle>
        <AlertDescription>{getApiErrorMessage(error)}</AlertDescription>
        {/* getApiErrorMessage chỉ hiểu lỗi Axios; lỗi runtime khác rơi hết về
            message mặc định. Ở dev thì in message thật ra để còn debug được. */}
        {import.meta.env.DEV && error instanceof Error ? (
          <pre className="mt-3 overflow-x-auto rounded-xl bg-muted p-3 text-xs whitespace-pre-wrap">
            {error.message}
          </pre>
        ) : null}
      </Alert>
    </main>
  ),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <ThemeScript />
        <HeadContent />
      </head>
      <body>
        {children}
        <Toaster />
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
