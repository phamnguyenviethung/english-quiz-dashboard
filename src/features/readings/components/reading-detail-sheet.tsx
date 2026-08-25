import { useEffect, useState } from "react"
import {
  IconDeviceFloppy,
  IconPencil,
  IconTrash,
  IconX,
} from "@tabler/icons-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { PassageQuestionsPanel } from "@/features/reading-questions/components/passage-questions-panel.tsx"
import { useReadingQuestions } from "@/features/reading-questions/hooks/use-reading-questions.ts"
import { formatDateTime, formatNumber } from "@/lib/format.ts"

import { READING_WORD_BAND, getReadingTypeLabel } from "../constants.ts"
import {
  useDeleteReading,
  useUpdateReading,
} from "../hooks/use-mutate-reading.ts"
import type { ReadingPassage } from "../types.ts"
import { WordCountBadge } from "./word-count-badge.tsx"

/** Đoạn văn phân tách bằng dòng trống — khớp cách người ta soạn văn bản thường. */
const PARAGRAPH_SEPARATOR = "\n\n"

function toDraft(paragraphs: string[]): string {
  return paragraphs.join(PARAGRAPH_SEPARATOR)
}

function fromDraft(draft: string): string[] {
  return draft
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

function countWords(paragraphs: string[]): number {
  return paragraphs.join(" ").split(/\s+/).filter(Boolean).length
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm tabular-nums">{value}</dd>
    </div>
  )
}

function ReadingDetailContent({
  passage,
  onDeleted,
}: {
  passage: ReadingPassage
  onDeleted: () => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [titleDraft, setTitleDraft] = useState(passage.title)
  const [bodyDraft, setBodyDraft] = useState(toDraft(passage.paragraphs))
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Chọn bài khác khi sheet đang mở → reset form về bài mới, không giữ draft cũ.
  useEffect(() => {
    setIsEditing(false)
    setTitleDraft(passage.title)
    setBodyDraft(toDraft(passage.paragraphs))
  }, [passage.id, passage.title, passage.paragraphs])

  const { updateReading, setActive, isPending } = useUpdateReading({
    onSuccess: () => setIsEditing(false),
  })
  const { deleteReading, isPending: isDeleting } = useDeleteReading({
    onSuccess: onDeleted,
  })

  const { total: questionCount } = useReadingQuestions({
    passageId: passage.id,
    pageSize: 1,
  })

  const draftParagraphs = fromDraft(bodyDraft)
  const draftWordCount = countWords(draftParagraphs)
  const isDraftInvalid =
    titleDraft.trim().length === 0 || draftParagraphs.length < 2

  const handleSave = () =>
    void updateReading(passage.id, {
      title: titleDraft.trim(),
      paragraphs: draftParagraphs,
    })

  return (
    <div className="space-y-6 px-4 pb-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{passage.cefrLevel}</Badge>
        <Badge variant="outline">{getReadingTypeLabel(passage.type)}</Badge>
        <WordCountBadge wordCount={passage.wordCount} />
        <span className="text-sm text-muted-foreground">
          {passage.topicName ?? "Không có chủ đề"}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {isEditing ? (
          <>
            <Button
              size="sm"
              disabled={isPending || isDraftInvalid}
              onClick={handleSave}
            >
              <IconDeviceFloppy stroke={1.5} data-icon="inline-start" />
              Lưu
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={isPending}
              onClick={() => {
                setIsEditing(false)
                setTitleDraft(passage.title)
                setBodyDraft(toDraft(passage.paragraphs))
              }}
            >
              <IconX stroke={1.5} data-icon="inline-start" />
              Huỷ
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            <IconPencil stroke={1.5} data-icon="inline-start" />
            Sửa nội dung
          </Button>
        )}

        <label className="ml-auto flex items-center gap-2 text-sm">
          <Switch
            checked={passage.isActive}
            disabled={isPending}
            onCheckedChange={(checked) => void setActive(passage.id, checked)}
          />
          {passage.isActive ? "Đang bật" : "Đã tắt"}
        </label>

        <Button
          size="sm"
          variant="ghost"
          className="text-destructive"
          disabled={isDeleting}
          onClick={() => setConfirmDelete(true)}
        >
          <IconTrash stroke={1.5} data-icon="inline-start" />
          Xoá
        </Button>
      </div>

      <Tabs defaultValue="passage">
        <TabsList>
          <TabsTrigger value="passage">Bài đọc</TabsTrigger>
          <TabsTrigger value="questions">
            Câu hỏi{questionCount === undefined ? "" : ` (${questionCount})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="passage" className="space-y-6 pt-4">
          {isEditing ? (
            <div className="space-y-4">
              <Field data-invalid={titleDraft.trim().length === 0 || undefined}>
                <FieldLabel htmlFor="reading-title">Tiêu đề</FieldLabel>
                <Input
                  id="reading-title"
                  value={titleDraft}
                  disabled={isPending}
                  onChange={(event) => setTitleDraft(event.target.value)}
                />
              </Field>

              <Field data-invalid={draftParagraphs.length < 2 || undefined}>
                <FieldLabel htmlFor="reading-body">Nội dung</FieldLabel>
                <Textarea
                  id="reading-body"
                  rows={16}
                  className="leading-relaxed"
                  value={bodyDraft}
                  disabled={isPending}
                  onChange={(event) => setBodyDraft(event.target.value)}
                />
                <FieldDescription>
                  Ngăn cách các đoạn bằng một dòng trống. Hiện có{" "}
                  {draftParagraphs.length} đoạn, {draftWordCount} từ (band{" "}
                  {READING_WORD_BAND.min}-{READING_WORD_BAND.max}).
                  {draftParagraphs.length < 2 ? " Cần ít nhất 2 đoạn." : ""} Lưu
                  nội dung mới sẽ tắt toàn bộ câu hỏi của bài; hệ thống sinh lại
                  ở lần chạy sau.
                </FieldDescription>
              </Field>
            </div>
          ) : (
            <article className="space-y-4">
              <h3 className="text-lg font-semibold tracking-tight">
                {passage.title}
              </h3>
              {passage.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-[15px] leading-7">
                  {paragraph}
                </p>
              ))}
            </article>
          )}

          <dl className="grid grid-cols-2 gap-4 rounded-2xl border p-4 sm:grid-cols-4">
            <MetaRow label="ID" value={String(passage.id)} />
            <MetaRow label="Token vào" value={formatNumber(passage.tokenIn)} />
            <MetaRow label="Token ra" value={formatNumber(passage.tokenOut)} />
            <MetaRow
              label="Tạo lúc"
              value={formatDateTime(passage.createdAt)}
            />
            <div className="col-span-2 flex flex-col gap-0.5 sm:col-span-4">
              <dt className="text-xs text-muted-foreground">Model</dt>
              <dd className="font-mono text-sm break-all">{passage.model}</dd>
            </div>
          </dl>
        </TabsContent>

        <TabsContent value="questions" className="pt-4">
          <PassageQuestionsPanel
            passageId={passage.id}
            passageTitle={passage.title}
            cefrLevel={passage.cefrLevel}
          />
        </TabsContent>
      </Tabs>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá bài đọc này?</AlertDialogTitle>
            <AlertDialogDescription>
              "{passage.title}" sẽ bị xoá hẳn khỏi kho, không khôi phục được.
              Nếu chỉ muốn ngừng dùng thì tắt bài thay vì xoá.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={() => void deleteReading(passage.id)}
            >
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export function ReadingDetailSheet({
  passage,
  onOpenChange,
}: {
  passage: ReadingPassage | undefined
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={Boolean(passage)} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-2xl!">
        <SheetHeader>
          <SheetTitle>Chi tiết bài đọc</SheetTitle>
          <SheetDescription>
            Nội dung và metadata của bài đang lưu trong kho.
          </SheetDescription>
        </SheetHeader>

        {passage ? (
          <ReadingDetailContent
            passage={passage}
            onDeleted={() => onOpenChange(false)}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
