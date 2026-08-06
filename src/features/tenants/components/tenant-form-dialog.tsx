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
import { Textarea } from "@/components/ui/textarea"
import { API_ERROR_CODE, isApiErrorCode } from "@/lib/api-error.ts"

import { useCreateTenant } from "../hooks/use-create-tenant.ts"
import { useUpdateTenant } from "../hooks/use-update-tenant.ts"
import type { Tenant, TenantFormValues } from "../types.ts"
import type { TenantFormErrors } from "../utils/validate-tenant.ts"
import { hasErrors, validateTenantForm } from "../utils/validate-tenant.ts"

const EMPTY_VALUES: TenantFormValues = {
  name: "",
  description: "",
  allowAllTopics: false,
  allowAllQuizTypes: false,
}

function toFormValues(tenant: Tenant | undefined): TenantFormValues {
  if (!tenant) return EMPTY_VALUES
  return {
    name: tenant.name,
    description: tenant.description ?? "",
    allowAllTopics: tenant.allowAllTopics,
    allowAllQuizTypes: tenant.allowAllQuizTypes,
  }
}

export function TenantFormDialog({
  tenant,
  trigger,
}: {
  tenant?: Tenant
  trigger: ReactElement
}) {
  const isEdit = tenant !== undefined
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<TenantFormValues>(() =>
    toFormValues(tenant)
  )
  const [errors, setErrors] = useState<TenantFormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const close = () => setOpen(false)
  const create = useCreateTenant({ onSuccess: close })
  const update = useUpdateTenant(tenant?.id ?? 0, { onSuccess: close })
  const isPending = isEdit ? update.isPending : create.isPending

  const updateValue = <TField extends keyof TenantFormValues>(
    key: TField,
    value: TenantFormValues[TField]
  ) => {
    const nextValues = { ...values, [key]: value }
    setValues(nextValues)
    if (submitted) {
      setErrors(validateTenantForm(nextValues))
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen) {
      setValues(toFormValues(tenant))
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

    const nextErrors = validateTenantForm(values)
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return

    try {
      if (isEdit) await update.updateTenantFromForm(values)
      else await create.createTenant(values)
    } catch (error) {
      if (isApiErrorCode(error, API_ERROR_CODE.CONFLICT)) {
        setErrors({ name: "Tên tenant đã tồn tại, hãy chọn tên khác." })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Sửa tenant "${tenant.name}"` : "Tạo tenant mới"}
          </DialogTitle>
          <DialogDescription>
            Tenant là một client gọi API (vd một bot Discord), chỉ có quyền đọc
            quiz. Phạm vi chủ đề / dạng quiz cấp ở tab "Phân quyền".
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor="tenant-name">Tên tenant</FieldLabel>
            <Input
              id="tenant-name"
              placeholder="vd: discord-bot-main"
              value={values.name}
              onChange={(event) => updateValue("name", event.target.value)}
              aria-invalid={Boolean(errors.name)}
              autoComplete="off"
              disabled={isPending}
            />
            <FieldError
              errors={[errors.name ? { message: errors.name } : undefined]}
            />
          </Field>

          <Field data-invalid={Boolean(errors.description)}>
            <FieldLabel htmlFor="tenant-description">Mô tả</FieldLabel>
            <Textarea
              id="tenant-description"
              rows={2}
              placeholder="Client này dùng cho việc gì"
              value={values.description}
              onChange={(event) =>
                updateValue("description", event.target.value)
              }
              aria-invalid={Boolean(errors.description)}
              disabled={isPending}
            />
            <FieldError
              errors={[
                errors.description ? { message: errors.description } : undefined,
              ]}
            />
          </Field>

          <Field>
            <FieldLabel>Phạm vi truy cập</FieldLabel>
            <FieldDescription>
              Bật để bỏ qua allow-list, tenant dùng được toàn bộ chủ đề hoặc dạng
              quiz.
            </FieldDescription>
            <div className="grid gap-3 rounded-2xl border p-4">
              <label className="flex items-center justify-between gap-4 text-sm">
                <span>Cho phép mọi chủ đề</span>
                <Switch
                  checked={values.allowAllTopics}
                  onCheckedChange={(checked) =>
                    updateValue("allowAllTopics", checked)
                  }
                  disabled={isPending}
                />
              </label>
              <label className="flex items-center justify-between gap-4 text-sm">
                <span>Cho phép mọi dạng quiz</span>
                <Switch
                  checked={values.allowAllQuizTypes}
                  onCheckedChange={(checked) =>
                    updateValue("allowAllQuizTypes", checked)
                  }
                  disabled={isPending}
                />
              </label>
            </div>
          </Field>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Huỷ
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner data-icon="inline-start" /> : null}
              {isEdit ? "Lưu thay đổi" : "Tạo tenant"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
