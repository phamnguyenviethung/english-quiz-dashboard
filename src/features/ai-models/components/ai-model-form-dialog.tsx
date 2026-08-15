import type { ReactElement } from "react"
import { useState } from "react"

import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/common/responsive-dialog.tsx"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { API_ERROR_CODE, isApiErrorCode } from "@/lib/api-error.ts"

import {
  MODEL_CONTEXT_DESCRIPTIONS,
  MODEL_CONTEXT_LABELS,
} from "../constants.ts"
import { useCreateAiModel } from "../hooks/use-create-ai-model.ts"
import { useUpdateAiModel } from "../hooks/use-update-ai-model.ts"
import type { AiModel, AiModelFormValues } from "../types.ts"
import {
  EMPTY_PROVIDER_FORM,
  toProviderFormValues,
} from "../utils/provider-preferences.ts"
import type { AiModelFormErrors } from "../utils/validate-ai-model.ts"
import { hasErrors, validateAiModelForm } from "../utils/validate-ai-model.ts"
import { ProviderPreferencesFields } from "./provider-preferences-fields.tsx"

const EMPTY_VALUES: AiModelFormValues = {
  key: "",
  modelId: "",
  isActive: true,
  scheduleEnabled: true,
  manualEnabled: true,
  readingEnabled: true,
  scheduleProvider: EMPTY_PROVIDER_FORM,
  manualProvider: EMPTY_PROVIDER_FORM,
  readingProvider: EMPTY_PROVIDER_FORM,
}

function toFormValues(
  model: AiModel | undefined,
  presetModelId: string | undefined
): AiModelFormValues {
  if (!model) {
    return presetModelId
      ? { ...EMPTY_VALUES, modelId: presetModelId }
      : EMPTY_VALUES
  }
  return {
    key: model.key,
    modelId: model.modelId,
    isActive: model.isActive,
    scheduleEnabled: model.scheduleEnabled,
    manualEnabled: model.manualEnabled,
    readingEnabled: model.readingEnabled,
    scheduleProvider: toProviderFormValues(model.scheduleProvider),
    manualProvider: toProviderFormValues(model.manualProvider),
    readingProvider: toProviderFormValues(model.readingProvider),
  }
}

/** Switch bật/tắt kèm mô tả, dùng lại cho isActive và 2 cờ ngữ cảnh. */
function ToggleRow({
  title,
  description,
  checked,
  disabled,
  onCheckedChange,
}: {
  title: string
  description: string
  checked: boolean
  disabled: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-2xl border p-4 text-sm">
      <span className="flex flex-col gap-0.5">
        <span className="font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </span>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </label>
  )
}

export function AiModelFormDialog({
  model,
  trigger,
  presetModelId,
  open: controlledOpen,
  onOpenChange: onControlledOpenChange,
}: {
  model?: AiModel
  trigger?: ReactElement
  /** Điền sẵn model ID khi mở từ catalog. */
  presetModelId?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isEdit = model !== undefined
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const [values, setValues] = useState<AiModelFormValues>(() =>
    toFormValues(model, presetModelId)
  )
  const [errors, setErrors] = useState<AiModelFormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const setOpen = (next: boolean) => {
    if (isControlled) onControlledOpenChange?.(next)
    else setUncontrolledOpen(next)
  }

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
    if (submitted) setErrors(validateAiModelForm(nextValues))
  }

  const updateProvider = (
    context: "scheduleProvider" | "manualProvider" | "readingProvider",
    field: keyof AiModelFormValues["scheduleProvider"],
    value: string | boolean | null
  ) => {
    updateValue(context, { ...values[context], [field]: value })
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen) {
      setValues(toFormValues(model, presetModelId))
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

  const hasBasicErrors = Boolean(errors.key ?? errors.modelId)

  return (
    <ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? <ResponsiveDialogTrigger render={trigger} /> : null}
      <ResponsiveDialogContent className="sm:max-w-2xl">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            {isEdit ? `Sửa model "${model.key}"` : "Thêm AI model"}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Model được chọn ngẫu nhiên trong số các model đang bật của từng ngữ
            cảnh. Giá lấy tự động từ OpenRouter, không nhập tay.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <form
          className="flex min-h-0 flex-1 flex-col gap-6"
          onSubmit={handleSubmit}
          noValidate
        >
          <ResponsiveDialogBody>
            <Tabs defaultValue="basic">
              {/* 4 tab không đủ chỗ ở 375px nên cho cuộn ngang thay vì tràn. */}
              <TabsList className="w-full justify-start overflow-x-auto *:flex-none md:w-fit md:*:flex-1">
                <TabsTrigger value="basic">
                  Cơ bản
                  {hasBasicErrors ? (
                    <span className="ml-1 text-destructive">*</span>
                  ) : null}
                </TabsTrigger>
                <TabsTrigger value="schedule">
                  {MODEL_CONTEXT_LABELS.schedule}
                  {errors.scheduleProvider ? (
                    <span className="ml-1 text-destructive">*</span>
                  ) : null}
                </TabsTrigger>
                <TabsTrigger value="manual">
                  {MODEL_CONTEXT_LABELS.manual}
                  {errors.manualProvider ? (
                    <span className="ml-1 text-destructive">*</span>
                  ) : null}
                </TabsTrigger>
                <TabsTrigger value="reading">
                  {MODEL_CONTEXT_LABELS.reading}
                  {errors.readingProvider ? (
                    <span className="ml-1 text-destructive">*</span>
                  ) : null}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="flex flex-col gap-6 pt-4">
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
                  <FieldError
                    errors={[errors.key ? { message: errors.key } : undefined]}
                  />
                </Field>

                <Field data-invalid={Boolean(errors.modelId)}>
                  <FieldLabel htmlFor="model-modelId">Model ID</FieldLabel>
                  <Input
                    id="model-modelId"
                    placeholder="vd: google/gemini-2.5-flash-lite:nitro"
                    value={values.modelId}
                    onChange={(event) =>
                      updateValue("modelId", event.target.value)
                    }
                    aria-invalid={Boolean(errors.modelId)}
                    autoComplete="off"
                    disabled={isPending}
                    className="font-mono text-base md:text-sm"
                  />
                  <FieldDescription>
                    Model ID trên OpenRouter, dùng trực tiếp khi gọi sinh câu
                    hỏi.
                  </FieldDescription>
                  <FieldError
                    errors={[
                      errors.modelId ? { message: errors.modelId } : undefined,
                    ]}
                  />
                </Field>

                {isEdit ? (
                  <ToggleRow
                    title="Đang hoạt động"
                    description="Tắt để loại model khỏi mọi vòng chọn, không xoá dữ liệu."
                    checked={values.isActive}
                    disabled={isPending}
                    onCheckedChange={(checked) =>
                      updateValue("isActive", checked)
                    }
                  />
                ) : null}

                <ToggleRow
                  title={`Dùng cho ngữ cảnh ${MODEL_CONTEXT_LABELS.schedule.toLowerCase()}`}
                  description={MODEL_CONTEXT_DESCRIPTIONS.schedule}
                  checked={values.scheduleEnabled}
                  disabled={isPending}
                  onCheckedChange={(checked) =>
                    updateValue("scheduleEnabled", checked)
                  }
                />

                <ToggleRow
                  title={`Dùng cho ngữ cảnh ${MODEL_CONTEXT_LABELS.manual.toLowerCase()}`}
                  description={MODEL_CONTEXT_DESCRIPTIONS.manual}
                  checked={values.manualEnabled}
                  disabled={isPending}
                  onCheckedChange={(checked) =>
                    updateValue("manualEnabled", checked)
                  }
                />

                <ToggleRow
                  title={`Dùng cho ngữ cảnh ${MODEL_CONTEXT_LABELS.reading.toLowerCase()}`}
                  description={MODEL_CONTEXT_DESCRIPTIONS.reading}
                  checked={values.readingEnabled}
                  disabled={isPending}
                  onCheckedChange={(checked) =>
                    updateValue("readingEnabled", checked)
                  }
                />
              </TabsContent>

              <TabsContent value="schedule" className="pt-4">
                <p className="mb-4 text-sm text-muted-foreground">
                  Định tuyến provider khi model được dùng ở ngữ cảnh tự động. Để
                  trống là dùng mặc định của OpenRouter.
                </p>
                <ProviderPreferencesFields
                  idPrefix="schedule-provider"
                  values={values.scheduleProvider}
                  errors={errors.scheduleProvider}
                  disabled={isPending}
                  onChange={(field, value) =>
                    updateProvider("scheduleProvider", field, value)
                  }
                />
              </TabsContent>

              <TabsContent value="manual" className="pt-4">
                <p className="mb-4 text-sm text-muted-foreground">
                  Định tuyến provider khi admin bổ sung kho câu hỏi thủ công. Để
                  trống là dùng mặc định của OpenRouter.
                </p>
                <ProviderPreferencesFields
                  idPrefix="manual-provider"
                  values={values.manualProvider}
                  errors={errors.manualProvider}
                  disabled={isPending}
                  onChange={(field, value) =>
                    updateProvider("manualProvider", field, value)
                  }
                />
              </TabsContent>

              <TabsContent value="reading" className="pt-4">
                <p className="mb-4 text-sm text-muted-foreground">
                  Định tuyến provider khi model được dùng để sinh bài đọc. Để
                  trống là dùng mặc định của OpenRouter.
                </p>
                <ProviderPreferencesFields
                  idPrefix="reading-provider"
                  values={values.readingProvider}
                  errors={errors.readingProvider}
                  disabled={isPending}
                  onChange={(field, value) =>
                    updateProvider("readingProvider", field, value)
                  }
                />
              </TabsContent>
            </Tabs>
          </ResponsiveDialogBody>

          <ResponsiveDialogFooter>
            <ResponsiveDialogClose
              render={<Button variant="outline" type="button" />}
            >
              Huỷ
            </ResponsiveDialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner data-icon="inline-start" /> : null}
              {isEdit ? "Lưu thay đổi" : "Thêm model"}
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
