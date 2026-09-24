---
name: tenants
description: Tenant management pages of english-quiz-dashboard — tenant list, create/edit form, status toggle, tenant detail tabs for API keys (issue / show once / revoke) and grants (topic and quiz-type allow-lists). Use when touching src/features/tenants or src/routes/_dashboard/tenants.
---

# Tenants (dashboard)

API rules: english-quiz-api skill `tenant-auth` (keys `eqk_...` shown in plaintext; allow-lists or `allowAll*`).

## Files (under `src/features/tenants/`)

| Concern  | Path                                                                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Routes   | `src/routes/_dashboard/tenants/index.tsx` (list), `src/routes/_dashboard/tenants/$tenantId.tsx` (detail, `tab` search param, default `keys`)                 |
| List     | `hooks/use-tenants.ts`, `components/tenants-table.tsx`, `tenant-status-toggle.tsx`                                                                           |
| Form     | `components/tenant-form-dialog.tsx`, `utils/validate-tenant.ts`, `hooks/use-create-tenant.ts`, `use-update-tenant.ts`, `use-tenant.ts`                       |
| API keys | `hooks/use-tenant-api-keys.ts`, `components/tenant-api-keys-panel.tsx`, `tenant-api-keys-table.tsx`, `issue-api-key-dialog.tsx`, `revoke-api-key-dialog.tsx` |
| Grants   | `hooks/use-tenant-grants.ts`, `components/tenant-grants-panel.tsx`, `grant-picker.tsx`                                                                       |

## Rules

- A newly issued key is displayed once in the issue dialog with copy (`src/lib/clipboard.ts`); make that explicit in the UI.
- Revoke is destructive → `ui/alert-dialog` confirm.
- Grants use PUT (replace whole list); send the full selection.
- Topic options come from `useTopicOptions` (`features/topics/hooks/use-topics.ts`); quiz types from `features/quiz`.
