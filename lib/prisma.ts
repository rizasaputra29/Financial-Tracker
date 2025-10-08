// path: lib/prisma.ts

// Menggunakan @prisma/client/edge untuk kompatibilitas lingkungan Serverless/Edge
import { PrismaClient } from '@prisma/client/edge'; 
import { withAccelerate } from '@prisma/extension-accelerate';

// Menentukan tipe data hasil ekstensi Accelerate
// Ini adalah solusi untuk error 'This expression is not callable'
type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>; 

// Fungsi untuk membuat instance PrismaClient dengan Accelerate
function createPrismaClient() {
  return new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  }).$extends(withAccelerate());
}

// Deklarasi global untuk mencegah pembuatan instance berulang dalam mode development
const globalForPrisma = global as unknown as { prisma: ExtendedPrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  createPrismaClient() as ExtendedPrismaClient; // Type cast untuk menjamin callability

// Mencegah hot reload crash di development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}