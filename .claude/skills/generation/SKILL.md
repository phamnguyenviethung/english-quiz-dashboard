---
name: generation
description: Ad-hoc generation playground of english-quiz-dashboard (/generate) — generate a question for any quiz type or a reading quiz, render normalized question card, options, context, token usage. Use when touching src/features/generation or src/routes/_dashboard/generate.tsx, or when a new quiz type needs rendering.
---

# Generation (dashboard)

## Files (under `src/features/generation/`)
| Concern | Path |
|---|---|
| Route | `src/routes/_dashboard/generate.tsx` |
| Form | `components/generate-form.tsx`, `utils/validate-generate.ts` |
| Mutation | `hooks/use-generate-question.ts` (`POST /english/generate/:quizType`, `POST /english/generate-reading`) |
| Rendering | `utils/normalize-generated-question.ts` (+ test) maps every quiz type's shape into one view model; `components/generated-question-card.tsx`, `question-option-list.tsx`, `question-context-block.tsx`, `generation-usage.tsx` |

## Recipe: new quiz type
1. Regenerate API client (`api-contract-sync`).
2. Add the type to `src/features/quiz` constants/types.
3. Add a branch in `normalize-generated-question.ts` + test case.
4. Check `features/question-pool/utils/question-data.ts` renders it too.
