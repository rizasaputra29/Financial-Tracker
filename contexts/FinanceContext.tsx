// rizasaputra29/financial-tracker/Financial-Tracker-15996308ee6cfd5d3abc50bd8eb71447eefc8019/contexts/FinanceContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';

export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string; 
  createdAt: string;
}

export interface BudgetLimit {
  id: string;
  userId: string;
  totalBudget: number;
  dailyLimit: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  isCompleted: boolean;
}


interface FinanceContextType {
  transactions: Transaction[];
  budgetLimit: BudgetLimit | null;
  savingsGoals: SavingsGoal[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setBudgetLimit: (budget: Omit<BudgetLimit, 'id' | 'userId'>) => Promise<void>;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'userId'>) => Promise<void>;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;
  getDailyExpenses: (date: string) => number;
  getRemainingDailyBudget: (date: string) => number;
  // BARU: Fungsi untuk budget dinamis
  getPeriodExpenses: (start: string, end: string) => number;
  getAdjustedRemainingTotalBudget: () => number;
  fetchFinanceData: () => Promise<void>;
  backupData: () => Promise<void>;
  importData: (file: File) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Helper untuk membuat header otentikasi secara langsung
const getHeaders = (userId: string) => ({ 
    'X-User-Id': userId, 
    'Content-Type': 'application/json',
});

// Helper untuk mengubah string/Date dari API menjadi string YYYY-MM-DD
const formatDate = (dateInput: Date | string): string => {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
    return date.toISOString().split('T')[0];
};

// Helper: Memeriksa apakah tanggal berada dalam periode budget
const isDateInPeriod = (date: string, start: string, end: string): boolean => {
    // Memastikan perbandingan string tanggal (YYYY-MM-DD)
    return date >= start && date <= end;
};

// HELPER: Mengubah number menjadi string numerik yang bersih untuk API
const numberToCleanString = (num: number): string => {
    if (!isFinite(num)) return '0';
    // Menggunakan toFixed(2) untuk menghindari notasi E dan menghapus desimal jika bulat
    return num.toFixed(2).replace(/\.00$/, '');
}


export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth(); 
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetLimit, setBudgetLimitState] = useState<BudgetLimit | null>(null);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);

  // FIX: Mengubah ini menjadi fungsi yang dideklarasikan secara eksplisit
  const fetchFinanceData = async () => {
    if (isAuthLoading || !user) return; 
    
    const headers = getHeaders(user.id);
    
    try {
      // 1. Fetch Transactions
      const txnResponse = await fetch('/api/transactions', { headers });
      if (txnResponse.ok) {
        const transactionsData: Transaction[] = await txnResponse.json();
        const formattedTransactions = transactionsData.map(t => ({ 
            ...t, 
            date: formatDate(t.date) 
        }));
        setTransactions(formattedTransactions);
      } else {
         if (txnResponse.status !== 404) {
             console.error('Failed to fetch transactions:', txnResponse.statusText);
         }
      }

      // 2. Fetch Budget Limit 
      const budgetResponse = await fetch('/api/budget', { headers });
      if (budgetResponse.ok) {
          const budgetData: BudgetLimit | null = await budgetResponse.json();
          if (budgetData) {
              setBudgetLimitState({
                  ...budgetData,
                  startDate: formatDate(budgetData.startDate),
                  endDate: formatDate(budgetData.endDate),
              });
          } else {
              setBudgetLimitState(null);
          }
      }

      // 3. Fetch Savings Goals 
      const savingsResponse = await fetch('/api/savings', { headers });
      if (savingsResponse.ok) {
          const goalsData: SavingsGoal[] = await savingsResponse.json();
          setSavingsGoals(goalsData.map(g => ({
              ...g,
              deadline: g.deadline ? formatDate(g.deadline) : undefined,
          })));
      }

    } catch (error) {
      console.error('Error fetching finance data:', error);
      setTransactions([]);
      setBudgetLimitState(null);
      setSavingsGoals([]);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && user) {
        fetchFinanceData();
    } else if (!isAuthLoading && !user) {
        setTransactions([]);
        setBudgetLimitState(null);
        setSavingsGoals([]);
    }
  }, [user, isAuthLoading]);

  // --- FUNGSI CRUD TRANSACTIONS ---

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;

    const payload = {
      ...transaction,
      amount: numberToCleanString(transaction.amount),
    };

    const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: getHeaders(user.id), 
        body: JSON.stringify(payload),
    });

    if (response.ok) {
        const newTransaction: Transaction = await response.json();
        setTransactions((prev) => [{ ...newTransaction, date: formatDate(newTransaction.date) }, ...prev]);
    } else {
        throw new Error('Failed to add transaction.');
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>) => {
    if (!user) return;

    const payload = {
        ...updates,
        id,
        amount: updates.amount !== undefined ? numberToCleanString(updates.amount) : undefined,
    };

    const response = await fetch('/api/transactions', {
        method: 'PUT',
        headers: getHeaders(user.id), 
        body: JSON.stringify(payload),
    });

    if (response.ok) {
        const updatedTransaction: Transaction = await response.json();
        setTransactions((prev) => prev.map((t) => (
            t.id === id ? { ...updatedTransaction, date: formatDate(updatedTransaction.date) } : t
        )));
    } else {
        throw new Error('Failed to update transaction.');
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;

    const response = await fetch(`/api/transactions?id=${id}`, {
        method: 'DELETE',
        headers: getHeaders(user.id), 
    });

    if (response.ok) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
    } else {
        throw new Error('Failed to delete transaction.');
    }
  };

  // --- FUNGSI CRUD BUDGET LIMIT ---

  const setBudgetLimit = async (budget: Omit<BudgetLimit, 'id' | 'userId'>) => {
    if (!user) return;
    
    const payload = {
        ...budget,
        totalBudget: numberToCleanString(budget.totalBudget),
        dailyLimit: numberToCleanString(budget.dailyLimit),
    };

    const response = await fetch('/api/budget', {
        method: 'POST', 
        headers: getHeaders(user.id), 
        body: JSON.stringify(payload),
    });
    
    if (response.ok) {
        const newBudget: BudgetLimit = await response.json();
        setBudgetLimitState(newBudget);
    } else {
        throw new Error('Failed to save budget limit.');
    }
  };
  
  // --- FUNGSI CRUD SAVINGS GOALS ---

  const addSavingsGoal = async (goal: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;

    const payload = {
        ...goal,
        targetAmount: numberToCleanString(goal.targetAmount),
        currentAmount: numberToCleanString(goal.currentAmount),
    };

    const response = await fetch('/api/savings', {
        method: 'POST',
        headers: getHeaders(user.id),
        body: JSON.stringify(payload),
    });
    
    if (response.ok) {
        const newGoal: SavingsGoal = await response.json();
        setSavingsGoals((prev) => [...prev, newGoal]);
    } else {
        throw new Error('Failed to add savings goal.');
    }
  };

  const updateSavingsGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    if (!user) return;

    const updatedBody = {
        updates: { 
            ...updates, 
            currentAmount: updates.currentAmount !== undefined ? numberToCleanString(updates.currentAmount) : undefined,
            targetAmount: updates.targetAmount !== undefined ? numberToCleanString(updates.targetAmount) : undefined,
        },
        id 
    };

    const response = await fetch('/api/savings', {
        method: 'PUT',
        headers: getHeaders(user.id),
        body: JSON.stringify(updatedBody),
    });

    if (response.ok) {
        const updatedGoal: SavingsGoal = await response.json();
        setSavingsGoals((prev) => prev.map((g) => (g.id === id ? updatedGoal : g)));
    } else {
        throw new Error('Failed to update savings goal.');
    }
  };

  const deleteSavingsGoal = async (id: string) => {
    if (!user) return;

    const response = await fetch(`/api/savings?id=${id}`, {
        method: 'DELETE',
        headers: getHeaders(user.id),
    });

    if (response.ok) {
        setSavingsGoals((prev) => prev.filter((t) => t.id !== id));
    } else {
        throw new Error('Failed to delete savings goal.');
    }
  };

  // --- FUNGSI BACKUP & IMPORT ---

  const backupData = async () => {
    if (!user) {
      throw new Error('User not authenticated for backup.');
    }
    
    const response = await fetch('/api/backup', { headers: getHeaders(user.id) });

    if (response.ok) {
      const blob = await response.blob();
      const filename = response.headers.get('Content-Disposition')?.split('filename=')[1].replace(/"/g, '') || 'financial_tracker_backup.json';
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } else {
      throw new Error(`Failed to create backup: ${response.statusText}`);
    }
  };

  const importData = async (file: File) => {
    if (!user) {
      throw new Error('User not authenticated for import.');
    }

    if (file.type !== 'application/json') {
      throw new Error('Invalid file type. Please upload a JSON file.');
    }

    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const content = event.target?.result;
          const backupData = JSON.parse(content as string);
          
          const response = await fetch('/api/import', {
            method: 'POST',
            headers: getHeaders(user.id),
            body: JSON.stringify(backupData),
          });

          if (response.ok) {
            await fetchFinanceData();
            resolve();
          } else {
            const error = await response.json();
            reject(new Error(`Import failed: ${error.message}`));
          }
        } catch (e) {
          reject(new Error('Failed to parse or process the backup file.'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error reading file.'));
      };

      reader.readAsText(file);
    });
  };


  // --- FUNGSI BARU UNTUK BUDGET DINAMIS ---
  
  const getPeriodExpenses = useCallback((start: string, end: string): number => {
    return transactions.reduce((sum, t) => {
        if (t.type === 'expense' && isDateInPeriod(t.date, start, end)) {
            return sum + t.amount;
        }
        return sum;
    }, 0);
  }, [transactions]);
  
  // LOGIKA UTAMA: Menghitung sisa budget total berdasarkan pengeluaran aktual
  const getAdjustedRemainingTotalBudget = useCallback((): number => {
    if (!budgetLimit || !budgetLimit.isActive) return 0;
    
    // Hitung total pengeluaran yang sudah terjadi dalam periode budget
    const totalExpensesInPeriod = getPeriodExpenses(budgetLimit.startDate, budgetLimit.endDate);
    
    // Sisa Budget Total = Total Budget Awal - Total Pengeluaran Aktual dalam Periode
    const remaining = budgetLimit.totalBudget - totalExpensesInPeriod;
    
    return remaining; 
  }, [budgetLimit, getPeriodExpenses]);

  // --- FUNGSI HELPER LAMA ---
  const getDailyExpenses = (date: string) => {
    return transactions
      .filter((t) => t.type === 'expense' && t.date === date)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getRemainingDailyBudget = (date: string) => {
    if (!budgetLimit || !budgetLimit.isActive) return 0;

    const dailyExpenses = getDailyExpenses(date);
    return Math.max(0, budgetLimit.dailyLimit - dailyExpenses);
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgetLimit,
        savingsGoals,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        setBudgetLimit,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        getDailyExpenses,
        getRemainingDailyBudget,
        // BARU: Export fungsi-fungsi budget dinamis
        getPeriodExpenses,
        getAdjustedRemainingTotalBudget, 
        fetchFinanceData,
        backupData, 
        importData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}