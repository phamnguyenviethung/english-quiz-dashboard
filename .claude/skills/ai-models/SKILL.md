---
name: ai-models
description: AI model management page of english-quiz-dashboard — model list (sticky table + cards), filters, create/edit form with per-context provider preferences, deactivate, OpenRouter catalog dialog, pricing sync, pool model usage. Use when touching src/features/ai-models or src/routes/_dashboard/ai-models.tsx.
---

# AI models (dashboard)

API rules: english-quiz-api skill `ai-model-provider` (contexts `schedule` / `manual` / `reading`; one provider-preferences object shape for all three).

## Files (under `src/features/ai-models/`)

| Concern   | Path                                                                                                                                                                                          |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route     | `src/routes/_dashboard/ai-models.tsx`                                                                                                                                                         |
| List      | `components/ai-models-panel.tsx`, `ai-model-card.tsx`, `ai-models-filter-bar.tsx`, `ai-model-row-actions.tsx` (table uses `src/components/common/sticky-table.tsx`); `hooks/use-ai-models.ts` |
| Form      | `components/ai-model-form-dialog.tsx`, `provider-preferences-fields.tsx`; `utils/validate-ai-model.ts`, `utils/provider-preferences.ts` (form ↔ API mapping)                                  |
| Mutations | `hooks/use-create-ai-model.ts`, `use-update-ai-model.ts`, `use-sync-model-pricing.ts`; `components/ai-model-deactivate-dialog.tsx`                                                            |
| Catalog   | `components/model-catalog-dialog.tsx`, `hooks/use-model-catalog.ts`                                                                                                                           |
| Usage     | `hooks/use-pool-model-usage.ts` (`/english/pool/models`)                                                                                                                                      |

## Recipes

- **New provider preference field** → API first, regenerate, then `utils/provider-preferences.ts` (both directions) + `provider-preferences-fields.tsx` + validation.
- Model list is also consumed by refill model pickers — invalidate `getGetAdminModelsQueryKey()` after create/update/sync.
