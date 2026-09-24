---
name: auth
description: Admin authentication in english-quiz-dashboard with the Better Auth client — login (email/password + Google popup), forgot/reset password, session query, bearer token storage, axios 401/403 handling, _dashboard guard, header user menu. Use when touching src/features/auth, src/configs/authClient.ts, src/configs/axiosClient.ts, login/forgot-password/reset-password routes or the guard.
---

# Auth (dashboard)

API side: english-quiz-api skill `admin-auth` (only role `admin`; token from `set-auth-token` header; reset always 200 generic).

## Files
| Concern | Path |
|---|---|
| Client | `src/configs/authClient.ts` — Better Auth client, `sessionQueryOptions` (key `["auth","session"]`), `isAdminSession`, get/clear session token (localStorage, Better Auth `POPUP_TOKEN_STORAGE_KEY`; saved from `set-auth-token` in `onSuccess`) |
| HTTP | `src/configs/axiosClient.ts` — adds `Authorization: Bearer`, on 401/403 clears token and goes to `/login` |
| Guard | `src/routes/_dashboard.tsx` `beforeLoad` |
| Routes | `src/routes/login.tsx`, `src/routes/forgot-password.tsx`, `src/routes/reset-password.tsx` |
| Forms | `src/features/auth/components/login-form.tsx`, `forgot-password-form.tsx`, `reset-password-form.tsx`; `utils/validate-password.ts` |
| Hooks | `src/features/auth/hooks/use-sign-in.ts`, `use-request-password-reset.ts`, `use-reset-password.ts` |
| Header | `src/features/auth/components/header-user.tsx` (sign out) |

## Rules
- Auth calls go through `authClient`, **not** Orval.
- After sign-in/out, invalidate or reset the session query so the guard re-evaluates.
- Password rules must match the API (min 12 chars).
- For Better Auth specifics also see the generic Better Auth skills in the API repo.
