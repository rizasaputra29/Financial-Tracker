// rizasaputra29/financial-tracker/Financial-Tracker-15996308ee6cfd5d3abc50bd8eb71447eefc8019/app/dashboard/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SimpleProgress } from '@/components/SimpleProgress';
import { Wallet, TrendingUp, TrendingDown, Target, Plus, Calendar, AlertTriangle, XCircle } from 'lucide-react'; // BARU: Import XCircle
import Link from 'next/link';
import { formatRupiah, cleanRupiah } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';


// Helper function to calculate days difference
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
  const { transactions, budgetLimit, savingsGoals, getDailyExpenses, getRemainingDailyBudget, setBudgetLimit, getAdjustedRemainingTotalBudget, resetBudgetLimit } = // BARU: Import resetBudgetLimit
    useFinance();
  const { toast } = useToast();

  const today = new Date().toISOString().split('T')[0];
  
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [budgetForm, setBudgetForm] = useState({
    totalBudget: budgetLimit?.totalBudget.toString() || '',
    startDate: budgetLimit?.startDate || new Date().toISOString().split('T')[0],
    endDate: budgetLimit?.endDate || '',
    isActive: budgetLimit?.isActive ?? true,
  });

  const handleTotalBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanedValue = cleanRupiah(e.target.value);
    setBudgetForm({ ...budgetForm, totalBudget: cleanedValue });
  };

  const handleSetBudget = async () => {
    if (!budgetForm.totalBudget || !budgetForm.endDate || !budgetForm.startDate) {
      toast({
        title: 'Error',
        description: 'Please fill Total Budget, Start Date, and End Date',
        variant: 'destructive',
      });
      return;
    }

    const daysCount = calculateDaysDifference(budgetForm.startDate, budgetForm.endDate);
    const totalBudgetAmount = parseFloat(budgetForm.totalBudget); 
    
    const calculatedDailyLimit = daysCount > 0 ? totalBudgetAmount / daysCount : totalBudgetAmount;

    try {
      await setBudgetLimit({
        totalBudget: totalBudgetAmount,
        dailyLimit: calculatedDailyLimit,
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
  
  // FUNGSI BARU: Handler untuk tombol Reset Budget
  const handleResetBudget = async () => {
    if (!budgetLimit) return;
    
    try {
        await resetBudgetLimit();
        toast({
            title: 'Budget Reset',
            description: 'Budget limit has been reset.',
        });
    } catch(e) {
        toast({
            title: 'Error',
            description: 'Failed to reset budget. Please check server connection.',
            variant: 'destructive',
        });
    }
  };

  const daysCountEstimate = budgetForm.startDate && budgetForm.endDate 
    ? calculateDaysDifference(budgetForm.startDate, budgetForm.endDate) 
    : 0;
    
  const estimatedTotalBudget = parseFloat(budgetForm.totalBudget || '0');
  const estimatedDailyLimit = daysCountEstimate > 0 ? estimatedTotalBudget / daysCountEstimate : 0;
  
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

  const adjustedRemainingTotalBudget = getAdjustedRemainingTotalBudget(); 
  
  // LOGIKA BARU: Cek apakah budget aktif hari ini (berada dalam periode)
  const isBudgetActiveToday = budgetLimit && 
                              budgetLimit.isActive && 
                              today >= budgetLimit.startDate && 
                              today <= budgetLimit.endDate;
                              
  const dailyBudgetExceeded = isBudgetActiveToday && todayExpenses > budgetLimit!.dailyLimit; 

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
            {/* ... Summary Cards ... */}
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

          {/* WARNING KETIKA DAILY BUDGET TERLAMPUI */}
          {dailyBudgetExceeded && budgetLimit && (
            <Alert 
              variant="destructive" 
              className="mb-6 border-2 border-red-600 shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]"
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning: Daily Budget Exceeded!</AlertTitle>
              <AlertDescription>
                  Pengeluaran Anda hari ini ({formatRupiah(todayExpenses)}) telah melebihi batas harian ({formatRupiah(budgetLimit.dailyLimit)}). 
                  Sisa budget total Anda telah disesuaikan dan akan mempengaruhi sisa budget harian di hari-hari mendatang.
              </AlertDescription>
            </Alert>
          )}

          {/* KARTU BUDGET HANYA TAMPIL JIKA isBudgetActiveToday TRUE */}
          {isBudgetActiveToday && budgetLimit ? (
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold">Daily Budget Tracker</CardTitle>
                
                <div className="flex gap-2">
                    {/* TOMBOL BARU: Reset Budget */}
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleResetBudget}
                        className="bg-red-600 text-white hover:bg-red-700 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
                    >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reset Budget
                    </Button>

                    {/* TOMBOL EDIT BUDGET */}
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
                      
                      <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold">Set Budget Limit</DialogTitle>
                          <DialogDescription>
                              Set your total budget and the duration. Your daily limit will be calculated automatically.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label>Total Budget (untuk seluruh periode)</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                              <Input
                                type="text" 
                                placeholder="3.000.000"
                                value={formatRupiah(estimatedTotalBudget).replace('Rp', '').trim()} 
                                onChange={handleTotalBudgetChange}
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
                          
                          {daysCountEstimate > 0 && estimatedTotalBudget > 0 && (
                            <div className="p-3 border-2 border-dashed border-gray-300 rounded-md bg-gray-50 text-sm">
                              <p className="font-semibold">Estimasi Daily Limit:</p>
                              <p className="text-lg font-bold text-black">
                                {formatRupiah(estimatedDailyLimit)} 
                                <span className="font-normal text-gray-500 text-sm"> / hari ({daysCountEstimate} hari)</span>
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
                </div>
                
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
                
                <div className="text-sm text-gray-600 space-y-1 pt-4 border-t-2 border-dashed border-gray-300">
                    <p>Original Total Budget: <span className="font-semibold">{formatRupiah(budgetLimit.totalBudget)}</span></p>
                    <p className="text-lg font-bold">
                        Adjusted Remaining Total: 
                        <span 
                            className={`ml-2 ${adjustedRemainingTotalBudget < 0 ? 'text-red-600' : 'text-green-600'}`}
                        >
                            {formatRupiah(adjustedRemainingTotalBudget)}
                        </span>
                    </p>
                    <p className="text-xs text-gray-500">
                        Periode Budget: {new Date(budgetLimit.startDate).toLocaleDateString('id-ID')} -{' '}
                        {new Date(budgetLimit.endDate).toLocaleDateString('id-ID')}
                    </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            // KARTU TAMPIL JIKA BELUM ADA BUDGET TERSIMPAN ATAU DILUAR JANGKA WAKTU
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="w-12 h-12 mb-4 text-gray-400" />
                <h3 className="text-xl font-bold mb-2">Budget Not Active</h3>
                
                {budgetLimit && (
                    <p className="text-gray-600 mb-4 text-center">
                        Budget yang tersimpan saat ini ({formatRupiah(budgetLimit.totalBudget)}) **tidak aktif** karena diluar periode yang ditentukan: 
                        <br/>
                        ({new Date(budgetLimit.startDate).toLocaleDateString('id-ID')} - {new Date(budgetLimit.endDate).toLocaleDateString('id-ID')}).
                    </p>
                )}
                {!budgetLimit && (
                    <p className="text-gray-600 mb-4 text-center">
                        Belum ada batas budget yang ditetapkan. Tentukan batas budget Anda di bawah ini.
                    </p>
                )}
                
                <Dialog open={isBudgetOpen} onOpenChange={setIsBudgetOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                      <Plus className="w-4 h-4 mr-2" />
                      Set Budget Limit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">Set Budget Limit</DialogTitle>
                      <DialogDescription>
                          Set your total budget and the duration. Your daily limit will be calculated automatically.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Total Budget (untuk seluruh periode)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                          <Input
                            type="text" 
                            placeholder="3.000.000"
                            value={formatRupiah(estimatedTotalBudget).replace('Rp', '').trim()} 
                            onChange={handleTotalBudgetChange}
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
                      
                      {daysCountEstimate > 0 && estimatedTotalBudget > 0 && (
                        <div className="p-3 border-2 border-dashed border-gray-300 rounded-md bg-gray-50 text-sm">
                          <p className="font-semibold">Estimasi Daily Limit:</p>
                          <p className="text-lg font-bold text-black">
                            {formatRupiah(estimatedDailyLimit)} 
                            <span className="font-normal text-gray-500 text-sm"> / hari ({daysCountEstimate} hari)</span>
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
            {/* Kartu Recent Transactions */}
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

            {/* Kartu Savings Goals */}
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