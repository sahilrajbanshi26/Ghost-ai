# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

* Feature 03: Auth

## Current Goal

* Implement Clerk authentication, protected routes, auth redirects, and editor user account controls.

## Completed

* Feature 01: Design System - shadcn/ui configured, Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea added, lucide-react installed, and lib/utils.ts cn() helper created.
* Feature 02: Editor Chrome - reusable editor navbar, floating project sidebar, page shell wiring, and dialog pattern styling completed.
* Feature 03: Auth - Clerk provider, auth pages, protected routes, root redirects, editor shell route, and UserButton integration completed.

## In Progress

* None.

## Next Up

* Feature 04 (TBD)

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
* Feature 03 completed: `ClerkProvider` uses the Clerk dark theme with app CSS variables, `/sign-in` and `/sign-up` render Clerk forms in responsive two-panel auth pages, `/` redirects by auth state, `/editor` owns the editor shell, `proxy.ts` protects non-auth routes, and the editor navbar exposes Clerk's `UserButton`.
