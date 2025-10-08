// rizasaputra29/financial-tracker/Financial-Tracker-15996308ee6cfd5d3abc50bd8eb71447eefc8019/app/dashboard/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SimpleProgress } from '@/components/SimpleProgress';
import { Wallet, TrendingUp, TrendingDown, Target, Plus, Calendar } from 'lucide-react';
import Link from 'next/link';
import { formatRupiah, cleanRupiah } from '@/lib/utils'; // Import formatRupiah and cleanRupiah
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';


// Helper function to calculate days difference (moved from transactions/page.tsx)
const calculateDaysDifference = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    // Set time to noon to avoid timezone issues affecting day difference
    startDate.setHours(12, 0, 0, 0);
    endDate.setHours(12, 0, 0, 0); 
    
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays + 1 : 1;
}

export default function DashboardPage() {
  const { transactions, budgetLimit, savingsGoals, getDailyExpenses, getRemainingDailyBudget, setBudgetLimit } =
    useFinance();
  const { toast } = useToast();

  const today = new Date().toISOString().split('T')[0];
  
  // STATE DAN LOGIKA BUDGET BARU (dipindahkan dari transactions/page.tsx)
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [budgetForm, setBudgetForm] = useState({
    dailyLimit: budgetLimit?.dailyLimit.toString() || '',
    startDate: budgetLimit?.startDate || new Date().toISOString().split('T')[0],
    endDate: budgetLimit?.endDate || '',
    isActive: budgetLimit?.isActive ?? true,
  });

  const handleDailyLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanedValue = cleanRupiah(e.target.value);
    setBudgetForm({ ...budgetForm, dailyLimit: cleanedValue });
  };

  const handleSetBudget = async () => {
    if (!budgetForm.dailyLimit || !budgetForm.endDate || !budgetForm.startDate) {
      toast({
        title: 'Error',
        description: 'Please fill Daily Limit, Start Date, and End Date',
        variant: 'destructive',
      });
      return;
    }

    const daysCount = calculateDaysDifference(budgetForm.startDate, budgetForm.endDate);
    const dailyLimitAmount = parseFloat(budgetForm.dailyLimit); 
    
    const calculatedTotalBudget = dailyLimitAmount * daysCount;

    try {
      await setBudgetLimit({
        totalBudget: calculatedTotalBudget, 
        dailyLimit: dailyLimitAmount,
        startDate: budgetForm.startDate,
        endDate: budgetForm.endDate,
        isActive: budgetForm.isActive,
      });

      toast({
        title: 'Success',
        description: 'Budget limit set successfully',
      });

      setIsBudgetOpen(false);
    } catch (e) {
      toast({
          title: 'Error',
          description: 'Failed to save budget limit. Please check server connection.',
          variant: 'destructive',
      });
    }
  };
  
  const daysCountEstimate = budgetForm.startDate && budgetForm.endDate 
    ? calculateDaysDifference(budgetForm.startDate, budgetForm.endDate) 
    : 0;
  const estimatedDailyLimit = parseFloat(budgetForm.dailyLimit || '0');
  const estimatedTotalBudget = estimatedDailyLimit * daysCountEstimate;
  // AKHIR LOGIKA BUDGET BARU

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const totalExpenses = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const balance = totalIncome - totalExpenses;
  const todayExpenses = getDailyExpenses(today);
  const remainingDailyBudget = getRemainingDailyBudget(today);

  const activeSavingsGoals = savingsGoals.filter((g) => !g.isCompleted);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's your financial overview.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* ... Kartu Summary lainnya (Balance, Income, Expenses, Goals) ... */}
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-gray-600">
                  Total Balance
                </CardTitle>
                <Wallet className="w-4 h-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatRupiah(balance)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-gray-600">
                  Total Income
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {formatRupiah(totalIncome)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-gray-600">
                  Total Expenses
                </CardTitle>
                <TrendingDown className="w-4 h-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {formatRupiah(totalExpenses)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-gray-600">
                  Savings Goals
                </CardTitle>
                <Target className="w-4 h-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{activeSavingsGoals.length}</div>
                <p className="text-xs text-gray-600 mt-1">Active goals</p>
              </CardContent>
            </Card>
          </div>

          {budgetLimit && budgetLimit.isActive ? (
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold">Daily Budget Tracker</CardTitle>
                
                {/* TOMBOL SET BUDGET DI POJOK KANAN CARD */}
                <Dialog open={isBudgetOpen} onOpenChange={setIsBudgetOpen}>
                  <DialogTrigger asChild>
                    <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-white text-black hover:bg-gray-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Set Budget
                    </Button>
                  </DialogTrigger>
                  
                  {/* DIALOG BUDGET */}
                  <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">Set Budget Limit</DialogTitle>
                      <DialogDescription>
                          Set your daily spending limit and the duration for tracking. Total budget will be calculated automatically.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Daily Limit (per hari)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                          <Input
                            type="text" 
                            placeholder="150.000"
                            value={formatRupiah(estimatedDailyLimit).replace('Rp', '').trim()} 
                            onChange={handleDailyLimitChange}
                            className="border-2 border-black pl-8 text-right"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={budgetForm.startDate}
                            onChange={(e) =>
                              setBudgetForm({ ...budgetForm, startDate: e.target.value })
                            }
                            className="border-2 border-black"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            value={budgetForm.endDate}
                            onChange={(e) =>
                              setBudgetForm({ ...budgetForm, endDate: e.target.value })
                            }
                            className="border-2 border-black"
                          />
                        </div>
                      </div>
                      
                      {daysCountEstimate > 0 && estimatedDailyLimit > 0 && (
                        <div className="p-3 border-2 border-dashed border-gray-300 rounded-md bg-gray-50 text-sm">
                          <p className="font-semibold">Estimasi Total Budget:</p>
                          <p className="text-lg font-bold text-black">
                            {formatRupiah(estimatedTotalBudget)} 
                            <span className="font-normal text-gray-500 text-sm"> ({daysCountEstimate} hari)</span>
                          </p>
                        </div>
                      )}
                      
                      <Button
                        onClick={handleSetBudget}
                        className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                      >
                        Save Budget
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Today's Spending</p>
                    <p className="text-2xl font-bold">
                      {formatRupiah(todayExpenses)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Daily Limit</p>
                    <p className="text-2xl font-bold">
                      {formatRupiah(budgetLimit.dailyLimit)}
                    </p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold">Remaining Today</span>
                    <span className="text-sm font-semibold">
                      {formatRupiah(remainingDailyBudget)}
                    </span>
                  </div>
                  <SimpleProgress
                    value={(todayExpenses / budgetLimit.dailyLimit) * 100}
                    className="h-3 border-2 border-black"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  Total Budget: {formatRupiah(budgetLimit.totalBudget)} ({new Date(budgetLimit.startDate).toLocaleDateString('id-ID')} -{' '}
                  {new Date(budgetLimit.endDate).toLocaleDateString('id-ID')})
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="w-12 h-12 mb-4 text-gray-400" />
                <h3 className="text-xl font-bold mb-2">No Budget Limit Set</h3>
                <p className="text-gray-600 mb-4 text-center">
                  Set a daily budget limit to track your spending
                </p>
                {/* Tombol yang sama untuk membuat budget saat belum ada */}
                <Dialog open={isBudgetOpen} onOpenChange={setIsBudgetOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                      <Plus className="w-4 h-4 mr-2" />
                      Set Budget Limit
                    </Button>
                  </DialogTrigger>
                  {/* ULANGI DIALOG BUDGET DI SINI AGAR BISA DIBUKA DARI SINI */}
                  <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">Set Budget Limit</DialogTitle>
                      <DialogDescription>
                          Set your daily spending limit and the duration for tracking. Total budget will be calculated automatically.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Daily Limit (per hari)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                          <Input
                            type="text" 
                            placeholder="150.000"
                            value={formatRupiah(estimatedDailyLimit).replace('Rp', '').trim()} 
                            onChange={handleDailyLimitChange}
                            className="border-2 border-black pl-8 text-right"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={budgetForm.startDate}
                            onChange={(e) =>
                              setBudgetForm({ ...budgetForm, startDate: e.target.value })
                            }
                            className="border-2 border-black"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            value={budgetForm.endDate}
                            onChange={(e) =>
                              setBudgetForm({ ...budgetForm, endDate: e.target.value })
                            }
                            className="border-2 border-black"
                          />
                        </div>
                      </div>
                      
                      {daysCountEstimate > 0 && estimatedDailyLimit > 0 && (
                        <div className="p-3 border-2 border-dashed border-gray-300 rounded-md bg-gray-50 text-sm">
                          <p className="font-semibold">Estimasi Total Budget:</p>
                          <p className="text-lg font-bold text-black">
                            {formatRupiah(estimatedTotalBudget)} 
                            <span className="font-normal text-gray-500 text-sm"> ({daysCountEstimate} hari)</span>
                          </p>
                        </div>
                      )}
                      
                      <Button
                        onClick={handleSetBudget}
                        className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                      >
                        Save Budget
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ... Kartu Recent Transactions ... */}
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No transactions yet</p>
                    <Link href="/transactions">
                      <Button className="bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Transaction
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions
                      .slice(-5)
                      .reverse()
                      .map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex justify-between items-center p-3 border-2 border-black"
                        >
                          <div>
                            <p className="font-semibold">{transaction.category}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(transaction.date).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                          <div
                            className={`text-lg font-bold ${
                              transaction.type === 'income'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatRupiah(transaction.amount)}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ... Kartu Savings Goals ... */}
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Savings Goals</CardTitle>
              </CardHeader>
              <CardContent>
                {activeSavingsGoals.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No savings goals yet</p>
                    <Link href="/savings">
                      <Button className="bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Goal
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeSavingsGoals.slice(0, 3).map((goal) => (
                      <div key={goal.id} className="p-3 border-2 border-black">
                        <div className="flex justify-between mb-2">
                          <p className="font-semibold">{goal.name}</p>
                          <p className="text-sm font-semibold">
                            {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                          </p>
                        </div>
                        <SimpleProgress
                          value={(goal.currentAmount / goal.targetAmount) * 100}
                          className="h-2 border border-black mb-2"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{formatRupiah(goal.currentAmount)}</span>
                          <span>{formatRupiah(goal.targetAmount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}