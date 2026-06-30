"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { formatCurrency } from "../../lib/calc";
import { getCategoryIcon } from "../../lib/utils/category-icons";
import { EXPENSE_CATEGORIES } from "../../lib/utils/constants";
import { Drawer, Box, Typography, IconButton, Divider, Snackbar, Alert } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

const getLocalDateString = (date = new Date()) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return getLocalDateString(new Date());
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function Expenses({
  group,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: getLocalDateString(),
    category: "Others",
    payerId: group.participants.length > 0 ? group.participants[0].id : "",
    split: group.participants.map((p) => ({
      participantId: p.id,
      weight: p.defaultWeight || 1,
      included: true,
    })),
  });
  const [errors, setErrors] = useState({});
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
    backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.8)' : 'rgba(255, 255, 255, 0.6)',
    ...(isDarkMode && { border: '1px solid rgba(75, 85, 99, 0.5)' })
  });

  const getIconBgStyle = () => ({
    backgroundColor: isDarkMode ? 'rgba(75, 85, 99, 0.8)' : 'rgba(255, 255, 255, 0.8)'
  });

  const openAddExpenseDrawer = () => {
    // Check if there are participants before opening the drawer
    if (group.participants.length === 0) {
      setSnackbarOpen(true);
      return;
    }

    setEditingExpense(null);
    setFormData({
      description: "",
      amount: "",
      date: getLocalDateString(),
      category: "Others",
      payerId: group.participants.length > 0 ? group.participants[0].id : "no-participants",
      split: group.participants.map((p) => ({
        participantId: p.id,
        weight: p.defaultWeight || 1,
        included: true,
      })),
    });
    setErrors({});
    setDrawerOpen(true);
  };

  const openEditExpenseDrawer = (expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description || "",
      amount: expense.amount?.toString() || "",
      date: expense.date
        ? getLocalDateString(expense.date)
        : getLocalDateString(),
      category: expense.category || "Others",
      payerId:
        expense.payerId ||
        (group.participants.length > 0 ? group.participants[0].id : "no-participants"),
      split:
        expense.split ||
        group.participants.map((p) => ({
          participantId: p.id,
          weight: p.defaultWeight || 1,
          included: true,
        })),
    });
    setErrors({});
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingExpense(null);
    setErrors({});
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      newErrors.amount = "Amount must be a positive number";
    }

    if (!formData.payerId || formData.payerId === "no-participants") {
      newErrors.payerId = "Payer is required";
    }

    const includedSplits = formData.split.filter((split) => split.included);
    if (includedSplits.length === 0) {
      newErrors.split = "At least one participant must be included";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const expenseData = {
      ...formData,
      groupId: group.id,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date),
      currency: group.currency,
    };

    if (editingExpense) {
      onEditExpense({ ...expenseData, id: editingExpense.id });
    } else {
      onAddExpense(expenseData);
    }
    closeDrawer();
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSplitChange = useCallback((participantId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      split: prev.split.map((split) =>
        split.participantId === participantId
          ? { ...split, [field]: value }
          : split
      ),
    }));
  }, []);

  // Memoized calculations
  const totalWeight = useMemo(() => {
    return formData.split
      .filter((split) => split.included)
      .reduce((sum, split) => sum + split.weight, 0);
  }, [formData.split]);

  const splitPreview = useMemo(() => {
    const amount = parseFloat(formData.amount) || 0;
    if (amount <= 0 || totalWeight <= 0) return {};

    const preview = {};
    formData.split.forEach((split) => {
      if (split.included) {
        preview[split.participantId] = (
          (amount * split.weight) /
          totalWeight
        ).toFixed(2);
      }
    });
    return preview;
  }, [formData.amount, formData.split, totalWeight]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Expenses</h2>
          <div className="flex items-center gap-4 text-sm text-foreground-400">
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              {group.expenses.length} expense
              {group.expenses.length !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
              {formatCurrency(
                group.expenses.reduce((sum, exp) => sum + exp.amount, 0),
                group.currency
              )}{" "}
              total
            </span>
          </div>
        </div>
        <Button
          onClick={openAddExpenseDrawer}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white shadow-lg shadow-blue-500/25 w-full sm:w-auto flex items-center gap-2 transition-all duration-200 hover:scale-105"
        >
          <svg
            className="w-4 h-4"
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
          Add Expense
        </Button>
      </div>

      {group.expenses.length === 0 ? (
        <div className="bg-gradient-to-br from-emerald-200 to-emerald-300 dark:from-emerald-500/10 dark:to-emerald-600/5 border border-emerald-400 dark:border-emerald-500/20 rounded-xl p-12 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-300 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-8 h-8 text-emerald-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              No expenses yet
            </h3>
            <p className="mb-8 max-w-md mx-auto text-muted-foreground">
              {group.participants.length === 0 
                ? "Add participants to your group first, then start tracking expenses."
                : "Start tracking your group spending by adding your first expense. Split bills, track payments, and settle up easily."
              }
            </p>
          </div>
          <Button
            onClick={openAddExpenseDrawer}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white shadow-lg shadow-blue-500/25 px-8 py-3 text-base transition-all duration-200 hover:scale-105"
          >
            <svg
              className="w-5 h-5 mr-2"
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
            Add First Expense
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {group.expenses.map((expense, index) => {
            const categoryColors = {
              Grocery: "bg-gradient-to-br from-emerald-200 to-emerald-300 dark:from-emerald-500/10 dark:to-emerald-600/5 border border-emerald-400 dark:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30",
              Transport: "bg-gradient-to-br from-blue-200 to-blue-300 dark:from-blue-500/10 dark:to-blue-600/5 border border-blue-400 dark:border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30",
              Rent: "bg-gradient-to-br from-purple-200 to-purple-300 dark:from-purple-500/10 dark:to-purple-600/5 border border-purple-400 dark:border-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30",
              "Household Essentials": "bg-gradient-to-br from-teal-200 to-teal-300 dark:from-teal-500/10 dark:to-teal-600/5 border border-teal-400 dark:border-teal-500/20 hover:shadow-lg hover:shadow-teal-500/30",
              "LPG/Gas": "bg-gradient-to-br from-orange-200 to-orange-300 dark:from-orange-500/10 dark:to-orange-600/5 border border-orange-400 dark:border-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30",
              Electricity: "bg-gradient-to-br from-yellow-200 to-yellow-300 dark:from-yellow-500/10 dark:to-yellow-600/5 border border-yellow-400 dark:border-yellow-500/20 hover:shadow-lg hover:shadow-yellow-500/30",
              Others: "bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-500/10 dark:to-slate-600/5 border border-slate-400 dark:border-slate-500/20 hover:shadow-lg hover:shadow-slate-500/30",
            };

            return (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`group relative overflow-hidden ${
                  categoryColors[expense.category] || categoryColors["Others"]
                } rounded-xl p-4 sm:p-6 transition-all duration-300 hover:scale-[1.02]`}
              >
                <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Left Section - Expense Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-3">
                      <div 
                        className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                        style={getIconBgStyle()}
                      >
                        {getCategoryIcon(expense.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate mb-1 text-foreground">
                          {expense.description}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <span 
                            className="px-3 py-1 text-xs rounded-full font-semibold text-muted-foreground"
                            style={getCardBgStyle()}
                          >
                            {expense.category || "General"}
                          </span>
                          <span className="text-sm font-medium text-muted-foreground">
                            {new Date(expense.date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year:
                                  new Date(expense.date).getFullYear() !==
                                  new Date().getFullYear()
                                    ? "numeric"
                                    : undefined,
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>
                        Paid by{" "}
                        <span className="font-bold text-foreground">
                          {group.participants.find(
                            (p) => p.id === expense.payerId
                          )?.name || "Unknown"}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Right Section - Amount and Actions */}
                  <div className="flex flex-col sm:items-end gap-3">
                    <div className="text-right">
                      <div className="text-2xl font-bold mb-1 text-foreground">
                        {formatCurrency(expense.amount, group.currency)}
                      </div>
                      <div className="text-sm font-medium text-muted-foreground">
                        {formatCurrency(
                          expense.amount /
                            group.participants.filter(
                              (p) =>
                                expense.split?.find(
                                  (s) => s.participantId === p.id
                                )?.included !== false
                            ).length || group.participants.length,
                          group.currency
                        )}{" "}
                        per person
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditExpenseDrawer(expense)}
                        className="flex-1 sm:flex-none"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
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
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteExpense(expense)}
                        className="border-red-400/40 text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* MUI Right Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={closeDrawer}
        sx={{ zIndex: 1400 }}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: "440px", lg: "495px" },
            background: isDarkMode 
              ? "linear-gradient(135deg, rgb(31, 41, 55), rgb(17, 24, 39))"
              : "linear-gradient(135deg, rgb(226, 232, 240), rgb(203, 213, 225))",
            color: isDarkMode ? "rgb(243, 244, 246)" : "rgb(15, 23, 42)",
            backdropFilter: "blur(4px)",
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: isDarkMode 
                ? "1px solid rgba(75, 85, 99, 0.5)" 
                : "1px solid rgba(148, 163, 184, 0.3)",
              background: isDarkMode 
                ? "rgba(17, 24, 39, 0.8)" 
                : "rgba(248, 250, 252, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              variant="h6"
              component="h2"
              sx={{ 
                fontWeight: "bold", 
                color: isDarkMode ? "rgb(243, 244, 246)" : "rgb(15, 23, 42)" 
              }}
            >
              {editingExpense ? "✏️ Edit Expense" : "➕ Add New Expense"}
            </Typography>
            <IconButton
              onClick={closeDrawer}
              sx={{
                color: isDarkMode ? "rgb(243, 244, 246)" : "rgb(15, 23, 42)",
                "&:hover": { 
                  backgroundColor: isDarkMode 
                    ? "rgba(75, 85, 99, 0.2)" 
                    : "rgba(148, 163, 184, 0.1)" 
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Basic Info Section */}
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="expense-description"
                      className="block text-sm font-semibold text-foreground mb-2"
                    >
                      Description *
                    </label>
                    <Input
                      id="expense-description"
                      type="text"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="What was this expense for?"
                      className={`h-10 text-sm ${
                        errors.description
                          ? "border-red-500"
                          : "border-border"
                      } bg-background text-foreground rounded-lg px-3`}
                      autoFocus
                    />
                    {errors.description && (
                      <p className="text-sm text-red-300 mt-2 flex items-center gap-1">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="expense-amount"
                        className="block text-sm font-semibold text-foreground mb-2"
                      >
                        Amount ({group.currency}) *
                      </label>
                      <Input
                        id="expense-amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount}
                        onChange={(e) =>
                          handleInputChange("amount", e.target.value)
                        }
                        placeholder="0.00"
                        className={`h-10 text-sm ${
                          errors.amount ? "border-red-500" : "border-border"
                        } bg-background text-foreground rounded-lg px-3`}
                      />
                      {errors.amount && (
                        <p className="text-sm text-red-300 mt-2 flex items-center gap-1">
                          {errors.amount}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="expense-date"
                        className="block text-sm font-semibold text-foreground mb-2"
                      >
                        Date *
                      </label>
                      <Input
                        id="expense-date"
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          handleInputChange("date", e.target.value)
                        }
                        className="h-10 text-sm border-border bg-background text-foreground rounded-lg px-3"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="expense-category"
                        className="block text-sm font-semibold text-foreground mb-2"
                      >
                        Category
                      </label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          handleInputChange("category", value)
                        }
                      >
                        <SelectTrigger className="h-10 text-sm border-border bg-background text-foreground rounded-lg">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent
                          className="z-[9999] max-h-48 overflow-y-auto"
                          position="popper"
                          sideOffset={5}
                          style={{
                            backgroundColor: isDarkMode ? 'rgb(31 41 55)' : 'rgb(248 250 252)',
                            borderColor: isDarkMode ? 'rgb(75 85 99)' : 'rgb(148 163 184)',
                            color: isDarkMode ? 'rgb(243 244 246)' : 'rgb(15 23 42)'
                          }}
                        >
                          {EXPENSE_CATEGORIES.map((category) => (
                            <SelectItem 
                              key={category} 
                              value={category}
                              style={{
                                backgroundColor: isDarkMode ? 'rgb(31 41 55)' : 'rgb(248 250 252)',
                                color: isDarkMode ? 'rgb(243 244 246)' : 'rgb(15 23 42)'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = isDarkMode ? 'rgb(55 65 81)' : 'rgb(226 232 240)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = isDarkMode ? 'rgb(31 41 55)' : 'rgb(248 250 252)';
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">
                                  {getCategoryIcon(category)}
                                </span>
                                <span>{category}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label
                        htmlFor="expense-payer"
                        className="block text-sm font-semibold text-foreground mb-2"
                      >
                        Paid by *
                      </label>
                      <Select
                        value={formData.payerId}
                        onValueChange={(value) =>
                          handleInputChange("payerId", value)
                        }
                      >
                        <SelectTrigger
                          className={`h-10 text-sm ${
                            errors.payerId
                              ? "border-red-500"
                              : "border-border"
                          } bg-background text-foreground rounded-lg`}
                        >
                          <SelectValue placeholder="Who paid?" />
                        </SelectTrigger>
                        <SelectContent
                          className="z-[9999]"
                          position="popper"
                          sideOffset={5}
                          style={{
                            backgroundColor: isDarkMode ? 'rgb(31 41 55)' : 'rgb(248 250 252)',
                            borderColor: isDarkMode ? 'rgb(75 85 99)' : 'rgb(148 163 184)',
                            color: isDarkMode ? 'rgb(243 244 246)' : 'rgb(15 23 42)'
                          }}
                        >
                          {group.participants &&
                          group.participants.length > 0 ? (
                            group.participants.map((participant) => (
                              <SelectItem
                                key={participant.id}
                                value={participant.id}
                                style={{
                                  backgroundColor: isDarkMode ? 'rgb(31 41 55)' : 'rgb(248 250 252)',
                                  color: isDarkMode ? 'rgb(243 244 246)' : 'rgb(15 23 42)'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = isDarkMode ? 'rgb(55 65 81)' : 'rgb(226 232 240)';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = isDarkMode ? 'rgb(31 41 55)' : 'rgb(248 250 252)';
                                }}
                              >
                                <span>{participant.name}</span>
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem 
                              value="no-participants" 
                              disabled
                              style={{
                                backgroundColor: isDarkMode ? 'rgb(31 41 55)' : 'rgb(248 250 252)',
                                color: isDarkMode ? 'rgb(156 163 175)' : 'rgb(100 116 139)'
                              }}
                            >
                              No participants available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {errors.payerId && (
                        <p className="text-sm text-red-300 mt-2 flex items-center gap-1">
                          {errors.payerId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Divider sx={{ borderColor: "rgba(148, 163, 184, 0.3)" }} />

                {/* Split Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-foreground">
                      Split between participants
                    </label>
                    <div className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">
                      Total weight: {totalWeight}
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg border border-blue-300/30 p-3">
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {formData.split.map((split) => {
                        const participant = group.participants.find(
                          (p) => p.id === split.participantId
                        );
                        if (!participant) return null;
                        return (
                          <div
                            key={split.participantId}
                            className={`p-3 rounded-lg border transition-all ${
                              split.included
                                ? "bg-white/20 border-blue-300/60 shadow-sm"
                                : "bg-white/5 border-gray-300/30 opacity-60"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 flex-1">
                                <input
                                  type="checkbox"
                                  checked={split.included}
                                  onChange={(e) =>
                                    handleSplitChange(
                                      split.participantId,
                                      "included",
                                      e.target.checked
                                    )
                                  }
                                  className="w-4 h-4 text-blue-500 bg-white border-gray-400 rounded"
                                />

                                <span className="font-medium text-foreground text-sm truncate">
                                  {participant.name}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <label className="text-xs font-medium text-muted-foreground">
                                    Weight:
                                  </label>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={split.weight}
                                    onChange={(e) =>
                                      handleSplitChange(
                                        split.participantId,
                                        "weight",
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    disabled={!split.included}
                                    className={`w-16 h-7 text-xs text-center bg-background text-foreground border-border rounded ${
                                      !split.included ? "opacity-40" : ""
                                    }`}
                                  />
                                </div>
                                {splitPreview[split.participantId] && (
                                  <div className="bg-green-100 px-2 py-1 rounded border border-green-200">
                                    <div className="text-xs font-bold text-green-800">
                                      {group.currency === "USD"
                                        ? "$"
                                        : group.currency === "EUR"
                                        ? "€"
                                        : ""}
                                      {splitPreview[split.participantId]}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {errors.split && (
                      <p className="text-sm text-red-300 mt-4 flex items-center gap-1">
                        {errors.split}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              p: 2,
              borderTop: isDarkMode 
                ? "1px solid rgba(75, 85, 99, 0.5)" 
                : "1px solid rgba(148, 163, 184, 0.3)",
              background: isDarkMode 
                ? "rgba(17, 24, 39, 0.8)" 
                : "rgba(248, 250, 252, 0.8)",
              display: "flex",
              justifyContent: "flex-end",
              gap: 1.5,
            }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={closeDrawer}
              className="px-4 py-2 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-lg"
            >
              {editingExpense ? "Update" : "Add"} Expense
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* MUI Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="info"
          variant="filled"
          sx={{ width: '100%' }}
        >
          <strong>Add Participants First! 👥</strong>
          <br />
          You need to add participants to your group before creating expenses. Go to the Participants tab to get started.
        </Alert>
      </Snackbar>
    </motion.div>
  );
}
