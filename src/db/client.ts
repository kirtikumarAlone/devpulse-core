import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { loadSettings } from "../config/loadSettings.js";
import "dotenv/config";

const settings = loadSettings()
const dbUrl = settings.env.DATABASE_URL 
  || process.env["DATABASE_URL"] 
  || ""

const adapter = new PrismaPg({ connectionString: dbUrl })

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

globalForPrisma.prisma = db;