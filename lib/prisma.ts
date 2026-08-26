import { PrismaPg } from "@prisma/adapter-pg"
import { withAccelerate } from "@prisma/extension-accelerate"

import { PrismaClient } from "@/app/generated/prisma/client"

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured")
}

const prisma = (databaseUrl.startsWith("prisma+postgres://")
  ? new PrismaClient({ accelerateUrl: databaseUrl }).$extends(withAccelerate())
  : new PrismaClient({
      adapter: new PrismaPg({ connectionString: databaseUrl }),
    })) as unknown as PrismaClient

const globalForPrisma = globalThis as unknown as {
  prisma: typeof prisma | undefined
}

export const db = globalForPrisma.prisma ?? prisma

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db
}