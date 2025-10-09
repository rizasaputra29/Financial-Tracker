// rizasaputra29/financial-tracker/Financial-Tracker-15996308ee6cfd5d3abc50bd8eb71447eefc8019/app/transactions/page.tsx
'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { useFinance, Transaction } from '@/contexts/FinanceContext';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, TrendingUp, TrendingDown, Edit } from 'lucide-react';
import { formatRupiah, cleanRupiah } from '@/lib/utils'; // Import cleanRupiah

const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];
const expenseCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'];

const initialTransactionForm = {
  id: '',
  type: 'expense' as 'income' | 'expense',
  amount: '',
  category: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
};

const calculateDaysDifference = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    startDate.setHours(12, 0, 0, 0);
    endDate.setHours(12, 0, 0, 0); 
    
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays + 1 : 1;
}


export default function TransactionsPage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const { toast } = useToast();

  const [isTxnFormOpen, setIsTxnFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [transactionForm, setTransactionForm] = useState<typeof initialTransactionForm>({
    ...initialTransactionForm,
  });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanedValue = cleanRupiah(e.target.value);
    setTransactionForm({ ...transactionForm, amount: cleanedValue });
  };
  
  const handleEditTransaction = (transaction: Transaction) => {
    setTransactionForm({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount.toString(),
        category: transaction.category,
        description: transaction.description || '',
        date: transaction.date.split('T')[0],
    });
    setIsEditing(true); 
    setIsTxnFormOpen(true);
  };

  const handleTxnDialogChange = (open: boolean) => {
    setIsTxnFormOpen(open);
    if (!open) {
      setTransactionForm({ ...initialTransactionForm });
      setIsEditing(false); 
    }
  };

  const handleSaveTransaction = async () => {
    if (!transactionForm.amount || !transactionForm.category) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    const transactionData = {
        type: transactionForm.type,
        amount: parseFloat(transactionForm.amount), 
        category: transactionForm.category,
        description: transactionForm.description,
        date: transactionForm.date,
    }

    try {
        if (isEditing && transactionForm.id) { 
            await updateTransaction(transactionForm.id, transactionData);

            toast({
                title: 'Success',
                description: 'Transaction updated successfully',
            });
        } else {
            await addTransaction(transactionData);

            toast({
                title: 'Success',
                description: 'Transaction added successfully',
            });
        }
        
        setTransactionForm({ ...initialTransactionForm });
        setIsEditing(false); 
        setIsTxnFormOpen(false);

    } catch(e) {
        toast({
            title: 'Error',
            description: 'Failed to save transaction. Please check server connection.',
            variant: 'destructive',
        });
    }
  };


  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
      toast({
        title: 'Success',
        description: 'Transaction deleted',
      });
    } catch(e) {
      toast({
          title: 'Error',
          description: 'Failed to delete transaction. Please check server connection.',
          variant: 'destructive',
      });
    }
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
              {/* Add/Edit Transaction Dialog */}
              <Dialog open={isTxnFormOpen} onOpenChange={handleTxnDialogChange}>
                <DialogTrigger asChild>
                  {/* START PERBAIKAN BUTTON */}
                  <Button 
                    className="
                      bg-black text-white hover:bg-gray-800 border-2 border-black 
                      shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
                      transition-all
                      
                      // Default (mobile): icon size (h-10 w-10) dan padding minimal (px-0)
                      w-10 px-0
                      // Small/Desktop: full button size (w-auto px-4)
                      sm:w-auto sm:px-4 
                    "
                    size="default" 
                  >
                    {/* Icon: Jangan berikan margin di mobile, berikan margin di sm ke atas */}
                    <Plus className="w-4 h-4 mr-0 sm:mr-2" />
                    
                    {/* Text: Sembunyikan di mobile, tampilkan di sm ke atas */}
                    <span className="hidden sm:inline">Add Transaction</span>
                  </Button>
                  {/* END PERBAIKAN BUTTON */}
                </DialogTrigger>
                <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        {isEditing ? 'Edit Transaction' : 'Add Transaction'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Modify the details of this transaction.' : 'Record a new income or expense.'}
                    </DialogDescription>
                  </DialogHeader>
                  <Tabs
                    value={transactionForm.type}
                    onValueChange={(value) =>
                      setTransactionForm({ ...transactionForm, type: value as 'income' | 'expense' })
                    }
                  >
                    <TabsList className="grid w-full grid-cols-2 border-2 border-black">
                      <TabsTrigger value="expense" className="font-semibold" disabled={isEditing}>
                        Expense
                      </TabsTrigger>
                      <TabsTrigger value="income" className="font-semibold" disabled={isEditing}>
                        Income
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value={transactionForm.type} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Amount</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                            <Input
                              type="text" 
                              placeholder={transactionForm.type === 'income' ? '5.000.000' : '50.000'}
                              value={formatRupiah(parseFloat(transactionForm.amount || '0')).replace('Rp', '').trim()}
                              onChange={handleAmountChange}
                              className="border-2 border-black pl-8 text-right" 
                            />
                        </div>
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
                            {(transactionForm.type === 'expense' ? expenseCategories : incomeCategories).map((cat) => (
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
                    onClick={handleSaveTransaction}
                    className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    {isEditing ? 'Save Changes' : 'Add Transaction'}
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
                      className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border-2 border-black hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-4 flex-1 mb-3 md:mb-0">
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
                      
                      <div className="flex justify-between items-center w-full md:w-auto">
                        
                        <div
                          className={`text-lg font-bold md:text-xl md:text-right flex-1 ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatRupiah(transaction.amount)}
                        </div>
                        
                        <div className="flex items-center gap-2 md:gap-4 ml-4">
                          {/* Edit Button */}
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditTransaction(transaction)}
                            className="border-2 border-black hover:bg-yellow-50 h-8 w-8"
                            title="Edit Transaction"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {/* Delete Button */}
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="border-2 border-black hover:bg-red-50 h-8 w-8"
                            title="Delete Transaction"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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