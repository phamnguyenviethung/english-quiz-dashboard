import { CollapsibleJson } from "@/components/common/json-block.tsx"

import type { QuestionDataResult } from "../utils/question-data.ts"

/** Render nội dung 1 câu hỏi đã parse. Dùng chung cho dialog xem mẫu và sheet chi tiết. */
export function PoolQuestionBody({ parsed }: { parsed: QuestionDataResult }) {
  return (
    <div className="space-y-4">
      {parsed.kind === "structured" ? (
        <div className="space-y-4">
          {parsed.question.prompt ? (
            <p className="text-sm leading-relaxed font-medium">
              {parsed.question.prompt}
            </p>
          ) : null}

          {parsed.question.options ? (
            <ol className="space-y-1.5 text-sm">
              {parsed.question.options.map((option, index) => (
                <li key={index} className="flex gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span>{option}</span>
                </li>
              ))}
            </ol>
          ) : null}

          {parsed.question.answer ? (
            <p className="text-sm text-muted-foreground">
              Đáp án:{" "}
              <span className="font-medium text-foreground">
                {parsed.question.answer}
              </span>
            </p>
          ) : null}
        </div>
      ) : null}

      <CollapsibleJson
        label="Xem dữ liệu gốc"
        value={parsed.kind === "structured" ? parsed.raw : parsed.text}
      />
    </div>
  )
}
