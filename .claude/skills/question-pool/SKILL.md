---
name: question-pool
description: Question pool pages of english-quiz-dashboard — browse/filter pool questions (react-table v9, column visibility, date range), detail sheet, preview/pop, send to AI review, generate siblings, manual pool refill and sibling refill pages (rendered in /refill tabs). Use when touching src/features/question-pool or src/routes/_dashboard/question-pool.
---

# Question pool (dashboard)

API domain rules: english-quiz-api skills `question-pool`, `sibling-question`.

## Files

| Concern                | Path                                                                                                                                                                                   |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route                  | `src/routes/_dashboard/question-pool/index.tsx`; `question-pool/refill.tsx` only redirects to `/refill`                                                                                |
| Table (react-table v9) | `hooks/use-pool-table.ts`, `components/pool-questions-columns.tsx`, `pool-questions-table.tsx`, `pool-column-visibility-menu.tsx` (+ test), `hooks/use-pool-column-visibility.ts`      |
| Filters / paging       | `components/pool-questions-toolbar.tsx`, `pool-date-range-filter.tsx`, `pool-questions-pagination.tsx`, `utils/sort.ts` (+ test)                                                       |
| Data hooks             | `hooks/use-pool-questions.ts`, `use-pool-models.ts`, `use-pool-preview.ts`, `use-pool-buckets.ts`                                                                                      |
| Detail / preview       | `components/pool-question-detail-sheet.tsx`, `pool-question-body.tsx`, `pool-preview-dialog.tsx`, `utils/question-data.ts` (parse `questionData` per quiz type)                        |
| Review hand-off        | `components/pool-review-selection-bar.tsx` → `features/pool-review/components/send-review-dialog.tsx`                                                                                  |
| Siblings               | `components/generate-siblings-dialog.tsx`, `hooks/use-generate-siblings.ts`; refill page `components/sibling-refill-page.tsx`, `hooks/use-sibling-buckets.ts`, `use-sibling-refill.ts` |
| Manual refill          | `components/manual-refill-page.tsx`, `hooks/use-manual-refill.ts`, `use-manual-refill-models.ts` (shared UI from `features/refill`)                                                    |

All paths above are under `src/features/question-pool/` unless they start with `src/`.

## Recipes

- **New column** → `pool-questions-columns.tsx` + default visibility in `use-pool-column-visibility.ts`; sortable only if the API supports that sort value.
- **New filter** → API param first, then `validateSearch` in the route, toolbar control, params builder in `use-pool-questions.ts`.
- **New quiz type rendering** → `utils/question-data.ts` + `pool-question-body.tsx` (and `features/generation` for generated preview).

## Tests

`utils/sort.test.ts`, `components/pool-column-visibility-menu.test.tsx`.
