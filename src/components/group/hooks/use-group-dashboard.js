import { useState, useMemo, useCallback, useEffect } from 'react';
import { StorageManager } from '../../../lib/storage/storage-manager';
import { computeNet, computeMinimalSettlements } from '../../../lib/calc';
import { useToast } from '../../../hooks/use-toast';
import { useMemoizedCalculations, useMemoizedGroupData } from '../../../hooks/use-memoized-calculations';

export function useGroupDashboard(group, onUpdateGroup, defaultTab = 'overview') {
  const { toast } = useToast();
  const storageManager = useMemo(() => new StorageManager(), []);
  
  // ===== STATE =====
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteExpenseDialog, setDeleteExpenseDialog] = useState({
    open: false,
    expense: null,
  });

  // ===== COMPUTED DATA WITH MEMOIZATION =====
  const { expenses, participants } = useMemoizedGroupData(group);
  const { balances, settlements, statistics } = useMemoizedCalculations(expenses, participants);
  
  const groupData = useMemo(() => ({
    balances,
    settlements,
    totalSpent: statistics.totalSpent,
    hasDebts: statistics.hasDebts,
  }), [balances, settlements, statistics]);

  // ===== UTILITY FUNCTIONS =====
  const fixExpensesPayerId = useCallback(() => {
    if (!group.expenses || group.expenses.length === 0) return;

    let hasInvalidExpenses = false;
    const fixedExpenses = group.expenses.map((expense) => {
      const payerExists = group.participants.find(
        (p) => p.id === expense.payerId
      );
      if (!payerExists && group.participants.length > 0) {
        console.log(
          `Fixing expense ${expense.id} with invalid payerId: ${expense.payerId}`
        );
        hasInvalidExpenses = true;
        return {
          ...expense,
          payerId: group.participants[0].id,
        };
      }
      return expense;
    });

    if (hasInvalidExpenses) {
      console.log("Fixed expenses with invalid payerId");
      onUpdateGroup({ ...group, expenses: fixedExpenses });
      toast({
        title: "Expenses Fixed ✅",
        description: "Invalid payer information has been corrected.",
        variant: "default",
      });
    }
  }, [group, onUpdateGroup, toast]);

  // Auto-fix expenses with invalid payerId on mount
  useEffect(() => {
    fixExpensesPayerId();
  }, [fixExpensesPayerId]);

  // ===== EVENT HANDLERS =====
  const handleTabChange = (value) => {
    console.log("Tab changed to:", value);
    setActiveTab(value);
  };



  const handleDeleteExpense = (expense) => {
    setDeleteExpenseDialog({ open: true, expense });
  };

  const confirmDeleteExpense = async () => {
    const expense = deleteExpenseDialog.expense;
    if (!expense) return;

    try {
      await storageManager.removeExpense(group.id, expense.id);
      const updatedGroup = {
        ...group,
        expenses: group.expenses.filter((e) => e.id !== expense.id),
      };
      onUpdateGroup(updatedGroup);

      // Set flag to refresh homepage data
      localStorage.setItem('spenza_needs_refresh', 'true');
      console.log('🗑️ Expense deleted, flagged for homepage refresh');

      toast({
        title: "Expense Deleted ✅",
        description: `"${expense.description}" has been removed.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to delete expense:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive",
      });
    }

    setDeleteExpenseDialog({ open: false, expense: null });
  };

  const handleSubmitExpense = (data) => {
    let updatedExpenses;
    if (data.id) {
      // Editing existing expense
      updatedExpenses = group.expenses.map((e) =>
        e.id === data.id ? data : e
      );
    } else {
      // Adding new expense
      const newExpense = {
        ...data,
        id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        groupId: group.id,
      };
      updatedExpenses = [...group.expenses, newExpense];
    }
    onUpdateGroup({ ...group, expenses: updatedExpenses });
    
    // Set flag to refresh homepage data
    localStorage.setItem('spenza_needs_refresh', 'true');
    console.log('💾 Expense updated, flagged for homepage refresh');
  };

  const handleAddParticipant = async (participantData) => {
    await storageManager.addParticipant(group.id, participantData);
    const updatedGroup = await storageManager.getGroup(group.id);
    onUpdateGroup(updatedGroup);
    setAddDialogOpen(false);
    
    // Set flag to refresh homepage data
    localStorage.setItem('spenza_needs_refresh', 'true');
    console.log('👥 Participant added, flagged for homepage refresh');
  };

  return {
    // State
    activeTab,
    addDialogOpen,
    deleteExpenseDialog,
    
    // Computed data
    groupData,
    storageManager,
    
    // Handlers
    handleTabChange,
    handleDeleteExpense,
    confirmDeleteExpense,
    handleSubmitExpense,
    handleAddParticipant,
    
    // State setters
    setActiveTab,
    setAddDialogOpen,
    setDeleteExpenseDialog,
  };
}