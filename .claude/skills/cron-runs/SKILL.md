---
name: cron-runs
description: Cron monitoring and the home dashboard of english-quiz-dashboard — cron run list/filters, run detail sheet (buckets, model attempts, summary), usage section (tokens, USD cost), overview stat tiles and model error-rate table on /. Use when touching src/features/cron-runs, src/features/dashboard, src/routes/_dashboard/cron-runs.tsx or src/routes/_dashboard/index.tsx.
---

# Cron runs & dashboard overview

API side: english-quiz-api skill `cron-tracking` (statuses `running | success | partial_success | failed | skipped`).

## features/cron-runs
| Concern | Path |
|---|---|
| Route | `src/routes/_dashboard/cron-runs.tsx` |
| List | `hooks/use-cron-runs.ts`, `components/cron-runs-table.tsx`, `cron-runs-filters.tsx` |
| Detail | `hooks/use-cron-run-detail.ts`, `components/cron-run-detail-sheet.tsx`, `cron-run-summary.tsx`, `cron-run-buckets-table.tsx`, `cron-run-attempts-table.tsx`, `utils/summarize-cron-run.ts` |
| Usage | `hooks/use-cron-usage.ts`, `components/cron-usage-section.tsx`, `cron-usage-filters.tsx`; `usageRangeFrom` (exported from `hooks/use-cron-usage.ts`) also used by `/` |

## features/dashboard (home `/`)
`src/routes/_dashboard/index.tsx`, `hooks/use-dashboard-usage.ts`, `components/overview-stat-tiles.tsx` (uses `src/components/common/stat-tile.tsx`), `components/model-error-rate-table.tsx`.

## Rules
- Status colours/labels via `src/components/common/status-badge.tsx` + `status-meta.ts`; add new statuses there.
- Money/tokens/durations via `src/lib/format.ts`.
- New job key on the API → add its label + filter option in `constants.ts`.
