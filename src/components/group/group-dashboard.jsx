"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent } from "../ui/tabs";
import { TabsBar } from "./tabs-bar";
import { Overview } from "./overview";
import { Expenses } from "./expenses";
import { Participants, ParticipantForm } from "./participants";
import { Settle } from "./settle";
import { WhatIf } from "./what-if";
import { Settings } from "./settings";
import { Button } from "../ui/button";
import { Container } from "../ui/container";
import { formatCurrency } from "../../lib/calc";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { DeleteExpenseDialog } from "../ui/confirmation-dialog";
import { useGroupDashboard } from "./hooks/use-group-dashboard";
import { usePerformanceMonitor } from "../../hooks/use-performance-monitor";

export const GroupDashboard = React.memo(function GroupDashboard({
  group,
  onUpdateGroup,
  onBack,
  defaultTab = "overview",
}) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkTheme();

    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const handleBackClick = async () => {
    setIsNavigating(true);
    // Add a minimal delay to show the loading state, then navigate
    setTimeout(() => {
      onBack();
    }, 50);
  };
  // ===== CUSTOM HOOK =====
  const {
    activeTab,
    addDialogOpen,
    deleteExpenseDialog,
    groupData,
    storageManager,
    handleTabChange,
    handleDeleteExpense,
    confirmDeleteExpense,
    handleSubmitExpense,
    handleAddParticipant,
    setActiveTab,
    setAddDialogOpen,
    setDeleteExpenseDialog,
  } = useGroupDashboard(group, onUpdateGroup, defaultTab);

  // Performance monitoring in development (after activeTab is defined)
  usePerformanceMonitor('GroupDashboard', [group, activeTab]);

  // ===== EARLY RETURNS =====
  if (!group) {
    return (
      <Container className="py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">
            Group not found
          </h2>
          <Button onClick={onBack} className="mt-4">
            Back to Groups
          </Button>
        </div>
      </Container>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
      <Container
        className="py-4 sm:py-6"
        style={{
          scrollbarGutter: "stable",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackClick}
              disabled={isNavigating}
              className="flex-shrink-0 p-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-600/5 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/20 shadow-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Back to groups"
            >
              {isNavigating ? (
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              )}
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                {group.name}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {group.participants.length} participant
                {group.participants.length !== 1 ? "s" : ""} •{" "}
                <span className="whitespace-nowrap">
                  {formatCurrency(groupData.totalSpent, group.currency)} total
                </span>
              </p>
            </div>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
          key={activeTab}
          style={{ scrollbarGutter: "stable" }}
        >
          <TabsBar />

          <TabsContent
            value="overview"
            className="mt-6"
            style={{ scrollbarGutter: "stable" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Overview
                group={group}
                balances={groupData.balances}
                settlements={groupData.settlements}
                totalSpent={groupData.totalSpent}
                hasDebts={groupData.hasDebts}
                onAddExpense={() => setActiveTab("expenses")}
                onAddParticipant={() => setAddDialogOpen(true)}
                onViewSettlements={() => {
                  console.log(
                    "View Settlements clicked, switching to settle tab"
                  );
                  setActiveTab("settle");
                }}
              />
            </motion.div>
          </TabsContent>

          <TabsContent
            value="expenses"
            className="mt-6"
            style={{ scrollbarGutter: "stable" }}
          >
            <Expenses
              group={group}
              onAddExpense={handleSubmitExpense}
              onEditExpense={handleSubmitExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          </TabsContent>

          <TabsContent
            value="participants"
            className="mt-6"
            style={{ scrollbarGutter: "stable" }}
          >
            <Participants
              group={group}
              onAddParticipant={() => setAddDialogOpen(true)}
              storageManager={storageManager}
              onUpdateGroup={onUpdateGroup}
            />
          </TabsContent>

          <TabsContent
            value="settle"
            className="mt-6"
            style={{ scrollbarGutter: "stable" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Settle
                group={group}
                balances={groupData.balances}
                settlements={groupData.settlements}
                hasDebts={groupData.hasDebts}
                onUpdateGroup={onUpdateGroup}
                storageManager={storageManager}
              />
            </motion.div>
          </TabsContent>

          <TabsContent
            value="what-if"
            className="mt-6"
            style={{ scrollbarGutter: "stable" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <WhatIf
                group={group}
                originalBalances={groupData.balances}
                originalSettlements={groupData.settlements}
              />
            </motion.div>
          </TabsContent>

          <TabsContent
            value="settings"
            className="mt-6"
            style={{ scrollbarGutter: "stable" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Settings
                group={group}
                onUpdateGroup={onUpdateGroup}
                onBack={onBack}
              />
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* ===== GLOBAL MODALS ===== */}

        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent 
            className="sm:max-w-md border-2 shadow-xl"
            style={{
              backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.8)',
              color: isDarkMode ? 'rgb(243, 244, 246)' : 'rgb(17, 24, 39)',
            }}
          >
            <DialogHeader>
              <DialogTitle 
                className="text-lg font-semibold"
                style={{ color: isDarkMode ? 'rgb(243, 244, 246)' : 'rgb(17, 24, 39)' }}
              >
                Add New Participant
              </DialogTitle>
            </DialogHeader>
            <ParticipantForm
              onSubmit={handleAddParticipant}
              onCancel={() => setAddDialogOpen(false)}
              showWeights={true}
            />
          </DialogContent>
        </Dialog>

        <DeleteExpenseDialog
          open={deleteExpenseDialog.open}
          onOpenChange={(open) =>
            setDeleteExpenseDialog({ open, expense: null })
          }
          onConfirm={confirmDeleteExpense}
          expenseDescription={deleteExpenseDialog.expense?.description || ""}
        />
      </Container>
    </div>
  );
});
