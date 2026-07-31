import { IconMoon, IconSun } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"

import { useTheme } from "./use-theme.ts"

export function ThemeToggle() {
  const { toggleTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggleTheme}
      aria-label="Chuyển giao diện sáng tối"
    >
      <IconSun className="dark:hidden" stroke={1.5} />
      <IconMoon className="hidden dark:block" stroke={1.5} />
    </Button>
  )
}
