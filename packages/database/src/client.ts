import { PrismaClient } from "@prisma/client";

/**
 * Prisma client factory and lazy singleton.
 *
 * Tests construct their own client (so they can point at a temp SQLite
 * file). The bot uses the singleton.
 */

let cachedClient: PrismaClient | null = null;

export function createPrismaClient(databaseUrl?: string): PrismaClient {
  if (databaseUrl) {
    return new PrismaClient({
      datasources: { db: { url: databaseUrl } }
    });
  }

  return new PrismaClient();
}

export function getPrismaClient(): PrismaClient {
  if (cachedClient === null) {
    cachedClient = createPrismaClient();
  }

  return cachedClient;
}

export type { PrismaClient } from "@prisma/client";
