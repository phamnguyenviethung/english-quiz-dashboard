---
name: api-contract-sync
description: Sync english-quiz-dashboard with english-quiz-api changes — regenerate the Orval client (bun run api:gen) from the API's OpenAPI, fix type aliases, hook usages, query invalidation and error codes. Use when the API adds/changes endpoints, params or response shapes, or when src/apis/** types look stale.
---

# API contract sync (dashboard side)

## How the client is produced
- `orval.config.ts`: input `http://localhost:3399/openapi/json`, mode `tags-split`, output `src/apis/<tag>/<tag>.ts` + models in `src/apis/model/`, React Query + axios mutator `src/configs/axiosClient.ts`.
- Folders follow API OpenAPI tags: `admin-api-keys`, `admin-grants`, `admin-models`, `admin-pool`, `admin-pool-review`, `admin-pool-sibling`, `admin-reading-questions`, `admin-readings`, `admin-tenants`, `english-config`, `english-cron-tracking`, `english-generation`, `english-meta`, `english-question-pool`, `english-readings`, `english-topics`, `health`.
- Responses are wrapped `{ success, data }` → hooks read `query.data?.data`.

## Steps
1. Start english-quiz-api locally (`bun run dev` there, port 3399).
2. `bun run api:gen` here. Never hand-edit `src/apis/**`.
3. `bun run typecheck` — fix every break in `src/features/*`:
   - type aliases in `types.ts` / hook files (e.g. `export type Topic = GetEnglishTopics200DataItem`) — generated names change when schemas change;
   - `build<X>Params` + route `validateSearch` for new/renamed query params;
   - invalidation keys in mutation hooks for new side effects.
4. New error code → `API_ERROR_CODE` in `src/lib/api-error.ts`.
5. Commit generated files together with the feature changes.

## Feature ↔ API map
| Feature | API |
|---|---|
| `ai-models` | `/admin/models*`, `/english/pool/models` |
| `tenants` | `/admin/tenants*` (keys, grants) |
| `question-pool` | `/english/pool/*`, `/admin/pool/buckets`, `/admin/pool/refill`, `/admin/pool/siblings/*` |
| `pool-review` | `/admin/pool/reviews*` |
| `readings` | `/admin/readings*` |
| `reading-questions` | `/admin/reading-questions*` |
| `config` | `/english/config*` |
| `beginner` | `/admin/pool/buckets`, `/admin/readings/buckets`, `PATCH /admin/pool/questions/:id`, `PATCH /english/topics/:id`, `/english/config` |
| `cron-runs`, `dashboard` | `/english/cron/*` |
| `generation` | `/english/generate/:quizType`, `/english/generate-reading` |
| `metadata` | `/health`, `/english/quiz-types`, `/english/pool/pick-quiz-type`, `/english/topics/random-pairs` |
| `topics` | `/english/topics*` |
| `auth` | Better Auth `/api/auth/*` via `src/configs/authClient.ts` (not Orval) |

API-side counterpart: `english-quiz-api/.claude/skills/api-contract-sync`.
