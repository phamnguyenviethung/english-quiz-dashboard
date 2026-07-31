export interface CreateTopicValues {
  name: string
  description: string
}

export type CreateTopicErrors = Partial<Record<keyof CreateTopicValues, string>>

const NAME_MIN = 2
const NAME_MAX = 64
const DESCRIPTION_MAX = 500

export function validateCreateTopic(
  values: CreateTopicValues
): CreateTopicErrors {
  const errors: CreateTopicErrors = {}
  const name = values.name.trim()

  if (!name) {
    errors.name = "Vui lòng nhập tên chủ đề."
  } else if (name.length < NAME_MIN) {
    errors.name = `Tên chủ đề cần ít nhất ${NAME_MIN} ký tự.`
  } else if (name.length > NAME_MAX) {
    errors.name = `Tên chủ đề tối đa ${NAME_MAX} ký tự.`
  }

  if (values.description.trim().length > DESCRIPTION_MAX) {
    errors.description = `Mô tả tối đa ${DESCRIPTION_MAX} ký tự.`
  }

  return errors
}

export function hasErrors(errors: CreateTopicErrors): boolean {
  return Object.keys(errors).length > 0
}
