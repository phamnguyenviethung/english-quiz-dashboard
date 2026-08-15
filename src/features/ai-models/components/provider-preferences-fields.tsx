import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import {
  PROVIDER_DATA_COLLECTION_OPTIONS,
  PROVIDER_SORT_OPTIONS,
  PROVIDER_UNSET_LABEL,
  PROVIDER_UNSET_VALUE,
} from "../constants.ts"
import type { ProviderFormValues } from "../types.ts"
import type { ProviderFormErrors } from "../utils/validate-ai-model.ts"

/**
 * Switch không biểu diễn được trạng thái "không đặt" nên tri-state đi qua Select:
 * mặc định / bật / tắt. Không đặt = để OpenRouter dùng default của họ.
 */
const TRISTATE_ON = "on"
const TRISTATE_OFF = "off"

function triStateValue(value: boolean | null): string {
  if (value === null) return PROVIDER_UNSET_VALUE
  return value ? TRISTATE_ON : TRISTATE_OFF
}

function parseTriState(value: string): boolean | null {
  if (value === TRISTATE_ON) return true
  if (value === TRISTATE_OFF) return false
  return null
}

const TRISTATE_ITEMS = {
  [PROVIDER_UNSET_VALUE]: PROVIDER_UNSET_LABEL,
  [TRISTATE_ON]: "Bật",
  [TRISTATE_OFF]: "Tắt",
}

function TriStateField({
  id,
  label,
  description,
  value,
  disabled,
  onChange,
}: {
  id: string
  label: string
  description: string
  value: boolean | null
  disabled: boolean
  onChange: (value: boolean | null) => void
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select
        items={TRISTATE_ITEMS}
        value={triStateValue(value)}
        onValueChange={(next) => onChange(parseTriState(String(next)))}
        disabled={disabled}
      >
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(TRISTATE_ITEMS).map(([itemValue, itemLabel]) => (
            <SelectItem key={itemValue} value={itemValue}>
              {itemLabel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldDescription>{description}</FieldDescription>
    </Field>
  )
}

export function ProviderPreferencesFields({
  idPrefix,
  values,
  errors,
  disabled,
  onChange,
}: {
  idPrefix: string
  values: ProviderFormValues
  errors: ProviderFormErrors | undefined
  disabled: boolean
  onChange: <TField extends keyof ProviderFormValues>(
    field: TField,
    value: ProviderFormValues[TField]
  ) => void
}) {
  const sortItems = {
    [PROVIDER_UNSET_VALUE]: PROVIDER_UNSET_LABEL,
    ...Object.fromEntries(
      PROVIDER_SORT_OPTIONS.map((option) => [option.value, option.label])
    ),
  }
  const dataCollectionItems = {
    [PROVIDER_UNSET_VALUE]: PROVIDER_UNSET_LABEL,
    ...Object.fromEntries(
      PROVIDER_DATA_COLLECTION_OPTIONS.map((option) => [
        option.value,
        option.label,
      ])
    ),
  }

  return (
    <div className="flex flex-col gap-6">
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-order`}>Thứ tự provider</FieldLabel>
        <Input
          id={`${idPrefix}-order`}
          placeholder="vd: google-vertex, google-ai-studio"
          value={values.order}
          onChange={(event) => onChange("order", event.target.value)}
          disabled={disabled}
          autoComplete="off"
          className="font-mono text-base md:text-sm"
        />
        <FieldDescription>
          Danh sách slug cách nhau bởi dấu phẩy. Gọi lần lượt từ trái sang phải.
        </FieldDescription>
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={`${idPrefix}-only`}>Chỉ dùng</FieldLabel>
          <Input
            id={`${idPrefix}-only`}
            placeholder="vd: together, fireworks"
            value={values.only}
            onChange={(event) => onChange("only", event.target.value)}
            disabled={disabled}
            autoComplete="off"
            className="font-mono text-base md:text-sm"
          />
          <FieldDescription>Chỉ cho phép các provider này.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor={`${idPrefix}-ignore`}>Bỏ qua</FieldLabel>
          <Input
            id={`${idPrefix}-ignore`}
            placeholder="vd: deepinfra"
            value={values.ignore}
            onChange={(event) => onChange("ignore", event.target.value)}
            disabled={disabled}
            autoComplete="off"
            className="font-mono text-base md:text-sm"
          />
          <FieldDescription>Loại các provider này ra.</FieldDescription>
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={`${idPrefix}-sort`}>Ưu tiên sắp xếp</FieldLabel>
          <Select
            items={sortItems}
            value={values.sort || PROVIDER_UNSET_VALUE}
            onValueChange={(next) =>
              onChange(
                "sort",
                next === PROVIDER_UNSET_VALUE ? "" : String(next)
              )
            }
            disabled={disabled}
          >
            <SelectTrigger id={`${idPrefix}-sort`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PROVIDER_UNSET_VALUE}>
                {PROVIDER_UNSET_LABEL}
              </SelectItem>
              {PROVIDER_SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>
            Bỏ qua nếu đã đặt thứ tự provider.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor={`${idPrefix}-data-collection`}>
            Thu thập dữ liệu
          </FieldLabel>
          <Select
            items={dataCollectionItems}
            value={values.dataCollection || PROVIDER_UNSET_VALUE}
            onValueChange={(next) =>
              onChange(
                "dataCollection",
                next === PROVIDER_UNSET_VALUE ? "" : String(next)
              )
            }
            disabled={disabled}
          >
            <SelectTrigger id={`${idPrefix}-data-collection`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PROVIDER_UNSET_VALUE}>
                {PROVIDER_UNSET_LABEL}
              </SelectItem>
              {PROVIDER_DATA_COLLECTION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>
            Từ chối = chỉ dùng provider không lưu dữ liệu người dùng.
          </FieldDescription>
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field data-invalid={Boolean(errors?.maxPricePrompt)}>
          <FieldLabel htmlFor={`${idPrefix}-max-prompt`}>
            Trần giá đầu vào
          </FieldLabel>
          <Input
            id={`${idPrefix}-max-prompt`}
            inputMode="decimal"
            placeholder="vd: 0.5"
            value={values.maxPricePrompt}
            onChange={(event) => onChange("maxPricePrompt", event.target.value)}
            aria-invalid={Boolean(errors?.maxPricePrompt)}
            disabled={disabled}
            autoComplete="off"
          />
          <FieldDescription>USD trên 1 triệu token.</FieldDescription>
          <FieldError
            errors={[
              errors?.maxPricePrompt
                ? { message: errors.maxPricePrompt }
                : undefined,
            ]}
          />
        </Field>

        <Field data-invalid={Boolean(errors?.maxPriceCompletion)}>
          <FieldLabel htmlFor={`${idPrefix}-max-completion`}>
            Trần giá đầu ra
          </FieldLabel>
          <Input
            id={`${idPrefix}-max-completion`}
            inputMode="decimal"
            placeholder="vd: 1.5"
            value={values.maxPriceCompletion}
            onChange={(event) =>
              onChange("maxPriceCompletion", event.target.value)
            }
            aria-invalid={Boolean(errors?.maxPriceCompletion)}
            disabled={disabled}
            autoComplete="off"
          />
          <FieldDescription>USD trên 1 triệu token.</FieldDescription>
          <FieldError
            errors={[
              errors?.maxPriceCompletion
                ? { message: errors.maxPriceCompletion }
                : undefined,
            ]}
          />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <TriStateField
          id={`${idPrefix}-allow-fallbacks`}
          label="Cho phép dự phòng"
          description="Tắt = chỉ dùng provider đã chọn."
          value={values.allowFallbacks}
          disabled={disabled}
          onChange={(next) => onChange("allowFallbacks", next)}
        />
        <TriStateField
          id={`${idPrefix}-require-parameters`}
          label="Bắt buộc hỗ trợ tham số"
          description="Chỉ provider hỗ trợ đủ tham số gửi lên."
          value={values.requireParameters}
          disabled={disabled}
          onChange={(next) => onChange("requireParameters", next)}
        />
        <TriStateField
          id={`${idPrefix}-zdr`}
          label="Chỉ endpoint ZDR"
          description="Zero Data Retention."
          value={values.zdr}
          disabled={disabled}
          onChange={(next) => onChange("zdr", next)}
        />
      </div>

      <Collapsible>
        <CollapsibleTrigger className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
          Tuỳ chọn nâng cao (JSON)
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <Field data-invalid={Boolean(errors?.advancedJson)}>
            <FieldLabel htmlFor={`${idPrefix}-advanced`}>
              Provider JSON bổ sung
            </FieldLabel>
            <Textarea
              id={`${idPrefix}-advanced`}
              rows={6}
              placeholder={'{\n  "quantizations": ["fp8"]\n}'}
              value={values.advancedJson}
              onChange={(event) => onChange("advancedJson", event.target.value)}
              aria-invalid={Boolean(errors?.advancedJson)}
              disabled={disabled}
              className="font-mono text-sm md:text-xs"
            />
            <FieldDescription>
              Các key chưa có ô riêng, vd `quantizations`. Ô phía trên sẽ ghi đè
              key trùng tên.
            </FieldDescription>
            <FieldError
              errors={[
                errors?.advancedJson
                  ? { message: errors.advancedJson }
                  : undefined,
              ]}
            />
          </Field>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
