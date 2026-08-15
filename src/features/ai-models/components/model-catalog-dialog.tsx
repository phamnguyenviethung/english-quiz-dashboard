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
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { formatNumber, formatUsdPerMillion } from "@/lib/format.ts"

import type { AiModel } from "../types.ts"
import { useModelCatalog } from "../hooks/use-model-catalog.ts"

const MAX_VISIBLE = 50
const SKELETON_COUNT = 5

function CatalogItemSkeleton() {
  return (
    <Item variant="outline" className="items-start">
      <ItemContent className="gap-2">
        <Skeleton className="h-4 w-44 max-w-full" />
        <Skeleton className="h-3 w-56 max-w-full" />
        <Skeleton className="h-3 w-32" />
      </ItemContent>
      <ItemActions>
        <Skeleton className="h-11 w-28 rounded-4xl md:h-8" />
      </ItemActions>
    </Item>
  )
}

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
              <div className="min-h-0 flex-1 overflow-y-auto md:max-h-96">
                <ItemGroup>
                  {isPending || isFetching
                    ? Array.from({ length: SKELETON_COUNT }, (_item, index) => (
                        <CatalogItemSkeleton key={index} />
                      ))
                    : visible.map((catalogModel) => {
                        const alreadyAdded = existingIds.has(catalogModel.id)

                        return (
                          <Item
                            key={catalogModel.id}
                            role="listitem"
                            variant="outline"
                            className="items-start"
                          >
                            <ItemContent>
                              <ItemTitle>{catalogModel.name}</ItemTitle>
                              <ItemDescription className="line-clamp-none font-mono text-xs break-all">
                                {catalogModel.id}
                              </ItemDescription>
                              <p className="text-xs text-muted-foreground tabular-nums">
                                {formatNumber(catalogModel.contextLength)} ctx
                                {" · "}
                                {formatUsdPerMillion(
                                  catalogModel.pricing.prompt
                                )}
                                {" / "}
                                {formatUsdPerMillion(
                                  catalogModel.pricing.completion
                                )}
                              </p>
                            </ItemContent>
                            <ItemActions>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-11 shrink-0 md:h-8"
                                disabled={alreadyAdded}
                                onClick={() => {
                                  onPick(catalogModel.id)
                                  handleOpenChange(false)
                                }}
                              >
                                {alreadyAdded ? "Đã thêm" : "Dùng model"}
                              </Button>
                            </ItemActions>
                          </Item>
                        )
                      })}
                </ItemGroup>
              </div>

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
