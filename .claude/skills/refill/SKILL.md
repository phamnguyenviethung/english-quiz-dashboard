---
name: refill
description: The /refill page of english-quiz-dashboard — tabs for question pool manual refill, sibling refill, reading refill and reading question refill, built from shared refill UI (scope fields, bucket groups, model picker, topic picker, tri-state checkbox, summary, audience). Use when touching src/features/refill, src/routes/_dashboard/refill.tsx or any *-refill-page component.
---

# Refill (dashboard)

## Composition
`src/routes/_dashboard/refill.tsx` renders `Tabs` (`questions`, `siblings`, `readings`, `reading-questions`) and an audience filter (`parseAudience` from `features/beginner/constants.ts`). Each tab is a page component owned by its domain feature:

| Tab | Component | Hooks |
|---|---|---|
| questions | `src/features/question-pool/components/manual-refill-page.tsx` | `use-manual-refill.ts`, `use-manual-refill-models.ts`, `use-pool-buckets.ts` |
| siblings | `src/features/question-pool/components/sibling-refill-page.tsx` | `use-sibling-refill.ts`, `use-sibling-buckets.ts` |
| readings | `src/features/readings/components/reading-refill-page.tsx` | `use-reading-refill.ts`, `use-reading-buckets.ts`, `use-reading-models.ts` |
| reading-questions | `src/features/reading-questions/components/reading-question-refill-page.tsx` | `use-reading-question-refill.ts`, `-buckets.ts`, `-models.ts` |

Shared UI in `src/features/refill/`: `components/refill-section.tsx`, `refill-scope-fields.tsx`, `refill-bucket-groups.tsx`, `refill-model-picker.tsx`, `refill-topic-picker.tsx`, `tri-state-checkbox.tsx`, `refill-summary.tsx`, plus `constants.ts`, `types.ts`. No hooks here — data hooks stay in domain features.

## Flow (all tabs)
Pick scope (all / deficient, filters, bucket keys, audience) → **preview plan** (API `buildManual*Plan`) → confirm → run → show summary. Models come from the API model list filtered by context (`manual` or `reading`).

## Recipes
- **New refill kind** → page component in its domain feature using the shared pieces, add a tab in `refill.tsx`, keep old standalone routes as redirects.
- **New scope option** → API param first (`api-contract-sync`), then `refill-scope-fields.tsx` + `types.ts`.
