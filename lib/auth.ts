// path: lib/auth.ts
import { User, Prisma } from '@prisma/client'; 
// BARU: Import library bcryptjs
import * as bcrypt from 'bcryptjs'; 
import type { PrismaClient } from '@prisma/client/edge';

export type ClientUser = Omit<User, 'password' | 'createdAt' | 'updatedAt' | 'transactions' | 'budgetLimit' | 'savingsGoals'>;

// HASHING PASSWORD DENGAN BCRYPT
const saltRounds = 10; // Nilai standar yang bagus untuk keamanan
export const hashPassword = async (password: string) => {
    // Menggunakan bcrypt.hash untuk menghasilkan hash yang aman
    return bcrypt.hash(password, saltRounds);
};
export const comparePassword = async (password: string, hash: string) => {
    // Menggunakan bcrypt.compare untuk membandingkan password yang diinput dengan hash yang tersimpan
    return bcrypt.compare(password, hash); 
};

// Helper untuk otentikasi API
export function getUserIdFromRequest(request: Request): string | null {
    // Membaca header X-User-Id yang dikirim dari frontend
    const mockUserId = request.headers.get('x-user-id');
    return mockUserId;
}

// Helper untuk membuat header otentikasi secara langsung
export const getMockSessionHeader = () => {
    if (typeof window !== 'undefined') {
        const userId = sessionStorage.getItem('session_token_mock');
        return userId ? { 'X-User-Id': userId } : {};
    }
    return {};
};

// --- Frontend Session Management (Client Side) ---

// Simpan ClientUser dan token ID ke sessionStorage
export const persistUserSession = (userData: ClientUser) => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
        sessionStorage.setItem('session_token_mock', userData.id); 
    }
}
export const clearUserSession = () => {
    if (typeof window !== 'undefined') {
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('session_token_mock');
    }
}
export const getClientUserSession = (): ClientUser | null => {
    if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem('currentUser');
        return stored ? JSON.parse(stored) : null;
    }
    return null;
}