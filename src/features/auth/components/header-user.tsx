import { useState } from "react"
import { IconLogout, IconUser } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  authClient,
  clearSessionToken,
  sessionQueryOptions,
} from "@/configs/authClient.ts"

export interface HeaderUserProps {
  name?: string
  email?: string
  image?: string | null
}

export function HeaderUser({ name, email, image }: HeaderUserProps = {}) {
  const { data: session } = useQuery(sessionQueryOptions)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const displayName = name ?? session?.user?.name
  const displayEmail = email ?? session?.user?.email
  const displayImage = image !== undefined ? image : session?.user?.image

  if (!displayName || !displayEmail) {
    return null
  }

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
    <div className="flex items-center gap-2 sm:gap-3">
    

      <div
        className="flex items-center gap-2"
        title={`${displayName} (${displayEmail})`}
      >
        <Avatar className="size-8">
          {displayImage ? (
            <AvatarImage src={displayImage} alt={displayName} />
          ) : null}
          <AvatarFallback>
            <IconUser className="size-4" stroke={1.5} />
          </AvatarFallback>
        </Avatar>
        <div className="hidden sm:flex flex-col text-left leading-tight">
          <span className="truncate text-xs font-semibold text-foreground max-w-[120px] lg:max-w-[160px]">
            {displayName}
          </span>
          <span className="truncate text-[11px] text-muted-foreground max-w-[120px] lg:max-w-[160px]">
            {displayEmail}
          </span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => void handleSignOut()}
        disabled={isSigningOut}
        className="h-8 gap-1.5 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        title="Đăng xuất"
        aria-label="Đăng xuất"
      >
        {isSigningOut ? (
          <Spinner className="size-4" />
        ) : (
          <IconLogout className="size-4" stroke={1.5} />
        )}
      </Button>
    </div>
  )
}
