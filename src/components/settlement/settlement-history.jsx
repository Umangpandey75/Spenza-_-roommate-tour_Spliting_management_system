'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { formatCurrency } from '../../lib/calc';
import { Check, Undo } from 'lucide-react';

/**
 * SettlementHistory component to track and manage settlement changes
 */
export function SettlementHistory({ 
  settlements = [], 
  participants = [], 
  currency = 'USD',
  onMarkCompleted,
  onUndoCompletion,
  className 
}) {
  const [completedTransfers, setCompletedTransfers] = useState(new Set());
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

  const getParticipantName = (participantId) => {
    const participant = participants.find(p => p.id === participantId);
    return participant ? participant.name : 'Unknown';
  };

  const handleMarkCompleted = (transferIndex) => {
    const newCompleted = new Set(completedTransfers);
    newCompleted.add(transferIndex);
    setCompletedTransfers(newCompleted);
    
    if (onMarkCompleted) {
      onMarkCompleted(transferIndex, settlements[transferIndex]);
    }
  };

  const handleUndoCompletion = (transferIndex) => {
    const newCompleted = new Set(completedTransfers);
    newCompleted.delete(transferIndex);
    setCompletedTransfers(newCompleted);
    
    if (onUndoCompletion) {
      onUndoCompletion(transferIndex, settlements[transferIndex]);
    }
  };

  const completedCount = completedTransfers.size;
  const totalCount = settlements.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Helper function to get card styles based on theme
  const getCardBgStyle = () => ({
    backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.8)' : 'rgba(255, 255, 255, 0.6)',
    ...(isDarkMode && { border: '1px solid rgba(75, 85, 99, 0.5)' })
  });

  const getCompletedCardBgStyle = () => ({
    backgroundColor: isDarkMode ? 'rgba(75, 85, 99, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    ...(isDarkMode && { border: '1px solid rgba(75, 85, 99, 0.5)' })
  });

  return (
    <div 
      className={`bg-gradient-to-br from-teal-200 to-teal-300 dark:from-teal-500/10 dark:to-teal-600/5 border border-teal-400 dark:border-teal-500/20 rounded-xl p-6 hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300 ${className || ''}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-teal-300 dark:bg-teal-500/20 rounded-lg flex items-center justify-center">
          <svg
            className="w-5 h-5 text-teal-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-foreground">
          Settlement History
        </h3>
      </div>

      {settlements.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-teal-300 dark:bg-teal-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="font-medium text-foreground">No settlement history to track</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Progress Overview */}
          <div className="p-4 rounded-lg" style={getCardBgStyle()}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground">
                Settlement Progress
              </p>
              <p className="text-sm font-bold text-foreground">
                {completedCount} of {totalCount} completed
              </p>
            </div>
            <div className="w-full bg-white/40 dark:bg-gray-700/40 rounded-full h-2">
              <motion.div 
                className="bg-teal-600 dark:bg-teal-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Settlement List */}
          <div className="space-y-3">
            {settlements.map((transfer, index) => {
              const isCompleted = completedTransfers.has(index);
              const fromId = transfer.fromId || transfer.from;
              const toId = transfer.toId || transfer.to;
              const fromParticipant = participants.find(p => p.id === fromId);
              const toParticipant = participants.find(p => p.id === toId);
              
              if (!fromParticipant || !toParticipant) return null;
              
              return (
                <motion.div
                  key={`${transfer.fromId}-${transfer.toId}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-200 ${
                    isCompleted ? 'opacity-75' : ''
                  }`}
                  style={isCompleted ? getCompletedCardBgStyle() : getCardBgStyle()}
                >
                  {/* Status indicator */}
                  <div 
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCompleted 
                        ? 'bg-teal-600 dark:bg-teal-500 text-white' 
                        : 'bg-teal-200 dark:bg-teal-800 text-teal-800 dark:text-teal-200'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <span className="text-xs font-medium">{index + 1}</span>
                    )}
                  </div>

                  {/* Transfer details */}
                  <div className={`flex-1 ${isCompleted ? 'line-through' : ''}`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">
                        {fromParticipant.name}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-semibold text-foreground">
                        {toParticipant.name}
                      </span>
                      <span className="font-bold text-foreground">
                        {formatCurrency(transfer.amount, currency)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action button */}
                  <div className="flex items-center">
                    {isCompleted ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUndoCompletion(index)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        <Undo className="h-3 w-3 mr-1" />
                        Undo
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkCompleted(index)}
                        className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Mark Paid
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Completion celebration */}
          {completedCount === totalCount && totalCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 rounded-lg text-center"
              style={getCompletedCardBgStyle()}
            >
              <div className="text-2xl mb-2">🎉</div>
              <h3 className="font-semibold mb-1 text-foreground">All Settled!</h3>
              <p className="text-sm text-muted-foreground">
                All transfers have been completed successfully.
              </p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}