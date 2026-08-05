import {
  columnVisibilityFeature,
  createColumnHelper,
  rowSortingFeature,
  tableFeatures,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import {
  formatModelName,
  getEngLevelBadgeClass,
  getQuizTypeMeta,
} from "@/features/quiz/constants.ts"
import { formatDateTime, formatNumber } from "@/lib/format.ts"

import { NO_TOPIC_LABEL } from "../constants.ts"
import type { PoolQuestion } from "../types.ts"

interface PoolColumnMeta {
  /** Nhãn tiếng Việt dùng cho menu ẩn/hiện cột (header có thể là JSX). */
  label: string
  align?: "right"
  headClassName?: string
}

export const poolTableFeatures = tableFeatures({
  rowSortingFeature,
  columnVisibilityFeature,
  columnMeta: {} as PoolColumnMeta,
})

export type PoolTableFeatures = typeof poolTableFeatures

const helper = createColumnHelper<PoolTableFeatures, PoolQuestion>()

export const poolColumns = helper.columns([
  helper.accessor("id", {
    header: "ID",
    enableSorting: true,
    meta: { label: "ID", headClassName: "w-20" },
    cell: ({ getValue }) => (
      <span className="text-muted-foreground tabular-nums">{getValue()}</span>
    ),
  }),
  helper.accessor("quizType", {
    header: "Loại câu",
    enableSorting: false,
    meta: { label: "Loại câu" },
    cell: ({ getValue }) => {
      const meta = getQuizTypeMeta(getValue())
      const Icon = meta.icon
      return (
        <Badge variant="secondary">
          {Icon ? (
            <Icon className="size-3.5" stroke={1.5} data-icon="inline-start" />
          ) : null}
          {meta.label}
        </Badge>
      )
    },
  }),
  helper.accessor("engLevel", {
    header: "Cấp độ",
    enableSorting: false,
    meta: { label: "Cấp độ", headClassName: "w-20" },
    cell: ({ getValue }) => (
      <Badge variant="secondary" className={getEngLevelBadgeClass(getValue())}>
        {getValue()}
      </Badge>
    ),
  }),
  helper.accessor("topicName", {
    header: "Chủ đề",
    enableSorting: false,
    meta: { label: "Chủ đề" },
    cell: ({ getValue }) => {
      const topicName = getValue()
      return (
        <span className="block max-w-[24ch] truncate">
          {topicName ?? (
            <span className="text-muted-foreground">{NO_TOPIC_LABEL}</span>
          )}
        </span>
      )
    },
  }),
  helper.accessor("model", {
    header: "Model",
    enableSorting: false,
    meta: { label: "Model" },
    cell: ({ getValue }) => {
      const raw = getValue()
      const model = formatModelName(raw)
      return (
        <span className="text-xs text-muted-foreground" title={raw}>
          {model.provider ? (
            <span className="text-muted-foreground/70">{model.provider}/</span>
          ) : null}
          <span className="font-medium text-foreground">{model.name}</span>
          {model.suffix ? (
            <span className="text-muted-foreground/70">:{model.suffix}</span>
          ) : null}
        </span>
      )
    },
  }),
  helper.accessor("optionCount", {
    header: "Đáp án",
    enableSorting: false,
    meta: { label: "Số đáp án", align: "right", headClassName: "w-20" },
    cell: ({ getValue }) => (
      <span className="text-muted-foreground tabular-nums">{getValue()}</span>
    ),
  }),
  helper.accessor((row) => row.tokenIn + row.tokenOut, {
    id: "token",
    header: "Token",
    enableSorting: true,
    meta: { label: "Token", align: "right" },
    cell: ({ getValue }) => (
      <span className="tabular-nums">{formatNumber(getValue())}</span>
    ),
  }),
  helper.accessor("createdAt", {
    header: "Tạo lúc",
    enableSorting: true,
    meta: { label: "Tạo lúc" },
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground tabular-nums">
        {formatDateTime(getValue())}
      </span>
    ),
  }),
])
