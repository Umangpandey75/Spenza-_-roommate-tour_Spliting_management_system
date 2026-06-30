"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { cn } from "../../lib/utils/cn";
import { appTheme, getButtonStyles } from "../../lib/colors/app-theme";

// Common currencies
const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
];

/**
 * GroupSettings component for group configuration
 * @param {Object} props
 * @param {import('../../types/index.js').Group} props.group - Group data
 * @param {Function} props.onUpdateGroup - Callback when group is updated
 * @param {Function} props.onDeleteGroup - Callback when group is deleted
 * @param {string} props.className - Additional CSS classes
 */
export function GroupSettings({
  group,
  onUpdateGroup,
  onDeleteGroup,
  className,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: group?.name || "",
    currency: group?.currency || "USD",
  });
  const [errors, setErrors] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const handleSave = () => {
    // Validate form
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Group name is required";
    }

    if (!formData.currency) {
      newErrors.currency = "Currency is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Update group
    if (onUpdateGroup) {
      onUpdateGroup({
        ...group,
        name: formData.name.trim(),
        currency: formData.currency,
      });
    }

    setIsEditing(false);
    setErrors({});
  };

  const handleCancel = () => {
    setFormData({
      name: group?.name || "",
      currency: group?.currency || "USD",
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (onDeleteGroup) {
      onDeleteGroup(group.id);
    }
    setIsDeleteDialogOpen(false);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const selectedCurrency = CURRENCIES.find((c) => c.code === formData.currency);
  const hasExpenses = group?.expenses?.length > 0;

  // Helper function to get card styles based on theme
  const getCardBgStyle = () => ({
    backgroundColor: isDarkMode
      ? "rgba(55, 65, 81, 0.8)"
      : "rgba(255, 255, 255, 0.6)",
    ...(isDarkMode && { border: "1px solid rgba(75, 85, 99, 0.5)" }),
  });

  if (!group) {
    return (
      <div className={cn("text-center py-16", className)}>
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-700/50 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <p className="text-gray-400">Group not found</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-8", className)}>
      {/* Basic Settings */}
      <div className="bg-gradient-to-br from-orange-200 to-orange-300 dark:from-orange-500/10 dark:to-orange-600/5 border border-orange-400 dark:border-orange-500/20 rounded-xl p-6 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
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
            Basic Settings
          </h3>
        </div>

        {isEditing ? (
          <div className="space-y-6">
            {/* Group Name */}
            <div>
              <label
                htmlFor="group-name"
                className="block text-sm font-medium mb-2 text-foreground"
              >
                Group Name *
              </label>
              <Input
                id="group-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter group name"
                className={`bg-white/50 ${
                  errors.name ? "border-red-500/50" : ""
                }`}
              />
              {errors.name && (
                <p className="text-sm text-red-400 mt-1 flex items-center gap-1">
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Currency */}
            <div>
              <label
                htmlFor="group-currency"
                className="block text-sm font-medium mb-2 text-foreground"
              >
                Currency *
              </label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleInputChange("currency", value)}
              >
                <SelectTrigger
                  className={`bg-white/50 ${
                    errors.currency ? "border-red-500/50" : ""
                  }`}
                >
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name} ({currency.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.currency && (
                <p className="text-sm text-red-400 mt-1 flex items-center gap-1">
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  {errors.currency}
                </p>
              )}
              {hasExpenses && formData.currency !== group.currency && (
                <div className="mt-2 p-3 rounded-lg border bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/30">
                  <p className="text-sm flex items-center gap-2 text-foreground">
                    <svg
                      className="w-4 h-4 text-yellow-600 dark:text-yellow-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    Changing currency will not convert existing expense amounts
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 dark:from-gray-500 dark:to-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-700 text-white shadow-lg shadow-gray-500/25 transition-all duration-200 hover:scale-105"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 dark:from-green-500 dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 text-white shadow-lg shadow-green-500/25 transition-all duration-200 hover:scale-105"
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Display Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg" style={getCardBgStyle()}>
                <label className="block text-sm font-medium mb-2 text-muted-foreground">
                  Group Name
                </label>
                <p className="text-lg font-semibold text-foreground">
                  {group.name}
                </p>
              </div>

              <div className="p-4 rounded-lg" style={getCardBgStyle()}>
                <label className="block text-sm font-medium mb-2 text-muted-foreground">
                  Currency
                </label>
                <p className="text-lg text-foreground">
                  {selectedCurrency
                    ? `${selectedCurrency.symbol} ${selectedCurrency.name} (${selectedCurrency.code})`
                    : group.currency}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105"
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
                Edit Settings
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Group Information */}
      <div className="bg-gradient-to-br from-blue-200 to-blue-300 dark:from-blue-500/10 dark:to-blue-600/5 border border-blue-400 dark:border-blue-500/20 rounded-xl p-6 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-300 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-blue-700 dark:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-foreground">
            Group Information
          </h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg text-center" style={getCardBgStyle()}>
            <div className="w-8 h-8 mx-auto mb-2 bg-blue-300 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-blue-700 dark:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10m-6-4h6"
                />
              </svg>
            </div>
            <p className="text-xs mb-1 text-muted-foreground">Created</p>
            <p className="font-semibold text-sm text-foreground">
              {group.createdAt
                ? new Date(group.createdAt).toLocaleDateString()
                : "Unknown"}
            </p>
          </div>

          <div className="p-4 rounded-lg text-center" style={getCardBgStyle()}>
            <div className="w-8 h-8 mx-auto mb-2 bg-blue-300 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-blue-700 dark:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <p className="text-xs mb-1 text-muted-foreground">Participants</p>
            <p className="font-semibold text-sm text-foreground">
              {group.participants?.length || 0}
            </p>
          </div>

          <div className="p-4 rounded-lg text-center" style={getCardBgStyle()}>
            <div className="w-8 h-8 mx-auto mb-2 bg-blue-300 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-blue-700 dark:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-xs mb-1 text-muted-foreground">Expenses</p>
            <p className="font-semibold text-sm text-foreground">
              {group.expenses?.length || 0}
            </p>
          </div>

          <div className="p-4 rounded-lg text-center" style={getCardBgStyle()}>
            <div className="w-8 h-8 mx-auto mb-2 bg-blue-300 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-blue-700 dark:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <p className="text-xs mb-1 text-muted-foreground">Group ID</p>
            <p className="font-mono text-xs truncate text-muted-foreground">
              {group.id.slice(0, 8)}...
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-gradient-to-br from-red-200 to-red-300 dark:from-red-500/10 dark:to-red-600/5 border border-red-400 dark:border-red-500/20 rounded-xl p-6 hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-300 dark:bg-red-500/20 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-red-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-foreground">Danger Zone</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1 mb-6">
          Proceed with caution. Actions in this section cannot be undone.
        </p>

        <div className="space-y-4">
          <div className="p-4 rounded-lg" style={getCardBgStyle()}>
            <h4 className="font-semibold mb-2 text-foreground">Delete Group</h4>
            <p className="text-sm mb-4 text-muted-foreground">
              Permanently delete this group and all its data. This action cannot
              be undone.
            </p>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isEditing}
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete Group
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-background border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <div className="w-6 h-6 bg-red-300 dark:bg-red-500/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-red-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              Delete Group
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete "{group.name}"? This will
              permanently remove:
            </DialogDescription>
          </DialogHeader>

          <div className="my-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <svg
                  className="w-4 h-4 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {group.participants?.length || 0} participant
                {(group.participants?.length || 0) !== 1 ? "s" : ""}
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <svg
                  className="w-4 h-4 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 002 2z"
                  />
                </svg>
                {group.expenses?.length || 0} expense
                {(group.expenses?.length || 0) !== 1 ? "s" : ""}
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <svg
                  className="w-4 h-4 text-muted-foreground"
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
                All settlement calculations
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <svg
                  className="w-4 h-4 text-muted-foreground"
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
                All group history
              </div>
            </div>
          </div>

          <div className="rounded-lg p-4 mb-4" style={getCardBgStyle()}>
            <p className="text-sm font-semibold mb-1 flex items-center gap-2 text-foreground">
              <svg
                className="w-4 h-4 text-red-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              This action cannot be undone
            </p>
            <p className="text-sm text-muted-foreground">
              Make sure to export any data you want to keep before deleting.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete Group
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
