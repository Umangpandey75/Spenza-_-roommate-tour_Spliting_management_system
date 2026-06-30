"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { LightDialog, LightDialogContent, LightDialogHeader, LightDialogTitle } from "../ui/light-dialog";

import { BalanceCards } from "../settlement/balance-cards";
import { TransferList } from "../settlement/transfer-list";
import { SettlementEditor } from "../settlement/settlement-editor";
import { SettlementHistory } from "../settlement/settlement-history";
import { ExportPanel } from "../shared/export-panel";
import { ShareDialog } from "../shared/share-dialog";
import { formatCurrency } from "../../lib/calc";
import {
  appTheme,
  getCardStyles,
  getTextStyles,
  getButtonStyles,
  getIconContainerStyles,
  getContentCardStyles,
} from "../../lib/colors/app-theme";

export function Settle({
  group,
  balances,
  settlements,
  hasDebts,
  onUpdateGroup,
  storageManager,
}) {
  const [customSettlements, setCustomSettlements] = useState(null);
  const [displaySettlements, setDisplaySettlements] = useState(settlements);
  const [showEditor, setShowEditor] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Track generated expenses to allow undoing
  const [generatedExpenses, setGeneratedExpenses] = useState({});

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
    backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.8)' : 'rgba(255, 255, 255, 0.6)',
    ...(isDarkMode && { border: '1px solid rgba(75, 85, 99, 0.5)' })
  });

  // Sync custom settlements to display
  useEffect(() => {
    if (customSettlements) {
      setDisplaySettlements(customSettlements);
    }
  }, [customSettlements]);

  // Use custom settlements if they exist, otherwise use the stable display ones
  const activeSettlements = displaySettlements;

  const handleSaveSettlements = (editedTransfers) => {
    setCustomSettlements(editedTransfers);
    setDisplaySettlements(editedTransfers);
    setShowEditor(false);

    // Optionally save to group data
    if (onUpdateGroup) {
      const updatedGroup = {
        ...group,
        customSettlements: editedTransfers,
      };
      onUpdateGroup(updatedGroup);
    }
  };

  const hasGeneratedExpenses = Object.keys(generatedExpenses).length > 0;
  
  if (!hasDebts && !customSettlements?.length && !hasGeneratedExpenses) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-8"
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-3xl font-bold mb-4 text-foreground">
                All Settled Up! 🎉
              </h3>
              <p className="mb-8 max-w-md mx-auto text-lg text-muted-foreground">
                Everyone has paid their fair share. No transfers needed at this
                time.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setShowEditor(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white shadow-lg shadow-blue-500/25"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Custom Settlement
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowShareDialog(true)}
              className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
              Share Group
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Map settlements for transfer display
  const mappedTransfers = activeSettlements.map((settlement) => ({
    from: settlement.fromId,
    to: settlement.toId,
    amount: settlement.amount,
  }));

  const totalToTransfer = activeSettlements.reduce(
    (sum, s) => sum + s.amount,
    0
  );
  const peopleInvolved = new Set([
    ...activeSettlements.map((s) => s.fromId),
    ...activeSettlements.map((s) => s.toId),
  ]).size;

  return (
    <div className="space-y-8">
      {/* Settlement Summary */}
      <div className="bg-gradient-to-br from-emerald-200 to-emerald-300 dark:from-emerald-500/10 dark:to-emerald-600/5 border border-emerald-400 dark:border-emerald-500/20 rounded-xl p-6 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 bg-emerald-300 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-emerald-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-medium text-foreground">
                Settlements Required
              </h3>
              {customSettlements && (
                <span
                  className="text-xs px-3 py-1 rounded-full border"
                  style={{
                    ...getContentCardStyles("light"),
                    ...getTextStyles("settlementSummary"),
                  }}
                >
                  Custom Settlement
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeSettlements.length} payment
              {activeSettlements.length !== 1 ? "s" : ""} needed to settle all
              balances
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(totalToTransfer, group.currency)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Total to Transfer
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {activeSettlements.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Transactions
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {peopleInvolved}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              People Involved
            </p>
          </div>
        </div>
      </div>

      {/* Settlement Actions */}
      <div className="bg-gradient-to-br from-orange-200 to-orange-300 dark:from-orange-500/10 dark:to-orange-600/5 border border-orange-400 dark:border-orange-500/20 rounded-xl p-6 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
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
            <h3 className="text-sm font-medium text-foreground">
              Settlement Tools
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditor(!showEditor)}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              {showEditor ? "Hide Editor" : "Edit Settlement"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportPanel(true)}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShareDialog(true)}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
              Share
            </Button>
            {customSettlements && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCustomSettlements(null);
                  setDisplaySettlements(settlements);
                  setShowEditor(false);
                }}
                className="border-red-400/40 text-red-600 hover:text-red-700"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reset to Calculated
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Settlement Editor */}
      {showEditor && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{
            height: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
            opacity: { duration: 0.2, delay: 0.1 },
          }}
          style={{ overflow: "hidden" }}
          className="mb-8"
        >
          <div className="bg-gradient-to-br from-indigo-200 to-indigo-300 dark:from-indigo-500/10 dark:to-indigo-600/5 border border-indigo-400 dark:border-indigo-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-foreground">
                Settlement Editor
              </h3>
            </div>
            <SettlementEditor
              transfers={activeSettlements}
              participants={group.participants}
              currency={group.currency}
              onSaveSettlements={handleSaveSettlements}
            />
          </div>
        </motion.div>
      )}

      {/* Balance Cards */}
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
                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-1m-3 1l-3-1"
              />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-foreground">
            Current Balances
          </h3>
        </div>
        <BalanceCards
          balances={balances}
          participants={group.participants}
          currency={group.currency}
        />
      </div>

      {/* Payment Instructions */}
      <div className="bg-gradient-to-br from-purple-200 to-purple-300 dark:from-purple-500/10 dark:to-purple-600/5 border border-purple-400 dark:border-purple-500/20 rounded-xl p-6 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
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
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-foreground">
            Payment Instructions
          </h3>
        </div>

        {mappedTransfers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-300 dark:bg-purple-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-purple-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h4 className="text-xl font-bold mb-2 text-foreground">
              All Settled Up! 🎉
            </h4>
            <p className="text-muted-foreground">
              No payments needed - everyone's balances are even.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="rounded-lg p-4" style={getCardBgStyle()}>
              <p className="text-sm mb-2 text-foreground">
                <span className="font-semibold">{mappedTransfers.length}</span>{" "}
                payment{mappedTransfers.length !== 1 ? "s" : ""} needed to
                settle all balances
              </p>
              <p className="text-xs text-muted-foreground">
                Total amount:{" "}
                <span className="font-semibold">
                  {formatCurrency(
                    mappedTransfers.reduce((sum, t) => sum + t.amount, 0),
                    group.currency
                  )}
                </span>
              </p>
            </div>

            {/* Payment Instructions */}
            <div className="space-y-3">
              {mappedTransfers.map((transfer, index) => {
                const fromParticipant = group.participants.find(
                  (p) => p.id === transfer.from
                );
                const toParticipant = group.participants.find(
                  (p) => p.id === transfer.to
                );

                if (!fromParticipant || !toParticipant) return null;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="relative"
                  >
                    {/* Step number */}
                    <div
                      className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-6 h-6 text-white rounded-full flex items-center justify-center text-xs font-bold z-10"
                      style={{
                        backgroundColor: appTheme.common.primaryText,
                      }}
                    >
                      {index + 1}
                    </div>

                    <div className="ml-6 p-4 rounded-xl hover:shadow-md transition-all duration-200" style={getCardBgStyle()}>
                      <div className="flex items-center justify-between">
                        {/* Payment instruction */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                              style={{ background: appTheme.avatars.payer }}
                            >
                              {fromParticipant.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xl text-foreground">
                                {formatCurrency(
                                  transfer.amount,
                                  group.currency
                                )}
                              </span>
                              <span className="text-muted-foreground">
                                transfer from
                              </span>
                              <span className="font-semibold text-foreground">
                                {fromParticipant.name}
                              </span>
                              <span className="text-muted-foreground">
                                →
                              </span>
                              <span className="font-semibold text-foreground">
                                {toParticipant.name}
                              </span>
                            </div>
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                              style={{
                                background: appTheme.avatars.receiver,
                              }}
                            >
                              {toParticipant.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </div>
                          </div>
                        </div>

                        {/* Arrow indicator */}
                        <motion.div
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{
                            duration: 0.3,
                            delay: index * 0.1 + 0.2,
                          }}
                          className="ml-4"
                        >
                          <svg
                            className="w-6 h-6 text-muted-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                          </svg>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Settlement History */}
      <SettlementHistory
        settlements={activeSettlements}
        participants={group.participants}
        currency={group.currency}
        onMarkCompleted={async (index, transfer) => {
          console.log("Transfer marked as completed:", transfer);
          if (!storageManager) return;
          
          try {
            const expenseId = `settlement_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
            
            // Check if transfer object has from/to or fromId/toId
            const fromId = transfer.fromId || transfer.from;
            const toId = transfer.toId || transfer.to;
            
            const expense = {
              id: expenseId,
              groupId: group.id,
              description: `Settlement Payment`,
              amount: transfer.amount,
              payerId: fromId, 
              currency: group.currency,
              date: new Date(),
              category: 'Other',
              split: [{
                participantId: toId,
                weight: 1,
                included: true
              }]
            };

            await storageManager.addExpense(group.id, expense);
            setGeneratedExpenses(prev => ({ ...prev, [index]: expenseId }));
            
            // Fetch updated group to recalculate balances immediately
            const updatedGroup = await storageManager.getGroup(group.id);
            if (onUpdateGroup) {
              onUpdateGroup(updatedGroup);
            }
          } catch (error) {
            console.error("Failed to save settlement expense:", error);
            if (error.errors) {
              alert("Zod Validation Error: " + JSON.stringify(error.errors, null, 2));
            } else {
              alert("Error: " + error.message);
            }
          }
        }}
        onUndoCompletion={async (index, transfer) => {
          console.log("Transfer completion undone:", transfer);
          if (!storageManager) return;
          
          try {
            const expenseId = generatedExpenses[index];
            if (expenseId) {
              await storageManager.removeExpense(group.id, expenseId);
              setGeneratedExpenses(prev => {
                const newExpenses = { ...prev };
                delete newExpenses[index];
                return newExpenses;
              });
              
              // Fetch updated group to recalculate balances immediately
              const updatedGroup = await storageManager.getGroup(group.id);
              if (onUpdateGroup) {
                onUpdateGroup(updatedGroup);
              }
            }
          } catch (error) {
            console.error("Failed to undo settlement expense:", error);
          }
        }}
      />

      {/* Export Panel Dialog */}
      {showExportPanel && (
        <LightDialog open={showExportPanel} onOpenChange={setShowExportPanel}>
          <LightDialogContent className="max-w-md">
            <LightDialogHeader>
              <LightDialogTitle>Export Group Data</LightDialogTitle>
            </LightDialogHeader>
            <ExportPanel
              group={group}
              onClose={() => setShowExportPanel(false)}
            />
          </LightDialogContent>
        </LightDialog>
      )}

      {/* Share Dialog */}
      <ShareDialog
        group={group}
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
      />
    </div>
  );
}
