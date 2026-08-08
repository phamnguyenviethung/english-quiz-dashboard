import type { ReactElement } from "react"
import { useEffect, useMemo, useState } from "react"
import { IconSearch, IconSearchOff } from "@tabler/icons-react"

import { QueryError } from "@/components/common/query-error.tsx"
import { TableSkeletonRows } from "@/components/common/table-skeleton-rows.tsx"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatNumber, formatUsdPerMillion } from "@/lib/format.ts"

import type { AiModel } from "../types.ts"
import { useModelCatalog } from "../hooks/use-model-catalog.ts"

const COLUMN_COUNT = 4
const MAX_VISIBLE = 50

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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Catalog OpenRouter</DialogTitle>
          <DialogDescription>
            Danh sách model công khai kèm giá thực tế. Chọn một model để điền
            sẵn vào form thêm mới.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <InputGroup>
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
              <div className="max-h-[24rem] overflow-auto rounded-2xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Model</TableHead>
                      <TableHead className="text-right">Context</TableHead>
                      <TableHead className="text-right">Giá /1M</TableHead>
                      <TableHead className="w-28" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isPending || isFetching ? (
                      <TableSkeletonRows columns={COLUMN_COUNT} />
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
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatNumber(catalogModel.contextLength)}
                            </TableCell>
                            <TableCell className="text-right text-xs tabular-nums">
                              <p>
                                {formatUsdPerMillion(
                                  catalogModel.pricing.prompt
                                )}
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
                </Table>
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
      </DialogContent>
    </Dialog>
  )
}
