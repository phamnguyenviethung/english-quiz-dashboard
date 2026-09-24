---
name: topics
description: Topics page and shared topic options in english-quiz-dashboard — client-side filtered topic list, create/edit dialogs, beginner flag, useTopicOptions/useTopicNameOptions used by many features, plus shared quiz constants (ENG_LEVELS, QuizType) in features/quiz. Use when touching src/features/topics, src/features/quiz or src/routes/_dashboard/topics.tsx.
---

# Topics (dashboard)

## Files

| Concern               | Path                                                                                                                                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route                 | `src/routes/_dashboard/topics.tsx` (client-side filter + paging; search params in URL)                                                                      |
| Data                  | `src/features/topics/hooks/use-topics.ts` (`useTopics`, `useTopicOptions`, `useTopicNameOptions`) — topics are prefetched by the `_dashboard` layout loader |
| Create                | `src/features/topics/components/create-topic-dialog.tsx`, `hooks/use-create-topic.ts`, `utils/validate-topic.ts` (canonical form example)                   |
| Edit                  | `src/features/topics/components/edit-topic-dialog.tsx` — uses `useUpdateTopic` from `src/features/beginner/hooks/use-update-topic.ts`                       |
| List UI               | `components/topics-table.tsx`, `topics-toolbar.tsx`, `topics-pagination.tsx`                                                                                |
| Shared quiz constants | `src/features/quiz/constants.ts` (`ENG_LEVELS`, ...), `src/features/quiz/types.ts` (`EngLevel`, `QuizType`, `OptionCount`)                                  |

## Rules

- Topic options hooks are used across features (tenants grants, refill topic picker, filters) — keep their return shape stable.
- CONFLICT on create → field error "name already exists" via `isApiErrorCode`.
- `features/quiz` must mirror the API's `ENG_LEVELS` / `QUIZ_TYPES`; when the API adds a quiz type, update it here (and generation/question-pool renderers).
