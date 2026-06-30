'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../lib/calc';
import { cn } from '../../lib/utils/cn';
import { appTheme, getContentCardStyles, getTextStyles } from '../../lib/colors/app-theme';

/**
 * BalanceCards component displays individual participant net balances
 * Shows who owes money (negative balance) and who is owed money (positive balance)
 */
export function BalanceCards({ 
  balances = [], 
  participants = [], 
  currency = 'USD',
  className 
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

  // Helper function to get card styles based on theme
  const getCardBgStyle = () => ({
    backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.8)' : 'rgba(255, 255, 255, 0.9)',
    ...(isDarkMode && { border: '1px solid rgba(75, 85, 99, 0.5)' })
  });

  if (!balances.length || !participants.length) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="font-medium text-foreground">No balance data available</p>
      </div>
    );
  }

  // Sort balances by net balance (highest positive first, then lowest negative)
  const sortedBalances = [...balances].sort((a, b) => b.netBalance - a.netBalance);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Individual Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedBalances.map((balance, index) => {
          const participant = participants.find(p => p.id === balance.participantId);
          if (!participant) return null;

          const isPositive = balance.netBalance > 0.01;
          const isNegative = balance.netBalance < -0.01;
          const isSettled = Math.abs(balance.netBalance) <= 0.01;

          return (
            <motion.div
              key={balance.participantId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div 
                className="p-4 rounded-lg border backdrop-blur-sm"
                style={getCardBgStyle()}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-lg text-foreground">
                    {participant.name}
                  </h4>
                  <div 
                    className={`w-3 h-3 rounded-full ${
                      isPositive ? 'bg-green-500' :
                      isNegative ? 'bg-red-500' : 'bg-gray-500'
                    }`}
                  />
                </div>

                {/* Net Balance */}
                <div className="text-center mb-3">
                  <p className="text-sm font-medium mb-1 text-muted-foreground">
                    Net Balance
                  </p>
                  <p 
                    className={`text-3xl font-bold ${
                      isPositive ? 'text-green-600 dark:text-green-400' :
                      isNegative ? 'text-red-600 dark:text-red-400' : 
                      'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {isPositive && '+'}
                    {formatCurrency(balance.netBalance, currency)}
                  </p>
                  <p 
                    className={`text-sm font-semibold mt-1 ${
                      isPositive ? 'text-green-600 dark:text-green-400' :
                      isNegative ? 'text-red-600 dark:text-red-400' : 
                      'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {isPositive && 'Should receive'}
                    {isNegative && 'Owes money'}
                    {isSettled && 'All settled'}
                  </p>
                </div>

                {/* Breakdown */}
                <div className="space-y-2 pt-3 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">Paid:</span>
                    <span className="font-bold text-foreground">
                      {formatCurrency(balance.totalPaid, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">Owes:</span>
                    <span className="font-bold text-foreground">
                      {formatCurrency(balance.totalOwed, currency)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: sortedBalances.length * 0.1 + 0.2 }}
        className="p-4 rounded-lg border backdrop-blur-sm"
        style={getCardBgStyle()}
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm font-bold mb-1 text-foreground">Creditors</p>
            <p className="font-bold text-2xl text-green-600 dark:text-green-400">
              {balances.filter(b => b.netBalance > 0.01).length}
            </p>
          </div>
          <div>
            <p className="text-sm font-bold mb-1 text-foreground">Debtors</p>
            <p className="font-bold text-2xl text-red-600 dark:text-red-400">
              {balances.filter(b => b.netBalance < -0.01).length}
            </p>
          </div>
          <div>
            <p className="text-sm font-bold mb-1 text-foreground">Settled</p>
            <p className="font-bold text-2xl text-foreground">
              {balances.filter(b => Math.abs(b.netBalance) <= 0.01).length}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}