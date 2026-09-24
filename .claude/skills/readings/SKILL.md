---
name: readings
description: Reading passages and reading questions pages of english-quiz-dashboard (features/readings + features/reading-questions) — server-paginated lists, detail sheets, generate dialogs, edit/toggle/delete, beginner flag, passage question panel, refill pages rendered in /refill tabs. Use when touching either feature or their routes.
---

# Readings & reading questions (dashboard)

The two features are coupled (they import each other). API rules: english-quiz-api skills `reading-passage`, `reading-question`.

## features/readings (template for server-paginated pages)
| Concern | Path |
|---|---|
| Route | `src/routes/_dashboard/readings/index.tsx` (`readings/refill.tsx` redirects to `/refill`) |
| List | `hooks/use-readings.ts` (`buildReadingsParams`, `useReadings`), `components/readings-table.tsx`, `readings-toolbar.tsx`, `readings-pagination.tsx`, `word-count-badge.tsx` |
| Detail/edit | `components/reading-detail-sheet.tsx`, `hooks/use-mutate-reading.ts` (`useUpdateReading`, `useDeleteReading`, `useInvalidateReadings`) |
| Generate | `components/reading-generate-dialog.tsx`, `hooks/use-generate-reading.ts` |
| Refill | `components/reading-refill-page.tsx`, `hooks/use-reading-refill.ts`, `use-reading-buckets.ts`, `use-reading-models.ts` |

## features/reading-questions
| Concern | Path |
|---|---|
| Route | `src/routes/_dashboard/reading-questions/index.tsx` |
| List | `hooks/use-reading-questions.ts`, `components/reading-questions-table.tsx`, `reading-questions-toolbar.tsx`, `reading-questions-pagination.tsx`, `reading-question-card.tsx` |
| Detail/edit | `components/reading-question-detail-sheet.tsx`, `reading-question-body.tsx`, `hooks/use-mutate-reading-question.ts` |
| Per-passage panel | `components/passage-questions-panel.tsx` (shown inside reading detail) |
| Generate | `components/generate-questions-dialog.tsx`, `hooks/use-generate-reading-questions.ts` |
| Refill | `components/reading-question-refill-page.tsx`, `hooks/use-reading-question-refill.ts`, `use-reading-question-buckets.ts`, `use-reading-question-models.ts` |

## Rules
- Editing passage paragraphs deactivates its questions server-side and deleting cascades → **always invalidate both** readings and reading-questions keys (`useInvalidateReadings`).
- `forBeginner` toggles use the beginner feature pieces (`BeginnerBadge`, `parseForBeginnerSearch` from `features/beginner/constants.ts`); only `daily` passages ≤ B1 can be beginner (API returns 400 otherwise).
- Reading question type labels must match the API's `READING_QUESTION_TYPES`.
