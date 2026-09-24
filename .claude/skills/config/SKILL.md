---
name: config
description: Runtime config editor of english-quiz-dashboard — renders english_config_records generically from validation/uiSchema metadata (tabs by category, sections, typed editors, drafts, save-all bar, reset dialog, percent display, search). Use when touching src/features/config or src/routes/_dashboard/config.tsx, or when the API adds a new config record.
---

# Config (dashboard)

API side: english-quiz-api skill `english-config` (record `recordType`, `validation`, `uiSchema`, `category`, `sortOrder`, `unit`, `display: 'percent'`).

## Files (under `src/features/config/`)
| Concern | Path |
|---|---|
| Route | `src/routes/_dashboard/config.tsx` (tab by `category` in search param) |
| Data | `hooks/use-config-records.ts`, `use-config-snapshot.ts`, `use-invalidate-config.ts` |
| Editing | `hooks/use-config-drafts.ts` (local drafts), `use-save-all-config.ts` (bulk PATCH), `use-update-config-record.ts`, `use-reset-config-record.ts` |
| Layout | `components/config-tab-panel.tsx`, `config-section-card.tsx`, `config-record-row.tsx`, `config-save-bar.tsx`, `config-search-results.tsx`, `config-snapshot-section.tsx`, `reset-config-dialog.tsx` |
| Editors | `components/config-value-editor.tsx` (dispatch by type), `config-number-input.tsx`, `config-array-editor.tsx`, `config-json-editor.tsx` (fallback) |
| Pure logic | `utils/parse-config-schema.ts`, `group-config-records.ts`, `filter-config-records.ts`, `validate-config-group.ts`, `validate-config-value.ts`, `config-value-io.ts`, `percent-value.ts` — most with tests |

## Rules
- The UI is **metadata-driven**: a new API record normally needs **no** dashboard code. Sections are derived from `namespace`/`path`, not `sortOrder`.
- Only add code when a new `uiSchema` widget or `recordType` appears: parse it in `parse-config-schema.ts`, validate in `validate-config-value.ts`, render in `config-value-editor.tsx`, test the utils.
- Percent fields: stored 0..1, shown 0..100 (`percent-value.ts`).
- Client validation must mirror server zod limits (min/max come from record `validation`).
