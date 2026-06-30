'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { formatCurrency } from '../../lib/calc';
import { cn } from '../../lib/utils/cn';
import { getMotionVariants, getTransition } from '../../lib/utils/motion';
import { ArrowRight, Copy, Check, Edit3 } from 'lucide-react';
import { useState } from 'react';

/**
 * TransferList component shows minimal settlement transfers
 * Displays the optimal set of transfers needed to settle all debts
 */
export function TransferList({ 
  transfers = [], 
  participants = [], 
  currency = 'USD',
  onTransferComplete,
  onEditTransfer,
  className 
}) {
  const [copiedTransfer, setCopiedTransfer] = useState(null);

  if (!transfers.length) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            All Settled Up!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No transfers needed - everyone's balances are settled.
          </p>
        </div>
      </Card>
    );
  }

  const handleCopyTransfer = async (transfer) => {
    const fromParticipant = participants.find(p => p.id === transfer.fromId);
    const toParticipant = participants.find(p => p.id === transfer.toId);
    
    if (!fromParticipant || !toParticipant) return;

    const transferText = `${fromParticipant.name} pays ${toParticipant.name} ${formatCurrency(transfer.amount, currency)}`;
    
    try {
      await navigator.clipboard.writeText(transferText);
      setCopiedTransfer(transfer.fromId + transfer.toId);
      setTimeout(() => setCopiedTransfer(null), 2000);
    } catch (err) {
      console.error('Failed to copy transfer:', err);
    }
  };

  const handleMarkComplete = (transfer) => {
    if (onTransferComplete) {
      onTransferComplete(transfer);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Settlement Transfers
        </h3>
        <div className="text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
          {transfers.length} transfer{transfers.length !== 1 ? 's' : ''} needed
        </div>
      </div>
      
      <motion.div 
        className="space-y-3"
        variants={getMotionVariants('staggerContainer')}
        initial="initial"
        animate="animate"
      >
        {transfers.map((transfer, index) => {
          const fromParticipant = participants.find(p => p.id === transfer.fromId);
          const toParticipant = participants.find(p => p.id === transfer.toId);
          
          if (!fromParticipant || !toParticipant) return null;

          const transferKey = transfer.fromId + transfer.toId;
          const isCopied = copiedTransfer === transferKey;

          return (
            <motion.div
              key={transferKey}
              variants={getMotionVariants('staggerItem')}
              transition={getTransition('normal')}
              whileHover={{ scale: 1.01 }}
            >
              <Card className="relative overflow-hidden border-l-4 border-l-blue-500">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Transfer details */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-1">
                      {/* From participant */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                            {fromParticipant.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                          {fromParticipant.name}
                        </span>
                      </div>
                      
                      {/* Arrow and amount - mobile layout */}
                      <div className="flex items-center justify-center gap-2 sm:gap-2">
                        <ArrowRight className="w-4 h-4 text-gray-500 dark:text-gray-400 hidden sm:block" />
                        <div className="text-center">
                          <p className="font-bold text-lg text-blue-600 dark:text-blue-400">
                            {formatCurrency(transfer.amount, currency)}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">pays</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-500 dark:text-gray-400 hidden sm:block" />
                      </div>
                      
                      {/* To participant */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                            {toParticipant.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                          {toParticipant.name}
                        </span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 justify-end sm:justify-start">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyTransfer(transfer)}
                        className="flex items-center gap-1 flex-1 sm:flex-none"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span className="hidden sm:inline">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="hidden sm:inline">Copy</span>
                          </>
                        )}
                      </Button>
                      
                      {onTransferComplete && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleMarkComplete(transfer)}
                          className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none"
                        >
                          <Check className="w-3 h-3 sm:mr-1" />
                          <span className="hidden sm:inline">Mark Paid</span>
                          <span className="sm:hidden">Paid</span>
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Transfer number */}
                  <div className="absolute top-2 right-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      #{index + 1}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
      
      {/* Summary */}
      <motion.div 
        className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800"
        variants={getMotionVariants('fadeInUp')}
        initial="initial"
        animate="animate"
        transition={getTransition('slow')}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">
              Settlement Summary
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {transfers.length} optimal transfer{transfers.length !== 1 ? 's' : ''} to settle all debts
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm text-blue-700 dark:text-blue-300">Total Amount</p>
            <p className="font-bold text-lg text-blue-900 dark:text-blue-100">
              {formatCurrency(
                transfers.reduce((sum, t) => sum + t.amount, 0), 
                currency
              )}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}