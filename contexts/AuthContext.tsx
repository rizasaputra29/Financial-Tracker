// rizasaputra29/financial-tracker/Financial-Tracker-15996308ee6cfd5d3abc50bd8eb71447eefc8019/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getClientUserSession, persistUserSession, clearUserSession, ClientUser } from '@/lib/auth'; 

interface AuthContextType {
  user: ClientUser | null; 
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<ClientUser>) => Promise<boolean>; 
  forgotPassword: (email: string) => Promise<boolean>;
  isLoading: boolean; // Disediakan untuk sinkronisasi di FinanceContext
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ClientUser | null>(null); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = getClientUserSession();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false); // Sesi selesai dimuat, baik ada user maupun tidak.
  }, []);

  const register = async (email: string, password: string, fullName: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });

      if (response.ok) {
        const newUser: ClientUser = await response.json(); 
        persistUserSession(newUser);
        setUser(newUser);
        return true;
      }
      return false; 
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const loggedInUser: ClientUser = await response.json();
        persistUserSession(loggedInUser);
        setUser(loggedInUser);
        return true;
      }
      return false; 
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    clearUserSession();
    setUser(null);
  };

  const updateProfile = async (data: Partial<ClientUser>): Promise<boolean> => {
    if (!user) return false;

    try {
        // Menggunakan user.id yang dijamin ada
        const response = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'X-User-Id': user.id, // Eksplisit menggunakan user.id
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const updatedUser: ClientUser = await response.json();
            persistUserSession(updatedUser);
            setUser(updatedUser);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Profile update error:', error);
        return false;
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
        const response = await fetch('/api/auth/profile', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        
        return response.ok;
    } catch (error) {
        console.error('Forgot Password error:', error);
        return false;
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, forgotPassword, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}