import type { ReactElement } from "react"
import { useEffect, useMemo, useState } from "react"
import { IconSearch, IconSearchOff } from "@tabler/icons-react"

import { QueryError } from "@/components/common/query-error.tsx"
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/common/responsive-dialog.tsx"
import { StickyTable } from "@/components/common/sticky-table.tsx"
import { TableSkeletonRows } from "@/components/common/table-skeleton-rows.tsx"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatNumber, formatUsdPerMillion } from "@/lib/format.ts"
import { cn } from "@/lib/utils"

import type { AiModel } from "../types.ts"
import { useModelCatalog } from "../hooks/use-model-catalog.ts"

const COLUMN_COUNT = 4
const MAX_VISIBLE = 50

/**
 * Ở điện thoại bảng chỉ giữ tên model và nút chọn; context với giá gộp vào dòng
 * phụ dưới tên nên không phải cuộn ngang chút nào.
 */
const HIDE_UNDER_MD = "hidden text-right md:table-cell"
const SKELETON_COLUMN_CLASSES = [
  undefined,
  HIDE_UNDER_MD,
  HIDE_UNDER_MD,
  undefined,
]

/** Danh sách catalog ~400 model, gõ tới đâu lọc tới đó nên cần debounce nhẹ. */
function useDebounced(value: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}

export function ModelCatalogDialog({
  trigger,
  existingModels,
  onPick,
}: {
  trigger: ReactElement
  existingModels: AiModel[]
  onPick: (modelId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounced(search, 300)

  const { models, isPending, isFetching, isError, error, refetch } =
    useModelCatalog({ search: debouncedSearch, enabled: open })

  const existingIds = useMemo(
    () => new Set(existingModels.map((model) => model.modelId.split(":")[0])),
    [existingModels]
  )

  const visible = models.slice(0, MAX_VISIBLE)

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) setSearch("")
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
      <ResponsiveDialogTrigger render={trigger} />
      <ResponsiveDialogContent className="sm:max-w-3xl">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Catalog OpenRouter</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Danh sách model công khai kèm giá thực tế. Chọn một model để điền
            sẵn vào form thêm mới.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        {/* Ô tìm kiếm nằm ngoài vùng cuộn để gõ lọc không phải cuộn ngược lên. */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 pt-0 md:p-0">
          <InputGroup className="shrink-0">
            <InputGroupAddon>
              <IconSearch stroke={1.5} />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Tìm theo tên hoặc model ID"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              autoComplete="off"
            />
          </InputGroup>

          {isError ? (
            <QueryError
              title="Không tải được catalog"
              error={error}
              onRetry={() => void refetch()}
            />
          ) : !isPending && models.length === 0 ? (
            <Empty className="rounded-2xl border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <IconSearchOff stroke={1.5} />
                </EmptyMedia>
                <EmptyTitle>Không có model nào khớp</EmptyTitle>
                <EmptyDescription>
                  Thử từ khoá khác, vd tên nhà cung cấp hoặc một phần model ID.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <StickyTable className="min-h-0 flex-1 overflow-y-auto md:max-h-96 md:flex-none">
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead className={HIDE_UNDER_MD}>Context</TableHead>
                    <TableHead className={HIDE_UNDER_MD}>Giá /1M</TableHead>
                    <TableHead className="w-28" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPending || isFetching ? (
                    <TableSkeletonRows
                      columns={COLUMN_COUNT}
                      columnClassNames={SKELETON_COLUMN_CLASSES}
                    />
                  ) : (
                    visible.map((catalogModel) => {
                      const alreadyAdded = existingIds.has(catalogModel.id)

                      return (
                        <TableRow key={catalogModel.id}>
                          <TableCell>
                            <p className="font-medium">{catalogModel.name}</p>
                            <p className="font-mono text-xs text-muted-foreground">
                              {catalogModel.id}
                            </p>
                            {/* Context và giá gộp vào đây khi hai cột kia bị ẩn. */}
                            <p className="mt-1 text-xs text-muted-foreground tabular-nums md:hidden">
                              {formatNumber(catalogModel.contextLength)} ctx
                              {" · "}
                              {formatUsdPerMillion(catalogModel.pricing.prompt)}
                              {" / "}
                              {formatUsdPerMillion(
                                catalogModel.pricing.completion
                              )}
                            </p>
                          </TableCell>
                          <TableCell
                            className={cn(HIDE_UNDER_MD, "tabular-nums")}
                          >
                            {formatNumber(catalogModel.contextLength)}
                          </TableCell>
                          <TableCell
                            className={cn(
                              HIDE_UNDER_MD,
                              "text-xs tabular-nums"
                            )}
                          >
                            <p>
                              {formatUsdPerMillion(catalogModel.pricing.prompt)}
                            </p>
                            <p className="text-muted-foreground">
                              {formatUsdPerMillion(
                                catalogModel.pricing.completion
                              )}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-11 w-full md:h-8 md:w-auto"
                              disabled={alreadyAdded}
                              onClick={() => {
                                onPick(catalogModel.id)
                                handleOpenChange(false)
                              }}
                            >
                              {alreadyAdded ? "Đã thêm" : "Dùng model"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </StickyTable>

              {models.length > MAX_VISIBLE ? (
                <p className="text-xs text-muted-foreground">
                  Hiển thị {MAX_VISIBLE} trên {formatNumber(models.length)}{" "}
                  model khớp. Gõ thêm từ khoá để thu hẹp.
                </p>
              ) : null}
            </>
          )}
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
