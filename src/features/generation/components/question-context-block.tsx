import type { GeneratedContextBlock } from "../types.ts"

function highlightLine(line: string, highlight: string | undefined) {
  if (!highlight) return line

  const index = line.toLowerCase().indexOf(highlight.toLowerCase())
  if (index === -1) return line

  return (
    <>
      {line.slice(0, index)}
      <mark className="rounded bg-primary/15 px-0.5 text-foreground">
        {line.slice(index, index + highlight.length)}
      </mark>
      {line.slice(index + highlight.length)}
    </>
  )
}

export function QuestionContextBlock({
  block,
}: {
  block: GeneratedContextBlock
}) {
  return (
    <div className="rounded-2xl border bg-muted/40 p-4">
      <p className="text-xs font-medium text-muted-foreground">{block.label}</p>
      <div className="mt-2 space-y-1 text-sm leading-relaxed">
        {block.lines.map((line, index) => (
          <p key={index}>{highlightLine(line, block.highlight)}</p>
        ))}
      </div>
      {block.translation ? (
        <p className="mt-2 text-sm text-muted-foreground italic">
          {block.translation}
        </p>
      ) : null}
    </div>
  )
}
