'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';
import { AlertTriangle, Trash2, UserMinus, X } from 'lucide-react';

export function ConfirmationDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  title, 
  description, 
  confirmText = "Delete", 
  cancelText = "Cancel",
  variant = "destructive",
  icon: Icon = AlertTriangle 
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              variant === 'destructive' 
                ? 'bg-red-100 dark:bg-red-900/20' 
                : 'bg-orange-100 dark:bg-orange-900/20'
            }`}>
              <Icon className={`h-5 w-5 ${
                variant === 'destructive' 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-orange-600 dark:text-orange-400'
              }`} />
            </div>
            <DialogTitle className="text-left">{title}</DialogTitle>
          </div>
        </DialogHeader>
        <DialogDescription className="text-left py-4">
          {description}
        </DialogDescription>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                Processing...
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Specific confirmation dialogs for common use cases
export function DeleteGroupDialog({ open, onOpenChange, onConfirm, groupName }) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title="Delete Group"
      description={`Are you sure you want to delete "${groupName}"? This action cannot be undone and will permanently remove all expenses and participant data.`}
      confirmText="Delete Group"
      icon={Trash2}
      variant="destructive"
    />
  );
}

export function RemoveParticipantDialog({ open, onOpenChange, onConfirm, participantName }) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title="Remove Participant"
      description={`Are you sure you want to remove "${participantName}" from this group? Their expense history will be preserved, but they won't be included in future calculations.`}
      confirmText="Remove Participant"
      icon={UserMinus}
      variant="destructive"
    />
  );
}

export function DeleteExpenseDialog({ open, onOpenChange, onConfirm, expenseDescription }) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title="Delete Expense"
      description={`Are you sure you want to delete "${expenseDescription}"? This action cannot be undone.`}
      confirmText="Delete Expense"
      icon={X}
      variant="destructive"
    />
  );
}