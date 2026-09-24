---
name: pool-review
description: AI pool review pages of english-quiz-dashboard — review list (table + mobile card list), review detail with diff, checklist, badges, JSON edit, approve/reject/delete, send-review dialog, review siblings. Use when touching src/features/pool-review or src/routes/_dashboard/pool-review.
---

# Pool review (dashboard)

API rules: english-quiz-api skill `pool-review` (only `pending` reviews can be approved/rejected; approve may send admin-edited `data`).

## Files (under `src/features/pool-review/`)

| Concern                             | Path                                                                                                                                                              |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Routes                              | `src/routes/_dashboard/pool-review/index.tsx` (list), `src/routes/_dashboard/pool-review/$reviewId.tsx` (detail)                                                  |
| Search params                       | `search.ts` (parse/serialize list filters — reuse in route `validateSearch`)                                                                                      |
| List                                | `components/pool-reviews-table.tsx`, `pool-review-card-list.tsx` (mobile), `pool-reviews-toolbar.tsx`, `pool-reviews-pagination.tsx`; `hooks/use-pool-reviews.ts` |
| Detail                              | `hooks/use-pool-review.ts`, `components/question-diff-view.tsx`, `review-checklist.tsx`, `review-badges.tsx`, `review-edit-json-panel.tsx`, `review-actions.tsx`  |
| Mutations                           | `hooks/use-review-mutations.ts` (approve / reject / delete / create)                                                                                              |
| Siblings of reviewed item           | `hooks/use-review-siblings.ts`                                                                                                                                    |
| Send dialog (used by question-pool) | `components/send-review-dialog.tsx`                                                                                                                               |
| Labels/status                       | `constants.ts`, `types.ts`                                                                                                                                        |

## Recipes

- **New checklist flag / verdict** → regenerate API client, add label in `constants.ts`, render in `review-checklist.tsx` / `review-badges.tsx`.
- After approve, invalidate both review queries and the pool questions list (the pool item changed).
