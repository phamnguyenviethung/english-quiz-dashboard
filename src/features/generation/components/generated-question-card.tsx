import { CollapsibleJson } from "@/components/common/json-block.tsx"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

import { GENERATE_TYPE_META } from "../constants.ts"
import type { GeneratedQuestionView } from "../types.ts"
import { GenerationUsage } from "./generation-usage.tsx"
import { QuestionContextBlock } from "./question-context-block.tsx"
import { QuestionOptionList } from "./question-option-list.tsx"

export function GeneratedQuestionCard({
  view,
}: {
  view: GeneratedQuestionView
}) {
  const meta = GENERATE_TYPE_META[view.quizType]
  const TypeIcon = meta.icon

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            <TypeIcon className="size-3.5" stroke={1.5} />
            {meta.label}
          </Badge>
          {view.meta.map((item) => (
            <Badge key={item.label} variant="outline">
              {item.label}: {item.value}
            </Badge>
          ))}
        </div>
        <div className="mt-3 space-y-1">
          <p className="text-xs text-muted-foreground">{view.promptLabel}</p>
          <p className="text-lg leading-snug font-semibold">{view.prompt}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {view.contextBlocks.map((block, index) => (
          <QuestionContextBlock key={index} block={block} />
        ))}

        <QuestionOptionList options={view.options} />

        {view.explanation ? (
          <div className="rounded-2xl border p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Giải thích
            </p>
            <p className="mt-1 text-sm leading-relaxed">{view.explanation}</p>
          </div>
        ) : null}

        {view.example ? (
          <div className="rounded-2xl border p-4">
            <p className="text-xs font-medium text-muted-foreground">Ví dụ</p>
            <p className="mt-1 text-sm leading-relaxed">
              {view.example.sentence}
            </p>
            {view.example.translation ? (
              <p className="mt-1 text-sm text-muted-foreground italic">
                {view.example.translation}
              </p>
            ) : null}
          </div>
        ) : null}

        {view.usage ? <GenerationUsage usage={view.usage} /> : null}

        <CollapsibleJson label="Xem dữ liệu gốc" value={view.raw} />
      </CardContent>
    </Card>
  )
}
