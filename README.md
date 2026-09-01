# Ghost AI

Ghost AI is a collaborative architecture and system-design workspace built with Next.js, Clerk, Liveblocks, Prisma, Trigger.dev, and Vercel Blob. It enables teams to create shared project rooms, design flows visually, and generate diagram updates through an AI sidebar in real time.

## Overview

Ghost AI is designed for fast concepting and collaborative design work. A user can:

- sign in securely with Clerk
- create and manage projects
- work inside a shared collaborative canvas
- connect multiple users in the same room
- generate system ideas from prompts using AI
- convert AI output into visual canvas actions
- autosave project work with blob storage

## Why this project matters

This project combines four major ideas:

1. Collaboration — shared design rooms through Liveblocks
2. AI-assisted design — prompt-driven generation with Gemini
3. Persistent project state — Prisma + Vercel Blob
4. Background job processing — Trigger.dev for async AI tasks

Together, these features create a real-time product design workspace rather than a static UI demo.

## Tech stack

- Next.js 16.3.2
- React 19
- TypeScript
- Tailwind CSS v4
- Prisma 7 + PostgreSQL
- Clerk authentication
- Liveblocks realtime collaboration
- React Flow canvas
- Vercel Blob
- Trigger.dev
- Google Gemini via @ai-sdk/google

## Project structure

- app/ — app routes and API endpoints
- components/ — editor, canvas, sidebar, and UI components
- hooks/ — autosave and project action logic
- lib/ — auth, Prisma, Liveblocks, and access helpers
- prisma/ — database schema and migrations
- src/trigger/ — Trigger.dev background jobs
- Context/ — project docs, specs, and trackers

## How the app works

### 1. Authentication and access
Clerk handles login and session management. Protected routes and API endpoints verify that the current user is allowed to access the project before performing any action.

### 2. Workspace/project model
Each project is stored in Prisma and mapped to a workspace room. The editor loads the project by ID and gives the user access to the collaborative canvas.

### 3. Real-time collaboration
Liveblocks provides room state, user presence, cursor tracking, and collaborative updates for the design canvas. Multiple users can work inside the same design workspace.

### 4. AI design pipeline
The AI sidebar accepts a user prompt and sends it to /api/ai/design. The API validates user access and starts a Trigger.dev background task named design-agent.

Inside the task:

- the prompt is received with the room/project metadata
- AI status is published to the room feed
- Gemini generates a structured design plan
- the output is converted into canvas actions
- nodes, edges, and layout changes are applied to the collaboration state
- completion status is sent back to the AI feed

### 5. Autosave and persistence
The canvas autosave hook pushes the current flow state to /api/projects/[projectId]/canvas. When a Vercel Blob token is available, it stores the canvas JSON. If it is missing, the app skips the save instead of failing hard.

## Quick start

### 1. Install dependencies

```bash
cd d:/projects/ghost-ai
npm install
```

### 2. Configure environment variables
Create a .env.local file in the project root and add:

```bash
DATABASE_URL=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
LIVEBLOCKS_PUBLIC_KEY=...
LIVEBLOCKS_SECRET_KEY=...
BLOB_READ_WRITE_TOKEN=...
TRIGGER_SECRET_KEY=...
GOOGLE_GENERATIVE_AI_API_KEY=...
```

> Important: the AI SDK expects the exact variable name GOOGLE_GENERATIVE_AI_API_KEY. Do not use a misspelled value like GOOGEL_AI_API_KEY.

### 3. Prepare the database

```bash
npx prisma generate
npx prisma migrate dev
```

### 4. Start the app

```bash
npm run dev
```

### 5. Start the Trigger worker
Open a second terminal and run:

```bash
npx trigger.dev@latest dev
```

### 6. Open the app

Go to:

```text
http://localhost:3000
```

If port 3000 is busy, Next.js may use another available port like 3001.

## Key commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npx prisma generate
npx prisma migrate dev
npx trigger.dev@latest dev
```

## Typical local workflow

1. Sign in with Clerk
2. Create a project
3. Open the editor workspace
4. Draw or modify the canvas
5. Submit an AI prompt in the sidebar
6. Watch the AI status feed and realtime updates
7. Save and continue collaboration

## Important project notes

- The app depends on valid environment values to work properly.
- Liveblocks auth must accept valid project members and collaborators.
- The Trigger worker must be running for AI design tasks to execute.
- Blob persistence depends on BLOB_READ_WRITE_TOKEN.
- If the token is missing, saving is intentionally skipped rather than crashing the app.
- Port conflicts can happen if another process already uses 3000.

## Troubleshooting

### Liveblocks 403 Forbidden
Check:

- the user is signed in
- the project access rules are correct
- the room ID matches the project workspace
- LIVEBLOCKS_SECRET_KEY is configured

### AI sidebar not generating designs
Check:

- Trigger worker is running
- GOOGLE_GENERATIVE_AI_API_KEY is present and spelled correctly
- the app is connected to the correct project room

### Canvas autosave error
Check:

- BLOB_READ_WRITE_TOKEN is set
- the user has access to the project
- the save API is receiving valid node and edge data

### Port already in use
Run:

```bash
npm run dev -- --port 3001
```

## Architecture in one sentence

Ghost AI is a realtime collaborative design platform where users and AI work together inside the same project room to generate and evolve architecture diagrams.

## Final note

This README is the main project guide for setup, onboarding, and troubleshooting. It should be treated as the reference file for running the app and understanding how the system works.
