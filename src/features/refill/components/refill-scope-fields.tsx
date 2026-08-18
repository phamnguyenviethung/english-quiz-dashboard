import { useMemo } from "react"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface RefillScopeMeta {
  label: string
  description: string
}

/**
 * Cặp "phạm vi" + "số lượng mỗi bucket". Các loại nội dung dùng chung layout,
 * chỉ khác tập scope và nhãn đơn vị nên bơm vào qua props.
 */
export function RefillScopeFields({
  idPrefix,
  scopeMeta,
  scope,
  countLabel,
  count,
  isCountInvalid,
  disabled,
  showCount = true,
  onScopeChange,
  onCountChange,
}: {
  /** Tiền tố cho `id` của input, tránh đụng nhau nếu hai tab cùng mount. */
  idPrefix: string
  scopeMeta: Record<string, RefillScopeMeta>
  scope: string
  countLabel?: string
  count?: string
  isCountInvalid?: boolean
  disabled?: boolean
  /**
   * Câu hỏi đọc hiểu không cho chọn số lượng: số câu mỗi bài là hằng số nghiệp vụ
   * (`reading_question.questionsPerPassage`), API refill không nhận countPerBucket.
   */
  showCount?: boolean
  onScopeChange: (scope: string) => void
  onCountChange?: (count: string) => void
}) {
  // `items` để `SelectValue` hiện nhãn ngay từ render đầu, không phải chờ mở popup.
  const items = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(scopeMeta).map(([value, meta]) => [value, meta.label])
      ),
    [scopeMeta]
  )

  return (
    <div className={showCount ? "grid gap-4 sm:grid-cols-2" : "grid gap-4"}>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-scope`}>Phạm vi</FieldLabel>
        <Select
          items={items}
          value={scope}
          disabled={disabled}
          onValueChange={(value) => onScopeChange(value ?? scope)}
        >
          <SelectTrigger
            id={`${idPrefix}-scope`}
            className="min-h-11 lg:min-h-9"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(scopeMeta).map(([value, meta]) => (
              <SelectItem key={value} value={value}>
                {meta.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldDescription>{scopeMeta[scope].description}</FieldDescription>
      </Field>

      {showCount ? (
        <Field data-invalid={isCountInvalid || undefined}>
          <FieldLabel htmlFor={`${idPrefix}-count`}>{countLabel}</FieldLabel>
          <Input
            id={`${idPrefix}-count`}
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            className="min-h-11 tabular-nums lg:min-h-9"
            placeholder="Mặc định"
            value={count}
            disabled={disabled}
            aria-invalid={isCountInvalid}
            onChange={(event) => onCountChange?.(event.target.value)}
          />
          <FieldDescription>
            {isCountInvalid
              ? "Nhập số nguyên từ 1 trở lên."
              : "Bỏ trống để dùng cấu hình mặc định của hệ thống."}
          </FieldDescription>
        </Field>
      ) : null}
    </div>
  )
}
