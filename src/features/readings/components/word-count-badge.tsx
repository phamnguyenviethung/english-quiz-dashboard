import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import { getWordBand, isWordCountInBand } from "../constants.ts"

/**
 * Số từ kèm cảnh báo lệch band CEFR. Guideline đặt độ dài theo từng level, nên bài
 * lệch band là tín hiệu chất lượng cần thấy ngay trong bảng chứ không phải đi tìm.
 */
export function WordCountBadge({
  cefrLevel,
  wordCount,
  className,
}: {
  cefrLevel: string
  wordCount: number
  className?: string
}) {
  const band = getWordBand(cefrLevel)
  const inBand = isWordCountInBand(cefrLevel, wordCount)

  if (!band) {
    return <span className={cn("tabular-nums", className)}>{wordCount} từ</span>
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Badge
            variant={inBand ? "outline" : "secondary"}
            className={cn(
              "tabular-nums",
              !inBand &&
                "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
              className
            )}
          >
            {wordCount} từ
          </Badge>
        }
      />
      <TooltipContent>
        {inBand
          ? `Đúng band ${cefrLevel}: ${band.min}-${band.max} từ`
          : `Lệch band ${cefrLevel} (${band.min}-${band.max} từ)`}
      </TooltipContent>
    </Tooltip>
  )
}
