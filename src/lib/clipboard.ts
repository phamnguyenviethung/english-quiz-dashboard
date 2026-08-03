/**
 * navigator.clipboard chỉ có trên secure context (https hoặc localhost). Dashboard
 * có thể chạy qua IP LAN nên cần fallback bằng textarea + execCommand.
 */
export async function copyText(value: string): Promise<boolean> {
  // Type của lib.dom khai báo navigator.clipboard là non-nullable, thực tế thì không.
  const clipboard = navigator.clipboard as Clipboard | undefined

  if (clipboard) {
    try {
      await clipboard.writeText(value)
      return true
    } catch {
      // rơi xuống fallback bên dưới
    }
  }

  try {
    const textarea = document.createElement("textarea")
    textarea.value = value
    textarea.setAttribute("readonly", "")
    textarea.style.position = "fixed"
    textarea.style.opacity = "0"
    document.body.appendChild(textarea)
    textarea.select()
    const copied = document.execCommand("copy")
    document.body.removeChild(textarea)
    return copied
  } catch {
    return false
  }
}
