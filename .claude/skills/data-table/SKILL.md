---
name: data-table
description: Build or change list tables in english-quiz-dashboard — shadcn Table with sort headers, skeleton rows, toolbar (debounced search + filter pills), pagination with page-size select, server vs client pagination, react-table v9 variant (question pool), sticky table, detail sheets. Use when adding columns, filters, sorting or pagination to any list page.
---

# Data table

## Variants in the codebase

| Variant                                                                       | Where                                                                                                                            | Use when                              |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| shadcn `Table` + local `SortHeader` + per-feature toolbar/pagination          | `features/readings`, `features/reading-questions`, `features/pool-review`, `features/topics`, `features/tenants`                 | Default choice                        |
| `@tanstack/react-table` v9 `useTable` with `manualSorting`, column visibility | `features/question-pool` (`hooks/use-pool-table.ts`, `components/pool-questions-columns.tsx`, `pool-column-visibility-menu.tsx`) | Many columns, user-toggleable columns |
| `src/components/common/sticky-table.tsx`                                      | `features/ai-models`                                                                                                             | Wide tables with sticky first column  |

Shared pieces: `src/components/common/table-skeleton-rows.tsx`, `status-badge.tsx` + `status-meta.ts`, `src/hooks/use-debounced-value.ts`.

## Server-side paginated list (readings template)

1. Hook `use-<list>.ts` with `build<X>Params` + `keepPreviousData` (`feature-module` skill).
2. `<x>-toolbar.tsx`: debounced search `InputGroup` + filter-pill `Select`s; emits a patch to the page, which resets `page`.
3. `<x>-table.tsx`: `SortHeader` toggles the `sort` search param (values from the API's `*_SORTS` enum); rows open detail via search param.
4. `<x>-pagination.tsx`: page window (`buildPageWindow`) + page-size `Select` (`PAGE_SIZE_OPTIONS` in the feature `constants.ts`).
5. Filters/sort params come from the generated `Get<X>Params` type — if the API lacks a filter, add it there first (`api-contract-sync`).

## Client-side list (topics template)

Fetch all, filter/sort/paginate in memory in the page; still keep filter state in URL search params.

## Detail views

`<x>-detail-sheet.tsx` built on `src/components/common/responsive-dialog.tsx` / `detail-dialog.tsx` (Drawer on mobile). Raw JSON: `json-block.tsx`.

## Gotchas

- Pagination components are copied per feature today; if you touch several, consider extracting a shared one into `src/components/common/` rather than adding another copy.
- Keep empty states distinct: "no data yet" vs "no match for the current filter".
