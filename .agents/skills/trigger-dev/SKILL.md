---
name: trigger-dev
description: Trigger.dev project setup, local worker development, deployment, and task orchestration for Next.js and TypeScript apps. Use for `trigger.dev init`, `trigger dev`, `trigger deploy`, background jobs, scheduled tasks, and MCP-based tooling setup.
license: MIT
metadata:
  author: trigger
  version: "4.5.15"
---

# Trigger.dev Reference

Use this skill when integrating Trigger.dev into a project, starting the local development server, creating tasks, or understanding deployment and local run behavior.

## When to Apply

Use this skill when:
- Setting up Trigger.dev in a new app (`npx trigger.dev@latest init`)
- Creating or editing `trigger.config.ts`
- Starting the local dev worker (`trigger dev`)
- Deploying the project (`trigger deploy`)
- Triggering tasks or workflows from the CLI or MCP tool
- Debugging project setup, env vars, or local run issues

## Project Setup

```bash
npx trigger.dev@latest init
# or with a specific project ref
npx trigger.dev@latest init -p proj_<project_ref>
```

This creates the project configuration and installs the required Trigger.dev integration files.

## Local Development

```bash
npx trigger.dev@latest dev
```

Use this to start the local Trigger.dev worker and serve tasks during development.

## Deploy

```bash
npx trigger.dev@latest deploy
```

This deploys the project to Trigger.dev and publishes the latest configuration.

## Common Files

- `trigger.config.ts` — main Trigger.dev project config
- `.env` / `.env.local` — environment variables used by your app and Trigger.dev
- `src/jobs` or app task folders — where task definitions are usually added

## Typical Workflow

1. Initialize the project in the repo root.
2. Add your jobs/tasks under the configured task directory.
3. Start local dev with `trigger dev`.
4. Trigger tasks through the CLI, dashboard, or MCP integration.
5. Deploy with `trigger deploy` when ready.

## Best Practices

- Keep `trigger.config.ts` in the project root unless the app is a monorepo.
- Store secrets only in environment files or project secrets, not in source control.
- Use the Trigger.dev MCP server for agent-driven task queries and task metadata.
- Validate the app is able to connect to database and external services before deploying.

## MCP Integration

In this workspace, the Trigger.dev MCP server is configured via `.vscode/mcp.json` or the IDE’s MCP setup:

```json
{
  "servers": {
    "trigger": {
      "command": "npx",
      "args": ["trigger.dev@4.5.15", "mcp"]
    }
  }
}
```

This enables task and run inspection through the editor tooling.

## Safety Notes

- Do not expose secrets in URLs, logs, or committed files.
- Verify environment variables before running production deployments.
- Prefer local dev validation before pushing changes to cloud environments.
