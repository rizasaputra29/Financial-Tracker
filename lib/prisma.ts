// path: lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// 🔍 DEBUG: Cek environment variable
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not defined!');
  console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE')));
} else {
  console.log('✅ DATABASE_URL is defined');
  console.log('📍 DATABASE_URL starts with:', process.env.DATABASE_URL.substring(0, 15));
}

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient | undefined 
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}