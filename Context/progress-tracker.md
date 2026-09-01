# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

* Feature 24: AI runtime configuration and design-flow validation in progress

## Current Goal

* Remove the configuration blockers affecting the Google AI key and live Trigger/Liveblocks runtime, then verify the sidebar and design task can start and report real statuses without silent failures.

## Completed

* Feature 01: Design System - shadcn/ui configured, Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea added, lucide-react installed, and lib/utils.ts cn() helper created.
* Feature 02: Editor Chrome - reusable editor navbar, floating project sidebar, page shell wiring, and dialog pattern styling completed.
* Feature 03: Auth - Clerk provider, auth pages, protected routes, root redirects, editor shell route, and UserButton integration completed.
* Feature 04: Project Dialogs - editor home prompt, mock owned/shared projects, create/rename/delete dialogs, live slug previews, sidebar actions, and mobile sidebar scrim completed.
* Feature 05: Prisma Data Layer - project and collaborator models, Prisma client singleton, generated client, and first migration completed.
* Feature 06: Project APIs - authenticated list/create/rename/delete REST endpoints with owner scoping and mutation authorization completed.
* Feature 07: Wire Editor Home - server-loaded owned/shared projects, API-backed project actions, workspace navigation, and active-workspace deletion redirect completed.
* Feature 08: Editor Workspace Shell - verified server project loading, interactive project actions, workspace routing, and dialog/sidebar integration completed.
* Feature 09: Share Dialog - owner-managed collaborator invites/removals, Clerk-enriched collaborator display, read-only collaborator access, and project link copying completed.
* Feature 10: Liveblocks Setup - typed presence and user metadata, cached Node client, deterministic cursor colors, private project rooms, authenticated project-scoped sessions, and a realtime React Flow canvas with synchronized project blocks and collaborator cursors completed.
* Feature 12: Shapes Panel - floating draggable shape toolbar, shape payload sizes, canvas drop handling, custom canvas nodes, and timestamped shape node IDs completed.
* Feature 13: Node Shapes - CSS rectangle, pill, and circle rendering; scalable SVG diamond, hexagon, and cylinder rendering; selected-state borders; and cursor-attached drag previews completed.
* Feature 14: Node Editor - selected-node resize handles with minimum dimensions, centered inline textarea label editing, empty-label placeholders, Escape/blur exit behavior, and Liveblocks-synchronized updates completed.
* Feature 15: Node Colour - selected-node swatch toolbar, predefined background/text color pairs, active swatch state, controlled text-color hover glow, and Liveblocks-synchronized color updates completed.
* Feature 16: Edge Behavior - four-way hover handles, smooth-step arrowed custom edges, wider invisible edge hit areas, and collaborative inline edge labels completed.
* Feature 17: Canvas Ergonomics & Starter Templates - animated zoom/fit controls, Liveblocks undo/redo controls, editable-field-aware keyboard shortcuts, minimap removal, and pre-built diagram starter templates library with SVG previews completed.

## In Progress

* Feature 24: the room-scoped `ai-chat` feed and `ai-status-feed` remain separate, and the frontend is guarded so it only listens to a real run when both a run ID and public token are present.
* Feature 23: the AI worker now fails with a clear runtime error if the Google key is missing, instead of silently producing broken behavior.
* Feature 22: Trigger.dev and Liveblocks runtime readiness are being validated in the local environment so the design agent can publish actual room updates and canvas mutations.

## Next Up

* Verify the local app and Trigger worker start cleanly in a real runtime context and confirm the prompt-to-run-to-canvas flow produces visible status updates and diagram changes.

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
* Feature 08 review completed: the supplied workspace-shell specification matches the existing implementation from Feature 07, so no duplicate UI or API code was added.
* Feature 08 behavior confirmed: the database-created project ID is used for workspace navigation and remains the identifier available for the future Liveblocks room; the dialog also previews a slugified name with a short suffix.
* Feature 08 refinement completed: create now permits an empty name so the API can apply its `Untitled Project` default, and the returned project ID is explicitly used as the workspace room ID.
* Feature 08 checks passed: production build and TypeScript diagnostics completed successfully; repository lint has only the existing skill-template warning.
* Feature 08 visual refinement completed: editor shell now follows the reference workspace composition with a floating rounded project drawer, title/action navbar, graph-paper canvas, teal/purple accents, and responsive AI Copilot rail.
* Feature 08 visual checks passed: production build and focused diagnostics are clean; local preview is auth-gated by Clerk.
* Visual comparison refinement completed: the Projects drawer now opens by default on desktop to match the supplied reference first viewport while remaining closed on mobile after hydration.
* Visual comparison follow-up completed: responsive sidebar state now uses `useSyncExternalStore`, keeping the reference desktop composition without synchronous effect updates or hydration issues.
* Feature 09 implementation started: share dialog specification reviewed against the existing workspace navbar, Prisma collaborator relation, and Clerk server client.
* Feature 09 completed: workspace Share opens a collaborator dialog; owners can invite/remove collaborators, collaborators receive read-only access, links provide temporary `Copied!` feedback, and collaborator records are enriched from Clerk when available.
* Feature 09 checks passed: `npm.cmd run build` and TypeScript diagnostics; lint has no implementation errors and only the existing skill-template warning.
* Full feature-chain audit completed: specifications 01-09 are connected across Clerk auth, Prisma data, project APIs, server-rendered editor loading, client mutations, workspace navigation, and collaborator sharing.
* Audit fixes completed: collaborator access now normalizes email casing consistently, Share remains available on mobile workspaces, and share-dialog state is isolated per workspace without synchronous effect resets.
* Full audit verification passed: `npm.cmd run build`, TypeScript diagnostics, and ESLint with zero implementation errors; one pre-existing warning remains in the Clerk skill template.
* Feature 10 implementation started: Liveblocks specification reviewed against the existing Clerk authentication and project access helper.
* Feature 10 checks passed: TypeScript, ESLint, and production build completed; `/api/liveblocks-auth` is wired to the workspace canvas. Add `LIVEBLOCKS_SECRET_KEY` to exercise the live provider integration locally.
* Feature 10 layout correction completed: the workspace now visibly contains Projects, synchronized project blocks, and AI Copilot as three functional panels.
* Feature 10 visual correction completed: the Projects panel now participates in the desktop grid, the React Flow canvas fills its column with stable viewport sizing, and mobile keeps the sidebar overlay behavior.
* Feature 10 canvas block refinement completed: the synchronized canvas now has its own dedicated panel with a header, sync status, and independently sized React Flow content area.
* Feature 12 implementation started: shapes-panel specification reviewed against the existing Liveblocks React Flow canvas.
* Feature 12 checks passed: TypeScript, ESLint, and production build completed; only the existing Clerk skill-template warning remains.
* Feature 12 runtime fix completed: wrapped the Liveblocks canvas with ReactFlowProvider so useReactFlow() has the required provider ancestor.
* Feature 12 storage runtime fix completed: initialized RoomProvider with a LiveObject storage root and nested flow LiveObject so React Flow mutations can access flow.get()/flow.get("nodes").
* Feature 12 canvas review completed: canvas now fills the viewport naturally, Projects and AI Copilot float over it, the closed Projects panel fully exits the viewport, and drag/drop behavior is documented and preserved.
* Feature 12 drag/drop repair completed: added a browser-compatible fallback payload, strict payload validation, propagation control, and reliable screen-to-flow node placement.
* Feature 12 Liveblocks drop runtime fix completed: removed the plain flow storage seed so useLiveblocksFlow initializes the required LiveObject tree and flow.get() works during node insertion.
* Feature 12 persisted-room compatibility fix completed: moved React Flow storage to the fresh `canvas` key so existing rooms bypass malformed legacy data.
* Feature 12 movement refinement completed: normalized starter node dimensions and added explicit grab/grabbing affordances to the custom canvas nodes.
* Hydration fix completed: Clerk UserButton now loads client-only in the editor navbar to prevent server/client markup mismatch.
* Feature 13 implementation started: node-shapes specification reviewed against the existing collaborative React Flow renderer and shape toolbar.
* Feature 13 checks passed: TypeScript, ESLint, and production build completed; only the existing Clerk skill-template warning remains.
* Feature 13 color refinement completed: each shape now has a distinct fill and border color, with stronger borders on selected nodes and matching colors for SVG and CSS renderers.
* Feature 13 deletion refinement completed: the Shape panel now reveals an accessible X action for selected nodes and deletes them through the synchronized Liveblocks Flow handler.
* Feature 14 implementation started: node-editor specification reviewed against the existing custom renderer and Liveblocks Flow change handler.
* Feature 14 checks passed: TypeScript, ESLint, and production build completed; only the existing Clerk skill-template warning remains.
* Feature 13 movement fix completed: removed the `nodrag` class from the custom node body so React Flow position dragging works and Liveblocks persists moved node positions.
* Feature 15 implementation started: node-colour specification reviewed against the existing theme tokens, custom shape renderer, and Liveblocks node replacement mutation.
* Feature 15 checks passed: TypeScript, ESLint, and production build completed; only the existing Clerk skill-template warning remains.
* Feature 16 implementation started: edge-behavior specification reviewed against the existing React Flow and Liveblocks canvas.
* Feature 16 implementation completed: four-way hover handles, smooth-step arrowed custom edges, wider invisible edge hit areas, and collaborative inline edge labels added.
* Feature 16 checks passed: TypeScript diagnostics, ESLint, and production build completed; only the existing Clerk skill-template warning remains.
* Feature 17 implementation started: canvas ergonomics specification reviewed against the existing React Flow and Liveblocks history APIs.
* Feature 17 implementation completed: animated zoom/fit controls, Liveblocks undo/redo controls, editable-field-aware keyboard shortcuts, and minimap removal added; the specification file was deleted as requested.
* Feature 17 checks passed: TypeScript diagnostics, ESLint, and production build completed; only the existing Clerk skill-template warning remains.
* Feature 17 starter templates completed: five technical architecture templates, calculated SVG previews, scrollable import dialog, and fresh-ID Liveblocks imports added.
* Feature 18: Presence Avatars & Live Cursors completed: collaborator stacks, current-user filtering, overflow badges, live cursor overlays, and the updated `thinking` presence field are wired into the canvas view while leaving the global editor navbar unchanged.
* Feature 19: AI Sidebar Shell completed: the floating AI panel now uses a dedicated sidebar component with the `AI Workspace` header, `AI Architect`/`Specs` tabs, starter prompt composer, empty-state coaching, and demo specification card while preserving the existing right-side slide-in behavior and editor shell state.
* Feature 20: Canvas autosave and blob persistence in progress: Vue-safe canvas save/load API routes are in place, the editor tracks save status, and project state is now persisted with Vercel Blob while skipping restore when the Liveblocks room already contains active collaborative changes.
* Feature 21: Design agent backend flow implemented: `/api/ai/design` triggers the background design task and stores `TaskRun` metadata; `/api/ai/design/token` validates ownership and emits a scoped public token; `trigger/design-agent.ts` defines the minimal design task that logs its input; and the Prisma model relation is wired into the project schema.
