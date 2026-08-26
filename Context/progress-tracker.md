# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

* Feature 07: Wire Editor Home

## Current Goal

* Feature 07 editor home wiring complete; ready for the next feature.

## Completed

* Feature 01: Design System - shadcn/ui configured, Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea added, lucide-react installed, and lib/utils.ts cn() helper created.
* Feature 02: Editor Chrome - reusable editor navbar, floating project sidebar, page shell wiring, and dialog pattern styling completed.
* Feature 03: Auth - Clerk provider, auth pages, protected routes, root redirects, editor shell route, and UserButton integration completed.
* Feature 04: Project Dialogs - editor home prompt, mock owned/shared projects, create/rename/delete dialogs, live slug previews, sidebar actions, and mobile sidebar scrim completed.
* Feature 05: Prisma Data Layer - project and collaborator models, Prisma client singleton, generated client, and first migration completed.
* Feature 06: Project APIs - authenticated list/create/rename/delete REST endpoints with owner scoping and mutation authorization completed.
* Feature 07: Wire Editor Home - server-loaded owned/shared projects, API-backed project actions, workspace navigation, and active-workspace deletion redirect completed.

## In Progress

* None.

## Next Up

* Next feature (TBD)

## Open Questions

* None yet.

## Architecture Decisions

* shadcn/ui over Tailwind v4 (CSS-based token config via @theme inline in globals.css, no tailwind.config.js).

## Session Notes

* Using Next.js 16.3.2 with React 19 and Tailwind CSS v4.
* Do not modify generated components/ui/* files after shadcn installation.
* Feature 01 implementation started: design-system spec reviewed, project structure inspected, and shadcn/ui setup in progress.
* Feature 01 checks passed: targeted ESLint for app/components/lib and `next build`.
* Feature 02 implementation started: editor chrome spec reviewed and project structure inspected.
* Feature 02 completed: `components/editor/editor-navbar.tsx`, `components/editor/project-sidebar.tsx`, and `components/editor/editor-shell.tsx` added; home page now renders the editor shell.
* Feature 02 dialog pattern prepared by aligning existing shadcn dialog overlay/content/header/footer/title/description styling with dark theme tokens.
* Feature 02 checks passed: `npm.cmd run lint` and `npm.cmd run build`.
* Feature 02 layout update: editor navbar and project sidebar now frame routes from `app/layout.tsx`; `app/page.tsx` only owns page content.
* Feature 03 implementation started: Clerk auth specification reviewed and existing Clerk environment keys confirmed.
* Feature 03 completed: `ClerkProvider` uses the Clerk dark theme with app CSS variables, `/sign-in` and `/sign-up` render Clerk forms in responsive two-panel auth pages, `/` performs the auth-aware redirect, `/editor` owns the editor shell, `proxy.ts` protects all routes except the redirect and auth paths, and the editor navbar exposes Clerk's `UserButton`.
* Feature 03 environment verification: existing Clerk keys are `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`; auth pages fall back to `/sign-in` and `/sign-up` because no custom route URL variables are configured.
* Auth UI refinement completed: sign-in and sign-up now use an equal desktop split, a tokenized accent panel, and explicit Geist Sans/Mono typography tokens while preserving Clerk's default flows.
* Auth inspiration pass completed: auth feature rows now use cyan Lucide icon badges, product-focused copy, and stronger headline hierarchy to match the provided reference interface.
* Feature 04 implementation started: project dialog specification reviewed and existing editor shell, sidebar, and dialog primitives inspected.
* Feature 04 completed: `useProjectDialogs` manages mock project data, dialog/form/loading state, and slug previews; create, rename, and delete flows are wired from the editor home and sidebar.
* Feature 04 checks passed: focused ESLint completed without errors; repository lint and production build run after implementation.
* Feature 05 implementation started: Prisma specification reviewed and existing Prisma 7 configuration and dependencies inspected.
* Feature 05 completed: split `project.prisma` models define project status, Clerk owner IDs, collaborator relations, cascade deletion, timestamps, uniqueness, and requested indexes.
* Feature 05 client setup completed: `lib/prisma.ts` selects Accelerate for `prisma+postgres://` URLs, otherwise uses `@prisma/adapter-pg`, and caches the client globally outside production.
* Feature 05 checks passed: schema validation, formatting, client generation, and migration `20260826090427_add_projects` applied successfully.
* Feature 05 build verification passed: `npm.cmd run build` completed after configuring Prisma 7 Accelerate with `accelerateUrl`.
* Feature 06 implementation started: backend API specification reviewed and existing Clerk proxy, Prisma client, and Next.js route-handler conventions inspected.
* Feature 06 completed: `/api/projects` supports owner-scoped GET/POST; `/api/projects/[projectId]` supports owner-checked PATCH/DELETE; missing names default to `Untitled Project`.
* Feature 06 checks passed: `npm.cmd run build` and `npm.cmd run lint`; build exposes all four project API route handlers and TypeScript completes successfully.
* Feature 07 implementation started: editor home mock state and layout boundary reviewed; server page and interactive shell responsibilities separated.
* Feature 07 completed: `getProjectsForUser` loads owned projects and collaborator-email shared projects server-side; the client action hook handles API create, rename, delete, room previews, refreshes, and navigation.
* Feature 07 workspace navigation completed: `/editor/[projectId]` validates owner/collaborator access and renders the selected project inside the editor shell, so create and sidebar navigation resolve to a real workspace route.
* Feature 07 checks passed: `npm.cmd run build` and `npm.cmd run lint`; build exposes the project APIs and server-rendered `/editor` route with no TypeScript errors.
