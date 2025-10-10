// path: app/api/auth/profile/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest, ClientUser, comparePassword, hashPassword } from '@/lib/auth'; // BARU: Import hashPassword

// ------------------------------------------------
// GET: Ambil Profil Pengguna
// ------------------------------------------------
export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, fullName: true, avatarUrl: true }, 
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user as ClientUser);
  } catch (error) {
    console.error('GET Profile API error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// ------------------------------------------------
// PUT: Perbarui Profil Pengguna
// ------------------------------------------------
export async function PUT(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const dataToUpdate = await request.json();

    const { fullName, avatarUrl } = dataToUpdate;
    const updateData: { fullName?: string; avatarUrl?: string } = {};

    if (fullName) updateData.fullName = fullName;
    if (avatarUrl) updateData.avatarUrl = avatarUrl;
    
    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ message: 'No valid fields provided for update' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, email: true, fullName: true, avatarUrl: true }, 
    });

    return NextResponse.json(updatedUser as ClientUser);
  } catch (error) {
    console.error('PUT Profile API error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// ------------------------------------------------
// POST: Forgot Password (Direct Reset)
// ------------------------------------------------
export async function POST(request: Request) {
  try {
    // BARU: Terima newPassword
    const { email, securityAnswer, newPassword } = await request.json();

    if (!email || !securityAnswer || !newPassword) { // BARU: Validasi newPassword
        return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ 
        where: { email },
        select: { id: true, securityAnswer: true } 
    });
    
    if (!user) {
        // Keamanan: Selalu kembalikan pesan gagal/error agar tidak membocorkan keberadaan email
        return NextResponse.json({ message: 'Password reset failed: Invalid credentials' }, { status: 400 });
    }
    
    // 1. Cocokkan Jawaban Keamanan
    const answerValid = await comparePassword(securityAnswer, user.securityAnswer);
    
    if (answerValid) {
        // 2. Hash Password Baru
        const hashedPassword = await hashPassword(newPassword); 
        
        // 3. Update Database
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }, // Simpan password baru yang di-hash
        });

        console.log(`[ACTION] Password successfully reset for: ${email}`);
        return NextResponse.json({ message: 'Password reset successful' });
    } else {
        console.log(`[ACTION] Password reset FAILED for: ${email} (Security check FAILED)`);
        // Kembalikan 400 jika cek keamanan gagal
        return NextResponse.json({ message: 'Password reset failed: Invalid credentials' }, { status: 400 }); 
    }
  } catch (error) {
    console.error('Forgot Password API error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}