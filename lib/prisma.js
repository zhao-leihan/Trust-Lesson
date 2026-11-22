import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

const testnetUrl = process.env.TESTNET_DATABASE_URL || process.env.DATABASE_URL;
const mainnetUrl = process.env.MAINNET_DATABASE_URL || process.env.DATABASE_URL;

function createClient(url) {
  return new PrismaClient({
    datasourceUrl: url,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prismaTestnet = globalForPrisma.prismaTestnet ?? createClient(testnetUrl);
export const prismaMainnet = globalForPrisma.prismaMainnet ?? createClient(mainnetUrl);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaTestnet = prismaTestnet;
  globalForPrisma.prismaMainnet = prismaMainnet;
}

export function getPrismaClient(network = "testnet") {
  const norm = String(network || "").toLowerCase();
  if (norm === "mainnet" || norm === "arbitrumone" || norm === "42161") {
    return prismaMainnet;
  }
  return prismaTestnet;
}

// Proxy for backward-compatible `prisma` import that routes dynamically
export const prisma = new Proxy(prismaTestnet, {
  get(target, prop) {
    const activeNet = globalForPrisma.__ACTIVE_NETWORK__ || "testnet";
    const client = getPrismaClient(activeNet);
    const val = client[prop];
    if (typeof val === "function") {
      return val.bind(client);
    }
    return val;
  },
});
