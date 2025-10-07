'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SimpleProgress } from '@/components/SimpleProgress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Target, Check, DollarSign } from 'lucide-react';

export default function SavingsPage() {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } = useFinance();
  const { toast } = useToast();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addAmountGoalId, setAddAmountGoalId] = useState<string | null>(null);
  const [addAmountValue, setAddAmountValue] = useState('');

  const [goalForm, setGoalForm] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
  });

  const handleAddGoal = () => {
    if (!goalForm.name || !goalForm.targetAmount) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    addSavingsGoal({
      name: goalForm.name,
      targetAmount: parseFloat(goalForm.targetAmount),
      currentAmount: parseFloat(goalForm.currentAmount || '0'),
      deadline: goalForm.deadline || undefined,
      isCompleted: false,
    });

    toast({
      title: 'Success',
      description: 'Savings goal created successfully',
    });

    setGoalForm({
      name: '',
      targetAmount: '',
      currentAmount: '',
      deadline: '',
    });
    setIsAddOpen(false);
  };

  const handleAddAmount = (goalId: string) => {
    if (!addAmountValue) return;

    const goal = savingsGoals.find((g) => g.id === goalId);
    if (!goal) return;

    const newAmount = goal.currentAmount + parseFloat(addAmountValue);
    const isCompleted = newAmount >= goal.targetAmount;

    updateSavingsGoal(goalId, {
      currentAmount: newAmount,
      isCompleted,
    });

    toast({
      title: 'Success',
      description: isCompleted
        ? 'Congratulations! Goal completed!'
        : 'Amount added to savings goal',
    });

    setAddAmountValue('');
    setAddAmountGoalId(null);
  };

  const handleDeleteGoal = (goalId: string) => {
    deleteSavingsGoal(goalId);
    toast({
      title: 'Success',
      description: 'Savings goal deleted',
    });
  };

  const handleMarkComplete = (goalId: string) => {
    updateSavingsGoal(goalId, { isCompleted: true });
    toast({
      title: 'Success',
      description: 'Goal marked as completed',
    });
  };

  const activeGoals = savingsGoals.filter((g) => !g.isCompleted);
  const completedGoals = savingsGoals.filter((g) => g.isCompleted);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Savings Goals</h1>
              <p className="text-gray-600">Track your savings targets and progress</p>
            </div>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">Create Savings Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Goal Name</Label>
                    <Input
                      placeholder="e.g., Emergency Fund, Vacation"
                      value={goalForm.name}
                      onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                      className="border-2 border-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Target Amount</Label>
                    <Input
                      type="number"
                      placeholder="10000000"
                      value={goalForm.targetAmount}
                      onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
                      className="border-2 border-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Starting Amount (Optional)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={goalForm.currentAmount}
                      onChange={(e) =>
                        setGoalForm({ ...goalForm, currentAmount: e.target.value })
                      }
                      className="border-2 border-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Deadline (Optional)</Label>
                    <Input
                      type="date"
                      value={goalForm.deadline}
                      onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                      className="border-2 border-black"
                    />
                  </div>
                  <Button
                    onClick={handleAddGoal}
                    className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    Create Goal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-6">
            {activeGoals.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Active Goals</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeGoals.map((goal) => (
                    <Card
                      key={goal.id}
                      className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl font-bold">{goal.name}</CardTitle>
                            {goal.deadline && (
                              <p className="text-sm text-gray-600 mt-1">
                                Deadline:{' '}
                                {new Date(goal.deadline).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleMarkComplete(goal.id)}
                              className="border-2 border-black hover:bg-green-50"
                              title="Mark as complete"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteGoal(goal.id)}
                              className="border-2 border-black hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-semibold">Progress</span>
                            <span className="text-sm font-semibold">
                              {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                            </span>
                          </div>
                          <SimpleProgress
                            value={(goal.currentAmount / goal.targetAmount) * 100}
                            className="h-3 border-2 border-black"
                          />
                        </div>

                        <div className="flex justify-between text-sm">
                          <div>
                            <p className="text-gray-600">Current</p>
                            <p className="font-bold text-lg">
                              Rp {goal.currentAmount.toLocaleString('id-ID')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-600">Target</p>
                            <p className="font-bold text-lg">
                              Rp {goal.targetAmount.toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 border-t-2 border-black">
                          {addAmountGoalId === goal.id ? (
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                placeholder="Amount to add"
                                value={addAmountValue}
                                onChange={(e) => setAddAmountValue(e.target.value)}
                                className="border-2 border-black"
                              />
                              <Button
                                onClick={() => handleAddAmount(goal.id)}
                                className="bg-black text-white hover:bg-gray-800 border-2 border-black"
                              >
                                Add
                              </Button>
                              <Button
                                onClick={() => {
                                  setAddAmountGoalId(null);
                                  setAddAmountValue('');
                                }}
                                variant="outline"
                                className="border-2 border-black"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => setAddAmountGoalId(goal.id)}
                              className="w-full bg-white text-black hover:bg-gray-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
                            >
                              <DollarSign className="w-4 h-4 mr-2" />
                              Add Money
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {completedGoals.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Completed Goals</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {completedGoals.map((goal) => (
                    <Card
                      key={goal.id}
                      className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-green-50"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-xl font-bold">{goal.name}</CardTitle>
                              <div className="p-1 bg-green-600 rounded-full">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </div>
                            {goal.deadline && (
                              <p className="text-sm text-gray-600 mt-1">
                                Completed on:{' '}
                                {new Date(goal.deadline).toLocaleDateString('id-ID')}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="border-2 border-black hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-4">
                          <p className="text-gray-600 mb-2">Goal Achieved</p>
                          <p className="font-bold text-2xl">
                            Rp {goal.targetAmount.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {savingsGoals.length === 0 && (
              <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Target className="w-16 h-16 mb-4 text-gray-400" />
                  <h3 className="text-2xl font-bold mb-2">No Savings Goals Yet</h3>
                  <p className="text-gray-600 mb-6 text-center">
                    Create your first savings goal to start tracking your progress
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
