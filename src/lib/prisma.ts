import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaClient: PrismaClient | undefined = globalForPrisma.prisma;

function initializePrismaClient() {
  if (prismaClient) {
    return prismaClient;
  }

  try {
    prismaClient = new PrismaClient();

    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prismaClient;
    }

    return prismaClient;
  } catch (error) {
    console.error("Prisma client initialization failed:", error);
    throw error;
  }
}

export function getPrisma() {
  return initializePrismaClient();
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = initializePrismaClient();
    const value = client[property as keyof PrismaClient];

    return typeof value === "function" ? value.bind(client) : value;
  }
}) as PrismaClient;
