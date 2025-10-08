// path: lib/auth.ts
import { User, Prisma } from '@prisma/client'; 

// Dapatkan tipe data User yang TIDAK termasuk password dan data relasi
export type ClientUser = Omit<User, 'password' | 'createdAt' | 'updatedAt' | 'transactions' | 'budgetLimit' | 'savingsGoals'>;

// MOCK HASHING (GUNAKAN BCRYPT ASLI DI PRODUCTION!)
export const hashPassword = async (password: string) => `hashed_${password}_secure`;
export const comparePassword = async (password: string, hash: string) => hash.includes(password); 

// Helper untuk otentikasi API
export function getUserIdFromRequest(request: Request): string | null {
    // Membaca header X-User-Id yang dikirim dari frontend
    const mockUserId = request.headers.get('x-user-id');
    return mockUserId;
}

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