'use client';

import React, { useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { formatCurrency } from '../../lib/calc';
import { Users, DollarSign, Trash2 } from 'lucide-react';

export const GroupCard = React.memo(function GroupCard({ group, onView, onDelete }) {
  // Memoize expensive calculations
  const { totalExpenses, totalAmount, participantCount } = useMemo(() => ({
    totalExpenses: group.expenses?.length || 0,
    totalAmount: group.expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0,
    participantCount: group.participants?.length || 0,
  }), [group.expenses, group.participants]);

  // Memoize event handlers
  const handleView = useCallback(() => {
    onView(group.id);
  }, [onView, group.id]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    onDelete(group.id);
  }, [onDelete, group.id]);

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base sm:text-lg font-semibold truncate flex-1 min-w-0">
            {group.name}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="text-muted-foreground hover:text-destructive cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent onClick={handleView}>
        <div className="space-y-2 sm:space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground/80 flex-shrink-0" />
              <span className="text-foreground">{participantCount} participant{participantCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-foreground/80 flex-shrink-0" />
              <span className="text-foreground">{totalExpenses} expense{totalExpenses !== 1 ? 's' : ''}</span>
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-muted-foreground">Total spent</span>
              <span className="font-semibold text-sm sm:text-base">
                {formatCurrency(totalAmount, group.currency)}
              </span>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Created {new Date(group.createdAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});