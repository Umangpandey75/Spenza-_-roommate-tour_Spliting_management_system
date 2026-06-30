'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { formatCurrency, computeNet, computeMinimalSettlements } from '../../lib/calc';
import { useDebounce } from '../../lib/utils/performance';
import { cn } from '../../lib/utils/cn';
import { getMotionVariants, getTransition } from '../../lib/utils/motion';
import {
  appTheme,
  getCardStyles,
  getTextStyles,
  getButtonStyles,
  getIconContainerStyles,
  getContentCardStyles,
} from '../../lib/colors/app-theme';

/**
 * WhatIfPanel component for simulating changes to participant weights and exclusions
 * Provides real-time recalculation with debounced input handling
 */
export function WhatIfPanel({ 
  group, 
  originalBalances = [], 
  originalSettlements = [],
  className 
}) {
  // Simulation state - stores adjustments without mutating original data
  const [adjustments, setAdjustments] = useState(new Map());
  const [isSimulating, setIsSimulating] = useState(false);
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

  // Initialize participant adjustments
  const initializeAdjustments = useCallback(() => {
    const newAdjustments = new Map();
    group.participants.forEach(participant => {
      newAdjustments.set(participant.id, {
        participantId: participant.id,
        weightMultiplier: 1.0, // Always start with 1.0, not the participant's default weight
        excluded: false
      });
    });
    setAdjustments(newAdjustments);
    setIsSimulating(true);
  }, [group.participants]);

  // Debounced recalculation to prevent excessive computation
  const debouncedRecalculate = useDebounce(() => {
    // Trigger recalculation by updating state
    setAdjustments(prev => new Map(prev));
  }, 300);

  // Calculate adjusted expenses based on current adjustments
  const adjustedExpenses = useMemo(() => {
    if (!isSimulating || adjustments.size === 0) {
      return group.expenses;
    }

    return group.expenses.map(expense => {
      const adjustedSplit = expense.split.map(split => {
        const adjustment = adjustments.get(split.participantId);
        if (!adjustment) return split;

        return {
          ...split,
          weight: adjustment.excluded ? 0 : split.weight * adjustment.weightMultiplier,
          included: !adjustment.excluded && split.included
        };
      });

      return {
        ...expense,
        split: adjustedSplit
      };
    });
  }, [group.expenses, adjustments, isSimulating]);

  // Calculate adjusted balances
  const adjustedBalances = useMemo(() => {
    if (!isSimulating) {
      return originalBalances;
    }

    try {
      return computeNet(adjustedExpenses, group.participants);
    } catch (error) {
      console.warn('Error calculating adjusted balances:', error);
      return originalBalances;
    }
  }, [adjustedExpenses, group.participants, originalBalances, isSimulating]);

  // Calculate adjusted settlements
  const adjustedSettlements = useMemo(() => {
    if (!isSimulating) {
      return originalSettlements;
    }

    try {
      return computeMinimalSettlements(adjustedBalances);
    } catch (error) {
      console.warn('Error calculating adjusted settlements:', error);
      return originalSettlements;
    }
  }, [adjustedBalances, originalSettlements, isSimulating]);

  // Handle weight multiplier change
  const handleWeightChange = useCallback((participantId, newMultiplier) => {
    // Allow empty string to enable typing, only validate on blur or when value is complete
    const rawValue = newMultiplier.toString().trim();
    
    // If empty or just a decimal point, store the raw value temporarily
    if (rawValue === '' || rawValue === '.') {
      setAdjustments(prev => {
        const newAdjustments = new Map(prev);
        const current = newAdjustments.get(participantId) || { participantId, weightMultiplier: 1.0, excluded: false };
        newAdjustments.set(participantId, {
          ...current,
          weightMultiplier: rawValue === '' ? '' : rawValue // Store empty or decimal point
        });
        return newAdjustments;
      });
      return; // Don't recalculate for incomplete input
    }
    
    // Parse and validate the number
    const parsedValue = parseFloat(rawValue);
    if (isNaN(parsedValue)) {
      return; // Don't update for invalid numbers
    }
    
    // Clamp the value between 0.1 and 5.0
    const multiplier = Math.max(0.1, Math.min(5.0, parsedValue));
    
    setAdjustments(prev => {
      const newAdjustments = new Map(prev);
      const current = newAdjustments.get(participantId) || { participantId, weightMultiplier: 1.0, excluded: false };
      newAdjustments.set(participantId, {
        ...current,
        weightMultiplier: multiplier
      });
      return newAdjustments;
    });

    debouncedRecalculate();
  }, [debouncedRecalculate]);

  // Handle weight input blur (when user finishes editing)
  const handleWeightBlur = useCallback((participantId) => {
    setAdjustments(prev => {
      const newAdjustments = new Map(prev);
      const current = newAdjustments.get(participantId) || { participantId, weightMultiplier: 1.0, excluded: false };
      
      // If the current value is empty or invalid, reset to 1.0
      const currentValue = current.weightMultiplier;
      if (currentValue === '' || currentValue === '.' || isNaN(parseFloat(currentValue))) {
        newAdjustments.set(participantId, {
          ...current,
          weightMultiplier: 1.0
        });
        debouncedRecalculate();
      }
      
      return newAdjustments;
    });
  }, [debouncedRecalculate]);

  // Handle exclusion toggle
  const handleExclusionToggle = useCallback((participantId) => {
    setAdjustments(prev => {
      const newAdjustments = new Map(prev);
      const current = newAdjustments.get(participantId) || { participantId, weightMultiplier: 1.0, excluded: false };
      newAdjustments.set(participantId, {
        ...current,
        excluded: !current.excluded
      });
      return newAdjustments;
    });

    debouncedRecalculate();
  }, [debouncedRecalculate]);

  // Reset simulation
  const handleReset = useCallback(() => {
    setAdjustments(new Map());
    setIsSimulating(false);
  }, []);

  // Start simulation
  const handleStartSimulation = useCallback(() => {
    initializeAdjustments();
  }, [initializeAdjustments]);

  // Ensure adjustments are initialized when simulation is active
  useEffect(() => {
    if (isSimulating && adjustments.size === 0) {
      initializeAdjustments();
    }
  }, [isSimulating, adjustments.size, initializeAdjustments]);

  // Helper function to get card styles based on theme
  const getCardBgStyle = () => ({
    backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.8)' : 'rgba(255, 255, 255, 0.6)',
    ...(isDarkMode && { border: '1px solid rgba(75, 85, 99, 0.5)' })
  });

  if (!group || !group.participants || group.participants.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-gradient-to-br from-pink-200 to-pink-300 dark:from-pink-500/10 dark:to-pink-600/5 border border-pink-400 dark:border-pink-500/20 rounded-2xl p-12 hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-300">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-pink-300 dark:bg-pink-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-pink-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              No participants available for simulation
            </h3>
            <p className="mb-8 max-w-md mx-auto text-muted-foreground">
              Add participants to your group first to start exploring different settlement scenarios.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isSimulating) {
    return (
      <motion.div
        className={cn('space-y-6', className)}
        variants={getMotionVariants('fadeInUp')}
        initial="initial"
        animate="animate"
        transition={getTransition('normal')}
      >
        <div className="text-center py-16">
          <div className="bg-gradient-to-br from-emerald-200 to-emerald-300 dark:from-emerald-500/10 dark:to-emerald-600/5 border border-emerald-400 dark:border-emerald-500/20 rounded-xl p-12 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto mb-6 bg-emerald-300 dark:bg-emerald-500/20 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="w-12 h-12 text-emerald-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-3xl font-bold mb-4 text-foreground">Ready to Explore?</h3>
              <p className="mb-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Simulate changes to participant weights and exclusions to see how they would affect settlements.
              </p>
              <p className="text-sm mb-8 max-w-xl mx-auto text-muted-foreground">
                This simulation preserves your original data and shows you potential outcomes before making changes.
              </p>
            </div>
          </div>
          
          <div className="flex justify-center mt-8">
            <Button 
              onClick={handleStartSimulation}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 dark:from-green-500 dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 text-white shadow-lg shadow-green-500/25 px-8 py-3 text-base transition-all duration-200 hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Simulation
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn('space-y-6', className)}
      variants={getMotionVariants('fadeInUp')}
      initial="initial"
      animate="animate"
      transition={getTransition('normal')}
    >
      {/* Simulation Controls */}
      <div className="bg-gradient-to-br from-orange-200 to-orange-300 dark:from-orange-500/10 dark:to-orange-600/5 border border-orange-400 dark:border-orange-500/20 rounded-xl p-6 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-300 dark:bg-orange-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-orange-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">Simulation Controls</h3>
              <p className="text-xs text-muted-foreground mt-1">Adjust participant weights and exclusions to see how settlements would change</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">
              State: <span className="text-green-600 dark:text-green-400 font-semibold">Active</span>
            </span>
            <Button 
              variant="outline" 
              onClick={handleReset}
              size="sm"
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 dark:from-gray-500 dark:to-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-700 text-white shadow-lg shadow-gray-500/25 transition-all duration-200 hover:scale-105"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </Button>
          </div>
        </div>
        
        {/* Participant Controls */}
        <div className="grid gap-4">
          {group.participants.map((participant, index) => {
            const adjustment = adjustments.get(participant.id) || { 
              participantId: participant.id,
              weightMultiplier: 1.0, 
              excluded: false 
            };

            // Generate a consistent color for each participant
            const getParticipantColor = (name) => {
              const colors = [
                'from-blue-500 to-blue-600',
                'from-green-500 to-green-600', 
                'from-purple-500 to-purple-600',
                'from-pink-500 to-pink-600',
                'from-indigo-500 to-indigo-600',
                'from-teal-500 to-teal-600',
                'from-orange-500 to-orange-600',
                'from-cyan-500 to-cyan-600'
              ];
              const hash = name.split('').reduce((a, b) => {
                a = ((a << 5) - a) + b.charCodeAt(0);
                return a & a;
              }, 0);
              return colors[Math.abs(hash) % colors.length];
            };

            const getInitials = (name) => {
              return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            };

            return (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`p-4 rounded-lg transition-all duration-200 ${
                  adjustment.excluded 
                    ? 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30'
                    : 'border'
                }`}
                style={!adjustment.excluded ? getCardBgStyle() : {}}
                variants={getMotionVariants('staggerItem')}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div 
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-xs shadow-lg ${adjustment.excluded ? 'opacity-50 grayscale' : ''}`}
                    style={{ background: appTheme.avatars.participant }}
                  >
                    {getInitials(participant.name)}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium truncate ${adjustment.excluded ? 'line-through text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                      {participant.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Default weight: {participant.defaultWeight || 1}
                    </p>
                  </div>
                  
                  {/* Controls */}
                  <div className="flex items-center gap-3">
                    {/* Weight Multiplier */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm whitespace-nowrap text-muted-foreground">
                        Weight:
                      </label>
                      <Input
                        type="number"
                        min="0.1"
                        max="5.0"
                        step="0.1"
                        value={adjustment.weightMultiplier}
                        onChange={(e) => handleWeightChange(participant.id, e.target.value)}
                        onBlur={() => handleWeightBlur(participant.id)}
                        className="w-20 text-center bg-white/50"
                        disabled={adjustment.excluded}
                        placeholder="1.0"
                      />
                    </div>
                    
                    {/* Exclusion Toggle */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExclusionToggle(participant.id)}
                      className="transition-all duration-200 shadow-sm"
                      style={{
                        backgroundColor: adjustment.excluded 
                          ? (isDarkMode ? 'rgba(127, 29, 29, 0.2)' : '#dc2626')
                          : (isDarkMode ? 'rgba(30, 58, 138, 0.2)' : '#111827'),
                        borderColor: adjustment.excluded 
                          ? (isDarkMode ? 'rgb(185, 28, 28)' : '#dc2626')
                          : (isDarkMode ? 'rgb(29, 78, 216)' : '#111827'),
                        color: adjustment.excluded 
                          ? (isDarkMode ? 'rgb(248, 113, 113)' : 'white')
                          : (isDarkMode ? 'rgb(96, 165, 250)' : 'white')
                      }}
                    >
                      {adjustment.excluded ? (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                          </svg>
                          Excluded
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Include
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Simulation Results */}
      <DiffView
        originalBalances={originalBalances}
        adjustedBalances={adjustedBalances}
        originalSettlements={originalSettlements}
        adjustedSettlements={adjustedSettlements}
        participants={group.participants}
        currency={group.currency}
        getCardBgStyle={getCardBgStyle}
      />
    </motion.div>
  );
}

/**
 * DiffView component shows before/after settlement comparisons
 */
function DiffView({ 
  originalBalances, 
  adjustedBalances, 
  originalSettlements, 
  adjustedSettlements,
  participants,
  currency,
  getCardBgStyle
}) {
  // Calculate changes
  const balanceChanges = useMemo(() => {
    const changes = [];
    
    originalBalances.forEach(original => {
      const adjusted = adjustedBalances.find(b => b.participantId === original.participantId);
      if (adjusted) {
        const change = adjusted.netBalance - original.netBalance;
        if (Math.abs(change) > 0.01) {
          changes.push({
            participantId: original.participantId,
            originalBalance: original.netBalance,
            adjustedBalance: adjusted.netBalance,
            change
          });
        }
      }
    });
    
    return changes;
  }, [originalBalances, adjustedBalances]);

  const hasSignificantChanges = balanceChanges.length > 0 || 
    originalSettlements.length !== adjustedSettlements.length;

  return (
    <motion.div
      className="space-y-6"
      variants={getMotionVariants('staggerContainer')}
      initial="initial"
      animate="animate"
    >
      {/* Summary */}
      <div className="bg-gradient-to-br from-blue-200 to-blue-300 dark:from-blue-500/10 dark:to-blue-600/5 border border-blue-400 dark:border-blue-500/20 rounded-xl p-6 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-300 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-blue-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium text-foreground">Simulation Results</h3>
            {hasSignificantChanges && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: appTheme.status.success.text }} />
                <span className="text-xs font-medium" style={{ color: appTheme.status.success.text }}>Changes Detected</span>
              </div>
            )}
          </div>
        </div>
        
        {!hasSignificantChanges ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 bg-blue-300 dark:bg-blue-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm mb-1 text-foreground">No significant changes detected</p>
            <p className="text-xs text-muted-foreground">Try adjusting participant weights or exclusions to see different outcomes</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg" style={getCardBgStyle()}>
                <p className="text-sm mb-1 text-muted-foreground">Original Transfers</p>
                <p className="text-2xl font-bold text-foreground">{originalSettlements.length}</p>
              </div>
              <div className="text-center p-4 rounded-lg" style={getCardBgStyle()}>
                <p className="text-sm mb-1 text-muted-foreground">Adjusted Transfers</p>
                <p className="text-2xl font-bold text-foreground">{adjustedSettlements.length}</p>
              </div>
            </div>
            
            {balanceChanges.length > 0 && (
              <div className="pt-4 border-t" style={{ borderColor: appTheme.common.border.accent }}>
                <h4 className="text-sm font-medium mb-4 flex items-center gap-2 text-foreground">
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Balance Changes
                </h4>
                <div className="space-y-3">
                  {balanceChanges.map(change => {
                    const participant = participants.find(p => p.id === change.participantId);
                    if (!participant) return null;

                    return (
                      <div 
                        key={change.participantId} 
                        className="flex justify-between items-center p-3 rounded-lg"
                        style={getCardBgStyle()}
                      >
                        <span className="font-medium text-foreground">{participant.name}</span>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-muted-foreground">
                            {formatCurrency(change.originalBalance, currency)}
                          </span>
                          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                          <span 
                            className="font-medium"
                            style={{
                              color: change.change > 0 ? appTheme.status.positive.text : appTheme.status.negative.text
                            }}
                          >
                            {formatCurrency(change.adjustedBalance, currency)}
                          </span>
                          <span 
                            className="text-xs px-2 py-1 rounded-full font-medium border"
                            style={change.change > 0 
                              ? {
                                  backgroundColor: appTheme.status.positive.background + '20',
                                  color: appTheme.status.positive.text,
                                  borderColor: appTheme.status.positive.background + '30'
                                }
                              : {
                                  backgroundColor: appTheme.status.negative.background + '20',
                                  color: appTheme.status.negative.text,
                                  borderColor: appTheme.status.negative.background + '30'
                                }
                            }
                          >
                            {change.change > 0 ? '+' : ''}{formatCurrency(change.change, currency)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Before/After Comparison */}
      {hasSignificantChanges && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original */}
          <div className="bg-gradient-to-br from-indigo-200 to-indigo-300 dark:from-indigo-500/10 dark:to-indigo-600/5 border border-indigo-400 dark:border-indigo-500/20 rounded-xl p-6 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-300 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-indigo-700"
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
              <h3 className="text-sm font-medium text-foreground">Original Settlements</h3>
            </div>
            {originalSettlements.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 bg-indigo-300 dark:bg-indigo-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-foreground">All settled up</p>
              </div>
            ) : (
              <div className="space-y-3">
                {originalSettlements.map((transfer, index) => {
                  const fromParticipant = participants.find(p => p.id === transfer.fromId);
                  const toParticipant = participants.find(p => p.id === transfer.toId);
                  
                  return (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={getCardBgStyle()}
                    >
                      <div className="text-sm">
                        <span className="font-medium text-foreground">{fromParticipant?.name}</span>
                        <span className="text-muted-foreground"> pays </span>
                        <span className="font-medium text-foreground">{toParticipant?.name}</span>
                      </div>
                      <span className="font-semibold text-foreground">
                        {formatCurrency(transfer.amount, currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Adjusted */}
          <div className="bg-gradient-to-br from-purple-200 to-purple-300 dark:from-purple-500/10 dark:to-purple-600/5 border border-purple-400 dark:border-purple-500/20 rounded-xl p-6 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-300 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-purple-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-foreground">Adjusted Settlements</h3>
            </div>
            {adjustedSettlements.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 bg-purple-300 dark:bg-purple-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-foreground">All settled up</p>
              </div>
            ) : (
              <div className="space-y-3">
                {adjustedSettlements.map((transfer, index) => {
                  const fromParticipant = participants.find(p => p.id === transfer.fromId);
                  const toParticipant = participants.find(p => p.id === transfer.toId);
                  
                  return (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={getCardBgStyle()}
                    >
                      <div className="text-sm">
                        <span className="font-medium text-foreground">{fromParticipant?.name}</span>
                        <span className="text-muted-foreground"> pays </span>
                        <span className="font-medium text-foreground">{toParticipant?.name}</span>
                      </div>
                      <span className="font-semibold text-foreground">
                        {formatCurrency(transfer.amount, currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}