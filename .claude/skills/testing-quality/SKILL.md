---
name: testing-quality
description: Tests and quality gates for english-quiz-dashboard — vitest colocated *.test.ts(x) for pure utils and small components, typecheck, eslint, prettier. Use before finishing any dashboard change or when adding tests.
---

# Testing & quality

## Gates (run all before committing)
```bash
bun run typecheck   # tsc --noEmit
bun run lint        # eslint (tanstackConfig; src/apis/** excluded from naming rules)
bun run check       # prettier --check (bun run format to fix)
bun run test        # vitest run
```

## Tests
- Vitest, no config file; tests are **colocated** next to the code: `utils/<name>.test.ts`, occasionally `components/<name>.test.tsx`.
- Test names are Vietnamese business statements (`describe`/`it`), like the API repo.
- Priority: pure logic in `utils/` — validators, param builders, parsers, mappers, diffing, grouping. Examples:
  - `src/features/config/utils/*.test.ts` (6 files)
  - `src/features/beginner/utils/coverage.test.ts`
  - `src/features/question-pool/utils/sort.test.ts`
  - `src/features/generation/utils/normalize-generated-question.test.ts`
  - `src/features/metadata/utils/diff-quiz-types.test.ts`
  - Component example: `src/features/question-pool/components/pool-column-visibility-menu.test.tsx`
- Move non-trivial logic out of components into `utils/` so it can be tested without rendering.

## UI verification
For visual changes, run `bun run dev` (port 5542) against a local API (`VITE_API_BASE_URL`) and check the page at desktop and mobile widths (dialogs become drawers on mobile).
