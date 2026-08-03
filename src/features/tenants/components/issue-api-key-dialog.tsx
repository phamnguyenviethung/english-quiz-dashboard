import { useEffect, useRef, useState } from "react"
import { IconAlertTriangle, IconCheck, IconCopy, IconPlus } from "@tabler/icons-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { copyText } from "@/lib/clipboard.ts"

import { useIssueApiKey } from "../hooks/use-tenant-api-keys.ts"
import type { IssuedApiKey } from "../types.ts"

const COPIED_RESET_MS = 2000

function IssuedKeyPanel({ issued }: { issued: IssuedApiKey }) {
  const [copied, setCopied] = useState(false)
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(resetTimer.current), [])

  const handleCopy = async () => {
    const ok = await copyText(issued.apiKey)
    if (!ok) {
      toast.add({
        type: "error",
        title: "Không copy được",
        description: "Bôi đen giá trị bên trên và copy thủ công.",
      })
      return
    }
    setCopied(true)
    clearTimeout(resetTimer.current)
    resetTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS)
  }

  return (
    <div className="flex flex-col gap-4">
      <Alert variant="destructive">
        <IconAlertTriangle stroke={1.5} />
        <AlertTitle>Lưu key ngay</AlertTitle>
        <AlertDescription>{issued.warning}</AlertDescription>
      </Alert>

      <div className="flex items-center gap-2 rounded-2xl border p-3">
        <code className="min-w-0 flex-1 font-mono text-xs break-all select-all">
          {issued.apiKey}
        </code>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={() => void handleCopy()}
        >
          {copied ? (
            <IconCheck stroke={1.5} data-icon="inline-start" />
          ) : (
            <IconCopy stroke={1.5} data-icon="inline-start" />
          )}
          {copied ? "Đã copy" : "Copy"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Client gửi key qua header{" "}
        <code className="font-mono">Authorization: Bearer &lt;key&gt;</code>.
      </p>
    </div>
  )
}

export function IssueApiKeyDialog({ tenantId }: { tenantId: number }) {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState("")
  const [issued, setIssued] = useState<IssuedApiKey | null>(null)

  const { issueApiKey, isPending, reset } = useIssueApiKey(tenantId, {
    onSuccess: setIssued,
  })

  const closeAndReset = () => {
    setOpen(false)
    setLabel("")
    setIssued(null)
    reset()
  }

  // Ở bước hiển thị key, chặn đóng ngoài ý muốn (click overlay / Esc) vì plaintext
  // chỉ trả về đúng một lần.
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && issued) return
    if (!nextOpen) closeAndReset()
    else setOpen(true)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await issueApiKey(label)
    } catch {
      // toast đã bắn từ hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button>
            <IconPlus stroke={1.5} data-icon="inline-start" />
            Cấp API key
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {issued ? "API key mới" : "Cấp API key mới"}
          </DialogTitle>
          <DialogDescription>
            {issued
              ? "Giá trị đầy đủ chỉ hiển thị một lần này, đóng hộp thoại là mất."
              : "Nhãn giúp nhận diện key khi cần thu hồi, không ảnh hưởng tới quyền."}
          </DialogDescription>
        </DialogHeader>

        {issued ? (
          <>
            <IssuedKeyPanel issued={issued} />
            <DialogFooter>
              <Button onClick={closeAndReset}>Tôi đã lưu key</Button>
            </DialogFooter>
          </>
        ) : (
          <form
            className="flex flex-col gap-6"
            onSubmit={handleSubmit}
            noValidate
          >
            <Field>
              <FieldLabel htmlFor="api-key-label">Nhãn</FieldLabel>
              <Input
                id="api-key-label"
                placeholder="vd: bot-production"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                autoComplete="off"
                disabled={isPending}
              />
              <FieldDescription>Có thể bỏ trống.</FieldDescription>
            </Field>

            <DialogFooter>
              <DialogClose render={<Button variant="outline" type="button" />}>
                Huỷ
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Spinner data-icon="inline-start" /> : null}
                Cấp key
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
