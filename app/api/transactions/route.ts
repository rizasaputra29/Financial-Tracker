// path: app/api/transactions/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

// GET: Read all transactions for the user
export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request); 

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Transactions GET API error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create a new transaction
export async function POST(request: Request) {
  const userId = getUserIdFromRequest(request); 

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { type, amount, category, description, date } = await request.json();

    const newTransaction = await prisma.transaction.create({
      data: {
        userId,
        type,
        amount: parseFloat(amount),
        category,
        description,
        date: new Date(date), 
      },
    });
    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error('Transactions POST API error:', error);
    return NextResponse.json({ message: 'Failed to create transaction' }, { status: 500 });
  }
}

// PUT: Update an existing transaction (Fitur Edit)
export async function PUT(request: Request) {
    const userId = getUserIdFromRequest(request);
  
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
  
    try {
        const { id, type, amount, category, description, date } = await request.json();

        if (!id) {
            return NextResponse.json({ message: 'Transaction ID is required for update' }, { status: 400 });
        }
  
        const updatedTransaction = await prisma.transaction.update({
            where: { id, userId }, 
            data: {
                type,
                amount: parseFloat(amount),
                category,
                description,
                date: new Date(date), 
            },
        });
        return NextResponse.json(updatedTransaction);
    } catch (error) {
      console.error('Transactions PUT API error:', error);
      return NextResponse.json({ message: 'Failed to update transaction' }, { status: 500 });
    }
}

// DELETE: Delete a transaction
export async function DELETE(request: Request) {
    const userId = getUserIdFromRequest(request); 
  
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
  
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: 'Transaction ID is required for deletion' }, { status: 400 });
        }

        await prisma.transaction.delete({
            where: { id, userId }, 
        });
        return NextResponse.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Transactions DELETE API error:', error);
        return NextResponse.json({ message: 'Failed to delete transaction' }, { status: 500 });
    }
}