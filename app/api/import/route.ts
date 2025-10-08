// path: app/api/import/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

// PENTING: Menghapus export const config yang deprecated.
// Menggunakan dynamic = 'force-dynamic' adalah cara modern untuk memastikan route dieksekusi secara dinamis (non-cached).
export const dynamic = 'force-dynamic'; 

// POST: Import user data
export async function POST(request: Request) {
  const userId = getUserIdFromRequest(request); 

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // request.json() akan berfungsi di sini dan akan mencoba membaca seluruh body.
    // Jika file sangat besar (>4MB), Anda mungkin perlu menambah limit di next.config.js
    const backupData: any = await request.json();

    if (!backupData || backupData.user_id !== userId) {
      return NextResponse.json({ message: 'Invalid or mismatched backup file' }, { status: 400 });
    }

    // --- Langkah Kritis: Hapus Data Lama ---
    await prisma.$transaction([
      // Hapus Transactions lama
      prisma.transaction.deleteMany({ where: { userId } }),
      // Hapus Budget Limit lama
      prisma.budgetLimit.deleteMany({ where: { userId } }),
      // Hapus Savings Goals lama
      prisma.savingsGoal.deleteMany({ where: { userId } }),
    ]);

    // --- Langkah Kritis: Masukkan Data Baru ---
    const importPromises = [];

    // 1. Import Transactions
    if (backupData.transactions?.length) {
      const txnsToCreate = backupData.transactions.map((t: any) => ({
        ...t,
        userId: userId, 
        // Pastikan konversi Float
        amount: parseFloat(t.amount || t.amount.toString()),
        date: new Date(t.date),
        createdAt: new Date(t.createdAt),
      }));
      importPromises.push(prisma.transaction.createMany({ data: txnsToCreate }));
    }

    // 2. Import Budget Limit
    if (backupData.budgetLimit) {
      const b = backupData.budgetLimit;
      const budgetToCreate = {
        userId: userId,
        totalBudget: parseFloat(b.totalBudget),
        dailyLimit: parseFloat(b.dailyLimit),
        startDate: new Date(b.startDate),
        endDate: new Date(b.endDate),
        isActive: b.isActive,
      };
      importPromises.push(prisma.budgetLimit.create({ data: budgetToCreate }));
    }

    // 3. Import Savings Goals
    if (backupData.savingsGoals?.length) {
      const goalsToCreate = backupData.savingsGoals.map((g: any) => ({
        ...g,
        userId: userId,
        targetAmount: parseFloat(g.targetAmount),
        currentAmount: parseFloat(g.currentAmount),
        deadline: g.deadline ? new Date(g.deadline) : null,
        createdAt: new Date(g.createdAt),
        updatedAt: new Date(g.updatedAt),
      }));
      importPromises.push(prisma.savingsGoal.createMany({ data: goalsToCreate }));
    }

    await prisma.$transaction(importPromises);

    return NextResponse.json({ message: 'Data imported successfully', records: backupData.transactions.length }, { status: 200 });

  } catch (error) {
    console.error('Import POST API error:', error);
    return NextResponse.json({ message: 'Failed to import data. Check file format.' }, { status: 500 });
  }
}