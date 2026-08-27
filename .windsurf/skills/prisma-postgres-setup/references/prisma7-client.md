# Prisma 7 Client Instantiation

Prisma 7 changed how PrismaClient connects to databases. The CLI (`prisma db push`, `prisma migrate`) reads the URL from `prisma.config.ts`. But at **runtime**, you must provide a driver adapter to PrismaClient explicitly.

## Required packages

```bash
npm install prisma@7.9.1 @prisma/client@7.9.1 @prisma/adapter-pg@7.9.1 pg dotenv tsx
```

- `@prisma/adapter-pg` — the Prisma adapter for the `pg` PostgreSQL driver
- `pg` — the underlying Node.js PostgreSQL driver

## Basic instantiation

```typescript
import 'dotenv/config'
import pg from 'pg'
import type { PoolConfig } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client.js'

const poolConfig: PoolConfig = { connectionString: process.env.DATABASE_URL }
const pool = new pg.Pool(poolConfig)
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })
```

## Key rules

1. **Import path**: Always `./generated/prisma/client.js` — not `./generated/prisma` and not `@prisma/client`.

2. **Adapter is mandatory**: `new PrismaClient()` with no arguments throws. `new PrismaClient({ datasourceUrl: '...' })` also throws — `datasourceUrl` does not exist in Prisma 7.

3. **ESM required**: The generated client uses ESM. Ensure `package.json` has `"type": "module"`.

4. **Pool lifecycle**: Call `await pool.end()` when shutting down (after `prisma.$disconnect()`).

## Usage in application code

```typescript
import 'dotenv/config'
import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client.js'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Create
const user = await prisma.user.create({
  data: { email: 'alice@example.com', name: 'Alice' },
})

// Read with relations
const posts = await prisma.post.findMany({
  where: { published: true },
  include: { author: true },
})

// Update
await prisma.post.update({
  where: { id: 1 },
  data: { published: true },
})

// Delete
await prisma.post.delete({ where: { id: 1 } })

// Cleanup in the application's shutdown path
try {
  // application work
} finally {
  await prisma.$disconnect()
  await pool.end()
}
```

Use the direct TCP URL for local development, migrations, and other long-lived server connections. Use the provider's pooled endpoint for serverless or high-concurrency application traffic when one is supplied. Run local TypeScript verification scripts with `npx tsx script.ts` (or the project's package-manager equivalent).

## Common mistakes

| Mistake | Error | Fix |
|---|---|---|
| `import { PrismaClient } from './generated/prisma'` | `Cannot find module` | Use `./generated/prisma/client.js` |
| `new PrismaClient()` | `PrismaClient needs non-empty options` | Pass `{ adapter }` |
| `new PrismaClient({ datasourceUrl: url })` | `Unknown property datasourceUrl` | Use adapter pattern instead |
| Missing `"type": "module"` in package.json | ESM import errors | Add `"type": "module"` |
| `import { PrismaClient } from '@prisma/client'` | Wrong export | Use `./generated/prisma/client.js` |
