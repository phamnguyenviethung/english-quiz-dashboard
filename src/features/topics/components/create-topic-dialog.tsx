import { useState } from "react"
import { IconPlus } from "@tabler/icons-react"

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
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { API_ERROR_CODE, isApiErrorCode } from "@/lib/api-error.ts"

import { useCreateTopic } from "../hooks/use-create-topic.ts"
import type { CreateTopicErrors } from "../utils/validate-topic.ts"
import { hasErrors, validateCreateTopic } from "../utils/validate-topic.ts"

const EMPTY_VALUES = { name: "", description: "" }

export function CreateTopicDialog() {
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState(EMPTY_VALUES)
  const [errors, setErrors] = useState<CreateTopicErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const { createTopic, isPending, reset } = useCreateTopic({
    onSuccess: () => {
      setOpen(false)
    },
  })

  const updateValue = (key: keyof typeof EMPTY_VALUES, value: string) => {
    const nextValues = { ...values, [key]: value }
    setValues(nextValues)
    if (submitted) {
      setErrors(validateCreateTopic(nextValues))
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setValues(EMPTY_VALUES)
      setErrors({})
      setSubmitted(false)
      reset()
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)

    const nextErrors = validateCreateTopic(values)
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return

    try {
      await createTopic(values)
    } catch (error) {
      if (isApiErrorCode(error, API_ERROR_CODE.CONFLICT)) {
        setErrors({ name: "Tên chủ đề đã tồn tại, hãy chọn tên khác." })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button>
            <IconPlus stroke={1.5} data-icon="inline-start" />
            Tạo chủ đề
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo chủ đề mới</DialogTitle>
          <DialogDescription>
            Tên chủ đề không được trùng, dùng để phân loại câu hỏi.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-6"
          onSubmit={handleSubmit}
          noValidate
        >
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor="topic-name">Tên chủ đề</FieldLabel>
            <Input
              id="topic-name"
              placeholder="vd: travel"
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
            <FieldLabel htmlFor="topic-description">Mô tả</FieldLabel>
            <Textarea
              id="topic-description"
              rows={3}
              placeholder="Mô tả ngắn về chủ đề này"
              value={values.description}
              onChange={(event) =>
                updateValue("description", event.target.value)
              }
              aria-invalid={Boolean(errors.description)}
              disabled={isPending}
            />
            <FieldError
              errors={[
                errors.description
                  ? { message: errors.description }
                  : undefined,
              ]}
            />
          </Field>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Huỷ
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner data-icon="inline-start" /> : null}
              Tạo chủ đề
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
