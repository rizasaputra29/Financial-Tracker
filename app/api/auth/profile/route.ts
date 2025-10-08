// path: app/api/auth/profile/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest, ClientUser } from '@/lib/auth'; 

// GET: Read profile (Memastikan sinkronisasi sesi)
export async function GET(request: Request) {
  const userId = getUserIdFromRequest(request); 

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({ 
        where: { id: userId },
        select: { id: true, email: true, fullName: true, avatarUrl: true } 
    });

    if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user as ClientUser);
  } catch (error) {
    console.error('Profile GET API error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Update profile
export async function PUT(request: Request) {
  const userId = getUserIdFromRequest(request); 

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { fullName, email, avatarUrl } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { fullName, email, avatarUrl },
      select: { id: true, email: true, fullName: true, avatarUrl: true },
    });

    return NextResponse.json(updatedUser as ClientUser);
  } catch (error) {
    console.error('Profile PUT API error:', error);
    return NextResponse.json({ message: 'Failed to update profile' }, { status: 500 });
  }
}

// POST: Forgot Password
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
        console.log(`[ACTION MOCK] Sending password reset link to: ${email}`);
    }
    
    return NextResponse.json({ message: 'Reset link sent (if email exists)' });
  } catch (error) {
    console.error('Forgot Password API error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}