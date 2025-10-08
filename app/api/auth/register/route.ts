// path: app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { ClientUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'Email already exists' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=000&color=fff`;

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        avatarUrl: defaultAvatarUrl,
      },
      select: { id: true, email: true, fullName: true, avatarUrl: true }, 
    });

    return NextResponse.json(newUser as ClientUser, { status: 201 });
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}