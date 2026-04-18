# Quality Guidelines

> Code quality standards for frontend development.

---

## Overview

This project is a TypeScript + Next.js frontend with App Router, Tailwind, Zustand, next-intl, NextAuth, Drizzle-backed APIs, and AI-powered features. Code quality here mainly means:

- match existing feature structure
- keep client/server boundaries clear
- preserve both OAuth and fingerprint user flows
- keep UI responsive on mobile and desktop
- validate untrusted inputs at API boundaries
- keep types reasonably strict

Project scripts currently available:
- `pnpm lint`
- `pnpm type-check`
- `pnpm build`

---

## Forbidden Patterns

### 1. Do not bypass the current auth split

Many user-facing flows depend on either:
- OAuth session mode
- fingerprint header mode

If you add or modify frontend requests, do not assume only one auth path exists.

Examples to study:
- `src/hooks/use-auth.ts`
- `src/hooks/use-resume.ts`
- `src/stores/settings-store.ts`

### 2. Do not hardcode untranslated UI text in product surfaces

Visible user-facing copy should usually come from `useTranslations(...)`.

Examples:
- `src/app/[locale]/dashboard/page.tsx`
- `src/components/editor/editor-toolbar.tsx`
- `src/components/dashboard/create-resume-dialog.tsx`

### 3. Do not move business logic into low-level UI primitives

`components/ui` should remain reusable primitives, not feature containers.

### 4. Do not introduce new state/data libraries casually

The existing stack already uses local state + Zustand + `fetch`. New abstractions should only be added if repetition clearly justifies them.

### 5. Do not skip schema validation on untrusted inputs in route handlers

Examples:
- request parsing and AI output validation in `src/app/api/ai/grammar-check/route.ts`

### 6. Do not put structured user-managed auth config in `.env`

Keep `.env` for scalar values like `AUTH_SECRET`, booleans, ports, and URLs. If the value is a JSON array/object or contains password hashes with `$`, store it in a dedicated file under the app data directory instead.

### 7. Do not reintroduce one-off accent colors when brand tokens already exist

Recent work has standardized `bg-brand`, `text-brand`, `bg-brand-muted`, `hover:bg-brand-hover` and related classes.

---

## Required Patterns

### 1. Prefer existing shared primitives and helpers

Before writing custom controls, check whether there is already a suitable primitive in:
- `src/components/ui/`
- `src/lib/utils`
- `src/lib/constants`
- existing feature folders

### 2. Keep routes thin and feature components reusable

Examples:
- `src/app/[locale]/dashboard/page.tsx`
- `src/components/interview/interview-room.tsx`

### 3. Use explicit loading and failure handling for async UI flows

The current codebase often uses:
- `isLoading` / `isCreating` / `isParsing`
- local error strings
- `console.error(...)` for unexpected failures

Examples:
- `src/hooks/use-resume.ts`
- `src/components/dashboard/create-resume-dialog.tsx`
- `src/stores/settings-store.ts`

### 4. Preserve responsive behavior when editing UI

This project has active mobile adaptation work. Check existing `sm:` / `md:` layout behavior before changing toolbars, grids, dialogs, editor surfaces, or interview screens.

Examples:
- `src/components/editor/editor-toolbar.tsx`
- `src/app/[locale]/dashboard/page.tsx`
- `src/components/interview/interview-room.tsx`

### 5. Use typed props and shared domain types

Examples:
- `src/types/resume.ts`
- `src/types/auth.ts`
- props interfaces in feature components

---

## Testing Requirements

There is no visible dedicated frontend test suite in the current package scripts. The minimum verification standard for frontend changes is therefore:

1. `pnpm lint`
2. `pnpm type-check`
3. manual smoke testing of the affected flow
4. for UI changes, verify both desktop and mobile-sensitive layouts when relevant

For route/API changes that affect frontend behavior, also validate the full user path in the browser if possible.

---

## Code Review Checklist

Reviewers should check:

- Does the change fit the existing folder/module structure?
- Is `'use client'` present only where needed?
- Are strings translated instead of hardcoded?
- Does the change preserve both auth modes where required?
- Are mobile and desktop states still coherent?
- Are existing UI primitives reused instead of duplicated?
- Are new request/response boundaries validated if they accept untrusted input?
- Are types imported from shared files when available?
- Did the author run lint and type-check?

---

## Reference Examples

- Thin page + composed feature UI: `src/app/[locale]/dashboard/page.tsx`
- Responsive toolbar behavior: `src/components/editor/editor-toolbar.tsx`
- Mixed local state, effects, and async UI: `src/components/dashboard/create-resume-dialog.tsx`
- Client fetch + local list sync: `src/hooks/use-resume.ts`
- API input/output validation: `src/app/api/ai/grammar-check/route.ts`
