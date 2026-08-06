import type { ReactElement } from "react"
import { useState } from "react"

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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { API_ERROR_CODE, isApiErrorCode } from "@/lib/api-error.ts"

import { useCreateAiModel } from "../hooks/use-create-ai-model.ts"
import { useUpdateAiModel } from "../hooks/use-update-ai-model.ts"
import type { AiModel, AiModelFormValues } from "../types.ts"
import type { AiModelFormErrors } from "../utils/validate-ai-model.ts"
import { hasErrors, validateAiModelForm } from "../utils/validate-ai-model.ts"

const EMPTY_VALUES: AiModelFormValues = {
  key: "",
  modelId: "",
  isActive: true,
}

function toFormValues(model: AiModel | undefined): AiModelFormValues {
  if (!model) return EMPTY_VALUES
  return { key: model.key, modelId: model.modelId, isActive: model.isActive }
}

export function AiModelFormDialog({
  model,
  trigger,
}: {
  model?: AiModel
  trigger: ReactElement
}) {
  const isEdit = model !== undefined
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<AiModelFormValues>(() =>
    toFormValues(model)
  )
  const [errors, setErrors] = useState<AiModelFormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const close = () => setOpen(false)
  const create = useCreateAiModel({ onSuccess: close })
  const update = useUpdateAiModel(model?.id ?? 0, { onSuccess: close })
  const isPending = isEdit ? update.isPending : create.isPending

  const updateValue = <TField extends keyof AiModelFormValues>(
    key: TField,
    value: AiModelFormValues[TField]
  ) => {
    const nextValues = { ...values, [key]: value }
    setValues(nextValues)
    if (submitted) {
      setErrors(validateAiModelForm(nextValues))
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen) {
      setValues(toFormValues(model))
      setErrors({})
      setSubmitted(false)
      return
    }
    if (isEdit) update.reset()
    else create.reset()
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)

    const nextErrors = validateAiModelForm(values)
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return

    try {
      if (isEdit) await update.updateAiModelFromForm(values)
      else await create.createAiModel(values)
    } catch (error) {
      if (!isApiErrorCode(error, API_ERROR_CODE.CONFLICT)) return
      const message = "Key hoặc model ID này đã được dùng bởi model khác."
      setErrors({ key: message, modelId: message })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Sửa model "${model.key}"` : "Thêm AI model"}
          </DialogTitle>
          <DialogDescription>
            Model dùng bởi hàng đợi sinh câu hỏi khi chọn ngẫu nhiên trong các
            model đang bật.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
          <Field data-invalid={Boolean(errors.key)}>
            <FieldLabel htmlFor="model-key">Key</FieldLabel>
            <Input
              id="model-key"
              placeholder="vd: GEMINI_FLASH_LITE"
              value={values.key}
              onChange={(event) => updateValue("key", event.target.value)}
              aria-invalid={Boolean(errors.key)}
              autoComplete="off"
              disabled={isPending}
            />
            <FieldDescription>
              Nhãn ngắn gọn, duy nhất, để tra cứu trong code/log.
            </FieldDescription>
            <FieldError errors={[errors.key ? { message: errors.key } : undefined]} />
          </Field>

          <Field data-invalid={Boolean(errors.modelId)}>
            <FieldLabel htmlFor="model-modelId">Model ID</FieldLabel>
            <Input
              id="model-modelId"
              placeholder="vd: google/gemini-2.5-flash-lite:nitro"
              value={values.modelId}
              onChange={(event) => updateValue("modelId", event.target.value)}
              aria-invalid={Boolean(errors.modelId)}
              autoComplete="off"
              disabled={isPending}
              className="font-mono text-sm"
            />
            <FieldDescription>
              Model ID trên OpenRouter, dùng trực tiếp khi gọi sinh câu hỏi.
            </FieldDescription>
            <FieldError
              errors={[errors.modelId ? { message: errors.modelId } : undefined]}
            />
          </Field>

          {isEdit ? (
            <Field>
              <label className="flex items-center justify-between gap-4 rounded-2xl border p-4 text-sm">
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium">Đang hoạt động</span>
                  <span className="text-xs text-muted-foreground">
                    Tắt để loại model khỏi vòng chọn sinh câu hỏi, không xoá dữ
                    liệu.
                  </span>
                </span>
                <Switch
                  checked={values.isActive}
                  onCheckedChange={(checked) => updateValue("isActive", checked)}
                  disabled={isPending}
                />
              </label>
            </Field>
          ) : null}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Huỷ
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner data-icon="inline-start" /> : null}
              {isEdit ? "Lưu thay đổi" : "Thêm model"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
