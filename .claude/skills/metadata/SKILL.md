---
name: metadata
description: Metadata / diagnostics page of english-quiz-dashboard (/metadata) — API health card, quiz types list with diff against local constants, pick-quiz-type tester, random topic pairs. Use when touching src/features/metadata or src/routes/_dashboard/metadata.tsx.
---

# Metadata (dashboard)

## Files (under `src/features/metadata/`)

| Concern        | Path                                                                                                                                                                       |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route          | `src/routes/_dashboard/metadata.tsx`                                                                                                                                       |
| Health         | `hooks/use-health.ts`, `components/health-card.tsx` (`GET /health`)                                                                                                        |
| Quiz types     | `hooks/use-quiz-types-diff.ts`, `utils/diff-quiz-types.ts` (+ test), `components/quiz-types-panel.tsx` — compares `/english/quiz-types` with `src/features/quiz` constants |
| Pick quiz type | `hooks/use-pick-quiz-type.ts`, `components/pick-quiz-type-card.tsx`                                                                                                        |
| Random pairs   | `hooks/use-random-topic-pairs.ts`, `components/random-pairs-panel.tsx`                                                                                                     |

## Rules

- The quiz-types diff is the safety net for drift between API and dashboard — when the API adds a type, the panel shows it until `features/quiz` is updated.
