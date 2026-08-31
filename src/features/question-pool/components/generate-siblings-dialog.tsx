import { useState } from "react"
import { IconAlertTriangle } from "@tabler/icons-react"
import { Link } from "@tanstack/react-router"

import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/common/responsive-dialog.tsx"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { formatUsdPerMillion } from "@/lib/format.ts"

import {
  SIBLING_COUNT_OPTIONS,
  SIBLING_DEFAULT_COUNT,
  SIBLING_NOTE_MAX,
} from "../constants.ts"
import { useGenerateSiblings } from "../hooks/use-generate-siblings.ts"
import { useManualRefillModels } from "../hooks/use-manual-refill-models.ts"

const AUTO_MODEL = "auto"

export function GenerateSiblingsDialog({
  sourceQuestionId,
  open,
  onOpenChange,
}: {
  sourceQuestionId: number | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [count, setCount] = useState<number>(SIBLING_DEFAULT_COUNT)
  const [model, setModel] = useState<string>(AUTO_MODEL)
  const [note, setNote] = useState("")

  const { models, isPending: modelsPending } = useManualRefillModels()
  const { generateSiblings, isPending } = useGenerateSiblings({
    onSuccess: () => onOpenChange(false),
  })

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
    if (next) {
      setCount(SIBLING_DEFAULT_COUNT)
      setModel(AUTO_MODEL)
      setNote("")
    }
  }

  const submit = () => {
    if (sourceQuestionId === undefined) return
    void generateSiblings(sourceQuestionId, {
      count,
      ...(model === AUTO_MODEL ? {} : { model }),
      ...(note.trim() ? { adminNote: note.trim() } : {}),
    })
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-lg">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Tạo câu tương tự</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {sourceQuestionId !== undefined
              ? `Sinh biến thể của câu #${sourceQuestionId}: giữ nguyên từ/cụm cần học, độ khó và chủ đề; đổi mới ngữ cảnh, phương án và ví dụ. Câu đạt được thêm thẳng vào pool.`
              : "Chọn một câu trong pool để tạo câu tương tự."}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody className="space-y-4">
          <Field>
            <FieldLabel htmlFor="sibling-count">Số câu cần sinh</FieldLabel>
            <Select
              value={String(count)}
              onValueChange={(value) =>
                setCount(Number(value ?? SIBLING_DEFAULT_COUNT))
              }
            >
              <SelectTrigger id="sibling-count">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIBLING_COUNT_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option} câu
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>Tối đa 5 câu mỗi lần gọi.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="sibling-model">Model</FieldLabel>
            {modelsPending ? (
              <Skeleton className="h-9 w-full" />
            ) : models.length === 0 ? (
              <Alert variant="destructive">
                <IconAlertTriangle stroke={1.5} />
                <AlertTitle>Chưa có model nào chạy tay được</AlertTitle>
                <AlertDescription>
                  Cần ít nhất một model bật <code>manualEnabled</code>.
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-fit"
                    render={<Link to="/ai-models" />}
                  >
                    Mở quản lý model
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <Select
                value={model}
                onValueChange={(value) => setModel(value ?? AUTO_MODEL)}
              >
                <SelectTrigger id="sibling-model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AUTO_MODEL}>
                    Tự động (ngẫu nhiên trong model chạy tay)
                  </SelectItem>
                  {models.map((m) => (
                    <SelectItem key={m.id} value={m.modelId}>
                      {m.key} · vào {formatUsdPerMillion(m.pricePromptPerToken)}{" "}
                      · ra {formatUsdPerMillion(m.priceCompletionPerToken)} / 1M
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <FieldDescription>
              Dùng nhóm model chạy tay (<code>manual</code>).
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="sibling-note">
              Ghi chú cho AI (không bắt buộc)
            </FieldLabel>
            <Textarea
              id="sibling-note"
              className="min-h-24"
              maxLength={SIBLING_NOTE_MAX}
              value={note}
              placeholder='VD: "Đổi bối cảnh sang môi trường công sở", "Distractor khó hơn một chút"'
              onChange={(event) => setNote(event.target.value)}
            />
            <FieldDescription>
              {note.length}/{SIBLING_NOTE_MAX}
            </FieldDescription>
          </Field>
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter>
          <ResponsiveDialogClose
            render={<Button variant="outline" type="button" />}
          >
            Huỷ
          </ResponsiveDialogClose>
          <Button
            disabled={isPending || sourceQuestionId === undefined}
            onClick={submit}
          >
            {isPending ? <Spinner data-icon="inline-start" /> : null}
            Tạo {count} câu
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
