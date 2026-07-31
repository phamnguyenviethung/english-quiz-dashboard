import { useCallback, useSyncExternalStore } from "react"

import { THEME_STORAGE_KEY } from "./theme-script.tsx"

export type Theme = "light" | "dark" | "system"

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === "light" || stored === "dark") return stored
  } catch {
    return "system"
  }
  return "system"
}

function getServerSnapshot(): Theme {
  return "system"
}

function prefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

function applyTheme(theme: Theme) {
  const isDark = theme === "dark" || (theme === "system" && prefersDark())
  document.documentElement.classList.toggle("dark", isDark)
  document.documentElement.style.colorScheme = isDark ? "dark" : "light"
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setTheme = useCallback((next: Theme) => {
    try {
      if (next === "system") {
        localStorage.removeItem(THEME_STORAGE_KEY)
      } else {
        localStorage.setItem(THEME_STORAGE_KEY, next)
      }
    } catch {
      // localStorage bị khoá, vẫn đổi theme cho phiên hiện tại
    }
    applyTheme(next)
    for (const listener of listeners) listener()
  }, [])

  const toggleTheme = useCallback(() => {
    const isDark = document.documentElement.classList.contains("dark")
    setTheme(isDark ? "light" : "dark")
  }, [setTheme])

  return { theme, setTheme, toggleTheme }
}
