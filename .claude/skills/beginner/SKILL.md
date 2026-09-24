---
name: beginner
description: Beginner hub and beginner flag UI across english-quiz-dashboard — coverage matrix, topics / quiz-types panels, audience toggle and filter pill, beginner badge, toggling forBeginner on topics, pool questions and readings. Use when touching src/features/beginner, src/routes/_dashboard/beginner.tsx or any forBeginner / audience UI.
---

# Beginner (dashboard)

API invariants: english-quiz-api skill `beginner` (≤ B1, 4 options, `daily` passages only, beginner and standard never mix, invalid flagging → 400).

## Files (under `src/features/beginner/`)

| Concern        | Path                                                                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Route          | `src/routes/_dashboard/beginner.tsx`                                                                                                                               |
| Hub data       | `hooks/use-beginner-hub.ts` (pool buckets + reading buckets + config), `utils/coverage.ts` (+ test)                                                                |
| Overview       | `components/beginner-overview.tsx`, `beginner-coverage-matrix.tsx`                                                                                                 |
| Panels         | `components/beginner-topics-panel.tsx`, `beginner-quiz-types-panel.tsx`, `beginner-toggle-row.tsx`                                                                 |
| Mutations      | `hooks/use-update-topic.ts` (also used by topics edit), `use-toggle-pool-question-beginner.ts`, `use-update-beginner-quiz-types.ts` (config `beginner_quiz_types`) |
| Shared UI      | `components/beginner-badge.tsx`, `beginner-filter-pill.tsx`, `audience-toggle.tsx`                                                                                 |
| Search helpers | `constants.ts` (`parseForBeginnerSearch`, `parseAudience`, `AudienceValue`)                                                                                        |

## Rules

- Reuse `parseForBeginnerSearch` / `parseAudience` in any route that filters by beginner/audience; don't re-implement parsing.
- Coverage logic stays in `utils/coverage.ts` with tests.
- Flag toggles surface API 400 messages via toast (`getApiErrorMessage`).
