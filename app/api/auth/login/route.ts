// path: app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, ClientUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const passwordValid = await comparePassword(password, user.password);
    if (!passwordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const userWithoutPassword: ClientUser = { 
        id: user.id, 
        email: user.email, 
        fullName: user.fullName, 
        avatarUrl: user.avatarUrl 
    };
    
    // Di sini Anda akan membuat session/JWT dan set cookie di aplikasi nyata
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}