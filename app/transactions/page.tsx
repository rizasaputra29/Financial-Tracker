'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];
const expenseCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'];

export default function TransactionsPage() {
  const { transactions, budgetLimit, addTransaction, deleteTransaction, setBudgetLimit } = useFinance();
  const { toast } = useToast();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);

  const [transactionForm, setTransactionForm] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [budgetForm, setBudgetForm] = useState({
    totalBudget: budgetLimit?.totalBudget.toString() || '',
    dailyLimit: budgetLimit?.dailyLimit.toString() || '',
    startDate: budgetLimit?.startDate || new Date().toISOString().split('T')[0],
    endDate: budgetLimit?.endDate || '',
    isActive: budgetLimit?.isActive ?? true,
  });

  const handleAddTransaction = () => {
    if (!transactionForm.amount || !transactionForm.category) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    addTransaction({
      type: transactionForm.type,
      amount: parseFloat(transactionForm.amount),
      category: transactionForm.category,
      description: transactionForm.description,
      date: transactionForm.date,
    });

    toast({
      title: 'Success',
      description: 'Transaction added successfully',
    });

    setTransactionForm({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    setIsAddOpen(false);
  };

  const handleSetBudget = () => {
    if (!budgetForm.totalBudget || !budgetForm.dailyLimit || !budgetForm.endDate) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    setBudgetLimit({
      totalBudget: parseFloat(budgetForm.totalBudget),
      dailyLimit: parseFloat(budgetForm.dailyLimit),
      startDate: budgetForm.startDate,
      endDate: budgetForm.endDate,
      isActive: budgetForm.isActive,
    });

    toast({
      title: 'Success',
      description: 'Budget limit set successfully',
    });

    setIsBudgetOpen(false);
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
    toast({
      title: 'Success',
      description: 'Transaction deleted',
    });
  };

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Transactions</h1>
              <p className="text-gray-600">Manage your income and expenses</p>
            </div>
            <div className="flex gap-3">
              <Dialog open={isBudgetOpen} onOpenChange={setIsBudgetOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-white text-black hover:bg-gray-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                    <Calendar className="w-4 h-4 mr-2" />
                    Set Budget
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Set Budget Limit</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Total Budget</Label>
                      <Input
                        type="number"
                        placeholder="5000000"
                        value={budgetForm.totalBudget}
                        onChange={(e) =>
                          setBudgetForm({ ...budgetForm, totalBudget: e.target.value })
                        }
                        className="border-2 border-black"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Daily Limit</Label>
                      <Input
                        type="number"
                        placeholder="150000"
                        value={budgetForm.dailyLimit}
                        onChange={(e) =>
                          setBudgetForm({ ...budgetForm, dailyLimit: e.target.value })
                        }
                        className="border-2 border-black"
                      />
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
                    <Button
                      onClick={handleSetBudget}
                      className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                      Save Budget
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Transaction
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Add Transaction</DialogTitle>
                  </DialogHeader>
                  <Tabs
                    value={transactionForm.type}
                    onValueChange={(value) =>
                      setTransactionForm({ ...transactionForm, type: value as 'income' | 'expense' })
                    }
                  >
                    <TabsList className="grid w-full grid-cols-2 border-2 border-black">
                      <TabsTrigger value="expense" className="font-semibold">
                        Expense
                      </TabsTrigger>
                      <TabsTrigger value="income" className="font-semibold">
                        Income
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="expense" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          placeholder="50000"
                          value={transactionForm.amount}
                          onChange={(e) =>
                            setTransactionForm({ ...transactionForm, amount: e.target.value })
                          }
                          className="border-2 border-black"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                          value={transactionForm.category}
                          onValueChange={(value) =>
                            setTransactionForm({ ...transactionForm, category: value })
                          }
                        >
                          <SelectTrigger className="border-2 border-black">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="border-2 border-black">
                            {expenseCategories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={transactionForm.date}
                          onChange={(e) =>
                            setTransactionForm({ ...transactionForm, date: e.target.value })
                          }
                          className="border-2 border-black"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description (Optional)</Label>
                        <Textarea
                          placeholder="Add notes..."
                          value={transactionForm.description}
                          onChange={(e) =>
                            setTransactionForm({ ...transactionForm, description: e.target.value })
                          }
                          className="border-2 border-black"
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="income" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          placeholder="5000000"
                          value={transactionForm.amount}
                          onChange={(e) =>
                            setTransactionForm({ ...transactionForm, amount: e.target.value })
                          }
                          className="border-2 border-black"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                          value={transactionForm.category}
                          onValueChange={(value) =>
                            setTransactionForm({ ...transactionForm, category: value })
                          }
                        >
                          <SelectTrigger className="border-2 border-black">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="border-2 border-black">
                            {incomeCategories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={transactionForm.date}
                          onChange={(e) =>
                            setTransactionForm({ ...transactionForm, date: e.target.value })
                          }
                          className="border-2 border-black"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description (Optional)</Label>
                        <Textarea
                          placeholder="Add notes..."
                          value={transactionForm.description}
                          onChange={(e) =>
                            setTransactionForm({ ...transactionForm, description: e.target.value })
                          }
                          className="border-2 border-black"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                  <Button
                    onClick={handleAddTransaction}
                    className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    Add Transaction
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader>
              <CardTitle className="text-xl font-bold">All Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {sortedTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No transactions yet</p>
                  <p className="text-sm text-gray-500">
                    Click "Add Transaction" to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border-2 border-black hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-lg border-2 border-black ${
                            transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                          }`}
                        >
                          {transaction.type === 'income' ? (
                            <TrendingUp className="w-5 h-5" />
                          ) : (
                            <TrendingDown className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{transaction.category}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(transaction.date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                          {transaction.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {transaction.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div
                          className={`text-xl font-bold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}Rp{' '}
                          {transaction.amount.toLocaleString('id-ID')}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="border-2 border-black hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
