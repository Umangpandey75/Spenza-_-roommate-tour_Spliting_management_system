'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { formatCurrency } from '../../lib/calc';
import { getCategoryIcon } from '../../lib/utils/category-icons';

export function Overview({ 
  group, 
  balances, 
  settlements, 
  totalSpent, 
  hasDebts, 
  onAddExpense, 
  onAddParticipant, 
  onViewSettlements 
}) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const regularExpenses = group.expenses.filter(e => e.description !== 'Settlement Payment');
  const totalExpenses = regularExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const perPersonExpense = group.participants.length > 0 ? totalExpenses / group.participants.length : 0;
  const totalOwed = balances.reduce((sum, balance) => sum + Math.abs(balance.netBalance), 0) / 2;

  const categoryBreakdown = useMemo(() => {
    const categories = {};
    group.expenses.forEach(expense => {
      const category = expense.category || 'Others';
      categories[category] = (categories[category] || 0) + expense.amount;
    });
    return Object.entries(categories)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [group.expenses]);

  // Helper function to get card styles based on theme
  const getCardBgStyle = () => ({
    backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.8)' : 'rgba(255, 255, 255, 0.6)',
    ...(isDarkMode && { border: '1px solid rgba(75, 85, 99, 0.5)' })
  });

  const getIconBgStyle = () => ({
    backgroundColor: isDarkMode ? 'rgba(75, 85, 99, 0.8)' : 'rgba(255, 255, 255, 0.8)'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-gradient-to-br from-blue-200 to-blue-300 dark:from-blue-500/10 dark:to-blue-600/5 border border-blue-400 dark:border-blue-500/20 rounded-xl p-6 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-300 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-foreground">Total Expenses</h3>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(totalExpenses, group.currency)}</p>
          <p className="text-xs text-muted-foreground mt-1">{group.expenses.length} expense{group.expenses.length !== 1 ? 's' : ''}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-gradient-to-br from-emerald-200 to-emerald-300 dark:from-emerald-500/10 dark:to-emerald-600/5 border border-emerald-400 dark:border-emerald-500/20 rounded-xl p-6 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-300 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-foreground">Participants</h3>
          </div>
          <p className="text-2xl font-bold text-foreground">{group.participants.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Active members</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-gradient-to-br from-purple-200 to-purple-300 dark:from-purple-500/10 dark:to-purple-600/5 border border-purple-400 dark:border-purple-500/20 rounded-xl p-6 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-300 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-foreground">Settlements</h3>
          </div>
          <p className="text-2xl font-bold text-foreground">{settlements.length}</p>
          <p className="text-xs text-muted-foreground mt-1">{hasDebts ? 'Pending' : 'All settled'}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-gradient-to-br from-orange-200 to-orange-300 dark:from-orange-500/10 dark:to-orange-600/5 border border-orange-400 dark:border-orange-500/20 rounded-xl p-6 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-300 dark:bg-orange-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-foreground">Per Person</h3>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(perPersonExpense, group.currency)}</p>
          <p className="text-xs text-muted-foreground mt-1">Average</p>
        </motion.div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-gradient-to-br from-emerald-200 to-emerald-300 dark:from-emerald-500/10 dark:to-emerald-600/5 border border-emerald-400 dark:border-emerald-500/20 rounded-xl p-6 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-300 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-foreground">Recent Expenses</h3>
          </div>
          {group.expenses.length === 0 ? (
            <div className="text-center py-8">
              <button
                onClick={onAddExpense}
                className="w-14 h-14 mx-auto mb-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700/50 rounded-full flex items-center justify-center hover:bg-green-100 hover:border-green-300 hover:scale-110 dark:hover:bg-green-800/30 dark:hover:border-green-600/50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
              >
                <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <p className="text-foreground text-base mb-2 font-semibold">No expenses yet</p>
              <p className="text-muted-foreground text-sm font-medium">Click the + to add your first expense!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {group.expenses.slice(-4).reverse().map((expense, index) => {
                return (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg transition-colors"
                    style={getCardBgStyle()}
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                      style={getIconBgStyle()}
                    >
                      {getCategoryIcon(expense.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-medium text-sm truncate">{expense.description}</p>
                      <p className="text-muted-foreground text-xs">
                        {group.participants.find(p => p.id === expense.payerId)?.name || 'Unknown'} •
                        {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                      {formatCurrency(expense.amount, group.currency)}
                    </span>
                  </motion.div>
                );
              })}
              {group.expenses.length > 4 && (
                <div className="text-center pt-2">
                  <span className="text-muted-foreground text-xs">+{group.expenses.length - 4} more expenses</span>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Balance Overview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="bg-gradient-to-br from-purple-200 to-purple-300 dark:from-purple-500/10 dark:to-purple-600/5 border border-purple-400 dark:border-purple-500/20 rounded-xl p-6 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-300 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-1m-3 1l-3-1" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-foreground">Balance Overview</h3>
          </div>
          {balances.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-foreground text-sm mb-1 font-medium">All settled up!</p>
              <p className="text-muted-foreground text-xs">No outstanding balances</p>
            </div>
          ) : (
            <div className="space-y-3">
              {balances.slice(0, 5).map((balance, index) => {
                const participant = group.participants.find(p => p.id === balance.participantId);
                if (!participant) return null;

                return (
                  <motion.div
                    key={balance.participantId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.7 + index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={getCardBgStyle()}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {participant.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <span className="text-foreground font-medium text-sm">{participant.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {Math.abs(balance.netBalance) > 0.01 && (
                        <div className={`w-2 h-2 rounded-full ${balance.netBalance > 0.01 ? 'bg-green-400' : 'bg-red-400'
                          }`}></div>
                      )}
                      <span className={`font-semibold text-sm ${balance.netBalance > 0.01 ? 'text-green-600 dark:text-green-400' :
                        balance.netBalance < -0.01 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                        {balance.netBalance > 0.01 ? '+' : ''}{formatCurrency(balance.netBalance, group.currency)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="bg-gradient-to-br from-indigo-200 to-indigo-300 dark:from-indigo-500/10 dark:to-indigo-600/5 border border-indigo-400 dark:border-indigo-500/20 rounded-xl p-6 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-300 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-foreground">Spending by Category</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categoryBreakdown.map(({ category, amount }, index) => {
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.8 + index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={getCardBgStyle()}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                      style={getIconBgStyle()}
                    >
                      {getCategoryIcon(category)}
                    </div>
                    <span className="text-foreground font-medium text-sm">{category}</span>
                  </div>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(amount, group.currency)}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      {hasDebts && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-purple-200 to-purple-300 dark:from-purple-500/10 dark:to-purple-600/5 border border-purple-400 dark:border-purple-500/20 rounded-xl p-6">
            <div className="mb-4">
              <div className="w-12 h-12 mx-auto mb-3 bg-purple-300 dark:bg-purple-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Settle Up?</h3>
              <p className="text-muted-foreground text-sm mb-4">Outstanding balances of {formatCurrency(totalOwed, group.currency)} need to be settled</p>
            </div>
            <Button
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/25 px-8"
              onClick={onViewSettlements}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              View Settlements
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}