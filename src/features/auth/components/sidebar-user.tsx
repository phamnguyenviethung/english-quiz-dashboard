import { useState } from "react"
import { IconLogout, IconUser } from "@tabler/icons-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Spinner } from "@/components/ui/spinner"
import { authClient, clearSessionToken } from "@/configs/authClient.ts"

interface SidebarUserProps {
  name: string
  email: string
  image?: string | null
}

export function SidebarUser({ name, email, image }: SidebarUserProps) {
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await authClient.signOut()
    } finally {
      clearSessionToken()
      window.location.replace("/login")
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="cursor-default hover:bg-transparent"
        >
          <Avatar className="size-8 rounded-2xl">
            {image ? <AvatarImage src={image} alt={name} /> : null}
            <AvatarFallback className="rounded-2xl">
              <IconUser className="size-4" stroke={1.5} />
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate font-medium">{name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {email}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => void handleSignOut()}
          disabled={isSigningOut}
          tooltip="Đăng xuất"
        >
          {isSigningOut ? (
            <Spinner className="size-4" />
          ) : (
            <IconLogout className="size-4" stroke={1.5} />
          )}
          <span>Đăng xuất</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
