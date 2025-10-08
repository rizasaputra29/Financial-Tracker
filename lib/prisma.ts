// path: lib/prisma.ts
import { PrismaClient } from '@prisma/client';
   
const globalForPrisma = global as unknown as { 
  prisma: PrismaClient | undefined 
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.DATABASE_URL === 'development' 
      ? ['query', 'info', 'warn', 'error'] 
      : ['error'],
  });

if (process.env.DATABASE_URL !== 'production') {
  globalForPrisma.prisma = prisma;
}