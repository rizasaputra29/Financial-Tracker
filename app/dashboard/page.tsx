'use client';

import { useState, useMemo } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SimpleProgress } from '@/components/SimpleProgress';
import { Wallet, TrendingUp, TrendingDown, Target, Plus } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { transactions, budgetLimit, savingsGoals, getDailyExpenses, getRemainingDailyBudget } =
    useFinance();
  const today = new Date().toISOString().split('T')[0];

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
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-gray-600">
                  Total Balance
                </CardTitle>
                <Wallet className="w-4 h-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  Rp {balance.toLocaleString('id-ID')}
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
                  Rp {totalIncome.toLocaleString('id-ID')}
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
                  Rp {totalExpenses.toLocaleString('id-ID')}
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

          {budgetLimit && budgetLimit.isActive && (
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Daily Budget Tracker</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Today's Spending</p>
                    <p className="text-2xl font-bold">
                      Rp {todayExpenses.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Daily Limit</p>
                    <p className="text-2xl font-bold">
                      Rp {budgetLimit.dailyLimit.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold">Remaining Today</span>
                    <span className="text-sm font-semibold">
                      Rp {remainingDailyBudget.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <SimpleProgress
                    value={(todayExpenses / budgetLimit.dailyLimit) * 100}
                    className="h-3 border-2 border-black"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  Budget period: {new Date(budgetLimit.startDate).toLocaleDateString('id-ID')} -{' '}
                  {new Date(budgetLimit.endDate).toLocaleDateString('id-ID')}
                </div>
              </CardContent>
            </Card>
          )}

          {!budgetLimit && (
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="w-12 h-12 mb-4 text-gray-400" />
                <h3 className="text-xl font-bold mb-2">No Budget Limit Set</h3>
                <p className="text-gray-600 mb-4 text-center">
                  Set a daily budget limit to track your spending
                </p>
                <Link href="/transactions">
                  <Button className="bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                    <Plus className="w-4 h-4 mr-2" />
                    Set Budget Limit
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                            {transaction.type === 'income' ? '+' : '-'}Rp{' '}
                            {transaction.amount.toLocaleString('id-ID')}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

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
                          <span>Rp {goal.currentAmount.toLocaleString('id-ID')}</span>
                          <span>Rp {goal.targetAmount.toLocaleString('id-ID')}</span>
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
