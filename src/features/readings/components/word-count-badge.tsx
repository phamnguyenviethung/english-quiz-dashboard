import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import { isWordCountInBand, READING_WORD_BAND } from "../constants.ts"

/**
 * Số từ kèm cảnh báo lệch band. Guideline dùng chung một band cho mọi level, nên bài
 * lệch band là tín hiệu chất lượng cần thấy ngay trong bảng chứ không phải đi tìm.
 */
export function WordCountBadge({
  wordCount,
  className,
}: {
  wordCount: number
  className?: string
}) {
  const inBand = isWordCountInBand(wordCount)

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
          ? `Đúng band: ${READING_WORD_BAND.min}-${READING_WORD_BAND.max} từ`
          : `Lệch band (${READING_WORD_BAND.min}-${READING_WORD_BAND.max} từ)`}
      </TooltipContent>
    </Tooltip>
  )
}
