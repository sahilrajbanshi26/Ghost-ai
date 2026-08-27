import { PrismaPg } from "@prisma/adapter-pg"
import { withAccelerate } from "@prisma/extension-accelerate"

import { PrismaClient } from "@/app/generated/prisma/client"

const databaseUrl = process.env.DATABASE_URL?.replace(
  /([?&])sslmode=(?:prefer|require|verify-ca)(?=&|$|")/i,
  "$1sslmode=verify-full"
)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? (() => {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured")
  }

  return (databaseUrl.startsWith("prisma+postgres://")
    ? new PrismaClient({ accelerateUrl: databaseUrl }).$extends(withAccelerate())
    : new PrismaClient({
        adapter: new PrismaPg({ connectionString: databaseUrl }),
      })) as unknown as PrismaClient
})()

export const db = prisma

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db
}