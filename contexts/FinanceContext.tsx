'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
  setBudgetLimit: (budget: Omit<BudgetLimit, 'id' | 'userId'>) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'userId'>) => void;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  getDailyExpenses: (date: string) => number;
  getRemainingDailyBudget: (date: string) => number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetLimit, setBudgetLimitState] = useState<BudgetLimit | null>(null);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);

  useEffect(() => {
    if (user) {
      const storedTransactions = JSON.parse(
        localStorage.getItem(`transactions_${user.id}`) || '[]'
      );
      const storedBudget = JSON.parse(
        localStorage.getItem(`budgetLimit_${user.id}`) || 'null'
      );
      const storedGoals = JSON.parse(
        localStorage.getItem(`savingsGoals_${user.id}`) || '[]'
      );

      setTransactions(storedTransactions);
      setBudgetLimitState(storedBudget);
      setSavingsGoals(storedGoals);
    } else {
      setTransactions([]);
      setBudgetLimitState(null);
      setSavingsGoals([]);
    }
  }, [user]);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;

    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      userId: user.id,
      createdAt: new Date().toISOString(),
    };

    const updated = [...transactions, newTransaction];
    setTransactions(updated);
    localStorage.setItem(`transactions_${user.id}`, JSON.stringify(updated));
  };

  const deleteTransaction = (id: string) => {
    if (!user) return;

    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    localStorage.setItem(`transactions_${user.id}`, JSON.stringify(updated));
  };

  const setBudgetLimit = (budget: Omit<BudgetLimit, 'id' | 'userId'>) => {
    if (!user) return;

    const newBudget: BudgetLimit = {
      ...budget,
      id: Date.now().toString(),
      userId: user.id,
    };

    setBudgetLimitState(newBudget);
    localStorage.setItem(`budgetLimit_${user.id}`, JSON.stringify(newBudget));
  };

  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id' | 'userId'>) => {
    if (!user) return;

    const newGoal: SavingsGoal = {
      ...goal,
      id: Date.now().toString(),
      userId: user.id,
    };

    const updated = [...savingsGoals, newGoal];
    setSavingsGoals(updated);
    localStorage.setItem(`savingsGoals_${user.id}`, JSON.stringify(updated));
  };

  const updateSavingsGoal = (id: string, updates: Partial<SavingsGoal>) => {
    if (!user) return;

    const updated = savingsGoals.map((goal) =>
      goal.id === id ? { ...goal, ...updates } : goal
    );
    setSavingsGoals(updated);
    localStorage.setItem(`savingsGoals_${user.id}`, JSON.stringify(updated));
  };

  const deleteSavingsGoal = (id: string) => {
    if (!user) return;

    const updated = savingsGoals.filter((g) => g.id !== id);
    setSavingsGoals(updated);
    localStorage.setItem(`savingsGoals_${user.id}`, JSON.stringify(updated));
  };

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
        deleteTransaction,
        setBudgetLimit,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        getDailyExpenses,
        getRemainingDailyBudget,
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
