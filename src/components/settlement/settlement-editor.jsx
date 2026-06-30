'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { LightDialog, LightDialogContent, LightDialogHeader, LightDialogTitle, LightDialogTrigger } from '../ui/light-dialog';
import { formatCurrency } from '../../lib/calc';
import { Edit3, Plus, RotateCcw, Trash2, Save, X } from 'lucide-react';

/**
 * SettlementEditor component for manually adjusting settlements
 * Allows editing transfer amounts, directions, and adding custom transfers
 */
export const SettlementEditor = React.memo(function SettlementEditor({ 
  transfers = [], 
  participants = [], 
  currency = 'USD',
  onSaveSettlements,
  className 
}) {
  const [editedTransfers, setEditedTransfers] = useState(transfers);
  const [editingTransfer, setEditingTransfer] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
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

  // Form state for editing/adding transfers
  const [transferForm, setTransferForm] = useState({
    fromId: '',
    toId: '',
    amount: ''
  });

  const handleEditTransfer = useCallback((transfer, index) => {
    setEditingTransfer(index);
    setTransferForm({
      fromId: transfer.fromId,
      toId: transfer.toId,
      amount: transfer.amount.toString()
    });
  }, []);

  const handleSaveEdit = () => {
    if (editingTransfer !== null) {
      const updatedTransfers = [...editedTransfers];
      updatedTransfers[editingTransfer] = {
        ...updatedTransfers[editingTransfer],
        fromId: transferForm.fromId,
        toId: transferForm.toId,
        amount: parseFloat(transferForm.amount) || 0
      };
      setEditedTransfers(updatedTransfers);
      setHasChanges(true);
    }
    setEditingTransfer(null);
    setTransferForm({ fromId: '', toId: '', amount: '' });
  };

  const handleCancelEdit = () => {
    setEditingTransfer(null);
    setTransferForm({ fromId: '', toId: '', amount: '' });
  };

  const handleReverseTransfer = (index) => {
    const updatedTransfers = [...editedTransfers];
    const transfer = updatedTransfers[index];
    updatedTransfers[index] = {
      ...transfer,
      fromId: transfer.toId,
      toId: transfer.fromId
    };
    setEditedTransfers(updatedTransfers);
    setHasChanges(true);
  };

  const handleDeleteTransfer = (index) => {
    const updatedTransfers = editedTransfers.filter((_, i) => i !== index);
    setEditedTransfers(updatedTransfers);
    setHasChanges(true);
  };

  const handleAddTransfer = () => {
    if (transferForm.fromId && transferForm.toId && transferForm.amount) {
      const newTransfer = {
        fromId: transferForm.fromId,
        toId: transferForm.toId,
        amount: parseFloat(transferForm.amount) || 0
      };
      setEditedTransfers([...editedTransfers, newTransfer]);
      setHasChanges(true);
      setShowAddDialog(false);
      setTransferForm({ fromId: '', toId: '', amount: '' });
    }
  };

  const handleSaveAll = () => {
    if (onSaveSettlements) {
      onSaveSettlements(editedTransfers);
    }
    setHasChanges(false);
  };

  const handleReset = () => {
    setEditedTransfers(transfers);
    setHasChanges(false);
    setEditingTransfer(null);
  };

  const getParticipantName = useCallback((participantId) => {
    const participant = participants.find(p => p.id === participantId);
    return participant ? participant.name : 'Unknown';
  }, [participants]);

  const totalAmount = useMemo(() => {
    return editedTransfers.reduce((sum, transfer) => sum + transfer.amount, 0);
  }, [editedTransfers]);

  // Helper function to get card styles based on theme
  const getCardBgStyle = () => ({
    backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.8)' : 'rgba(255, 255, 255, 0.6)',
    ...(isDarkMode && { border: '1px solid rgba(75, 85, 99, 0.5)' })
  });

  const getSelectStyles = () => ({
    backgroundColor: isDarkMode ? 'rgb(31 41 55)' : 'rgb(248 250 252)',
    borderColor: isDarkMode ? 'rgb(75 85 99)' : 'rgb(148 163 184)',
    color: isDarkMode ? 'rgb(243 244 246)' : 'rgb(15 23 42)'
  });

  const getSelectItemStyles = () => ({
    backgroundColor: isDarkMode ? 'rgb(31 41 55)' : 'rgb(248 250 252)',
    color: isDarkMode ? 'rgb(243 244 246)' : 'rgb(15 23 42)'
  });

  const getSelectItemHoverStyles = () => ({
    backgroundColor: isDarkMode ? 'rgb(55 65 81)' : 'rgb(226 232 240)'
  });

  return (
    <div className={className}>
      {/* Header with Add Transfer Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs px-2 sm:px-3 py-1 rounded-full border bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-300 dark:border-red-700"
            >
              Unsaved changes
            </motion.div>
          )}
        </div>
        
        <LightDialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <LightDialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transition-colors duration-200 min-h-[44px]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Transfer
            </Button>
          </LightDialogTrigger>
          <LightDialogContent className="bg-background border-border text-foreground">
            <LightDialogHeader>
              <LightDialogTitle className="text-foreground">Add Custom Transfer</LightDialogTitle>
            </LightDialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">From</label>
                <Select value={transferForm.fromId} onValueChange={(value) => setTransferForm(prev => ({ ...prev, fromId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payer" />
                  </SelectTrigger>
                  <SelectContent style={getSelectStyles()}>
                    {participants.map(participant => (
                      <SelectItem 
                        key={participant.id} 
                        value={participant.id}
                        style={getSelectItemStyles()}
                        onMouseEnter={(e) => {
                          Object.assign(e.target.style, getSelectItemHoverStyles());
                        }}
                        onMouseLeave={(e) => {
                          Object.assign(e.target.style, getSelectItemStyles());
                        }}
                      >
                        {participant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">To</label>
                <Select value={transferForm.toId} onValueChange={(value) => setTransferForm(prev => ({ ...prev, toId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent style={getSelectStyles()}>
                    {participants.filter(p => p.id !== transferForm.fromId).map(participant => (
                      <SelectItem 
                        key={participant.id} 
                        value={participant.id}
                        style={getSelectItemStyles()}
                        onMouseEnter={(e) => {
                          Object.assign(e.target.style, getSelectItemHoverStyles());
                        }}
                        onMouseLeave={(e) => {
                          Object.assign(e.target.style, getSelectItemStyles());
                        }}
                      >
                        {participant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Amount</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={transferForm.amount}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)} className="w-full sm:w-auto min-h-[44px]">
                  Cancel
                </Button>
                <Button onClick={handleAddTransfer} disabled={!transferForm.fromId || !transferForm.toId || !transferForm.amount} className="w-full sm:w-auto min-h-[44px]">
                  Add Transfer
                </Button>
              </div>
            </div>
          </LightDialogContent>
        </LightDialog>
      </div>

      {/* Transfer List */}
      <div className="space-y-3 mb-6">
        {editedTransfers.length === 0 ? (
          <div className="text-center py-8">
            <div 
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={getCardBgStyle()}
            >
              <Edit3 className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-medium mb-2 text-foreground">No transfers to edit</p>
            <p className="text-sm text-muted-foreground">Add a custom transfer to get started</p>
          </div>
        ) : (
          editedTransfers.map((transfer, index) => (
            <motion.div
              key={`${transfer.fromId}-${transfer.toId}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-4 rounded-lg border backdrop-blur-sm"
              style={getCardBgStyle()}
            >
              {editingTransfer === index ? (
                // Edit mode
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1 text-foreground">From</label>
                      <Select value={transferForm.fromId} onValueChange={(value) => setTransferForm(prev => ({ ...prev, fromId: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                          style={{
                            backgroundColor: 'rgb(248 250 252)',
                            borderColor: 'rgb(148 163 184)',
                            color: 'rgb(15 23 42)'
                          }}
                        >
                          {participants.map(participant => (
                            <SelectItem 
                              key={participant.id} 
                              value={participant.id}
                              style={{
                                backgroundColor: 'rgb(248 250 252)',
                                color: 'rgb(15 23 42)'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'rgb(226 232 240)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'rgb(248 250 252)';
                              }}
                            >
                              {participant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1 text-foreground">To</label>
                      <Select value={transferForm.toId} onValueChange={(value) => setTransferForm(prev => ({ ...prev, toId: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                          style={{
                            backgroundColor: 'rgb(248 250 252)',
                            borderColor: 'rgb(148 163 184)',
                            color: 'rgb(15 23 42)'
                          }}
                        >
                          {participants.filter(p => p.id !== transferForm.fromId).map(participant => (
                            <SelectItem 
                              key={participant.id} 
                              value={participant.id}
                              style={{
                                backgroundColor: 'rgb(248 250 252)',
                                color: 'rgb(15 23 42)'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'rgb(226 232 240)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'rgb(248 250 252)';
                              }}
                            >
                              {participant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-foreground">Amount</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={transferForm.amount}
                      onChange={(e) => setTransferForm(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancelEdit} className="w-full sm:w-auto min-h-[44px]">
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveEdit} className="w-full sm:w-auto min-h-[44px]">
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                // View mode
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm sm:text-base">
                      <span className="font-semibold text-foreground truncate">
                        {getParticipantName(transfer.fromId)}
                      </span>
                      <span className="text-muted-foreground">owes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm sm:text-base">
                      <span className="font-bold text-lg text-foreground">
                        {formatCurrency(transfer.amount, currency)}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-semibold text-foreground truncate">
                        {getParticipantName(transfer.toId)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 justify-end sm:justify-start">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTransfer(transfer, index)}
                      className="h-10 w-10 p-0 min-w-[44px] min-h-[44px] hover:bg-white/50 dark:hover:bg-gray-700/50"
                      title="Edit transfer"
                    >
                      <Edit3 className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReverseTransfer(index)}
                      className="h-10 w-10 p-0 min-w-[44px] min-h-[44px] hover:bg-white/50 dark:hover:bg-gray-700/50"
                      title="Reverse direction"
                    >
                      <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTransfer(index)}
                      className="h-10 w-10 p-0 min-w-[44px] min-h-[44px] hover:bg-red-100 dark:hover:bg-red-900/50"
                      title="Delete transfer"
                    >
                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Summary and Actions */}
      <div className="pt-4 border-t border-border space-y-4">
        <div className="text-sm text-foreground">
          <span>Total transfers: <span className="font-bold">{editedTransfers.length}</span></span>
          <span className="mx-2">•</span>
          <span>Total amount: <span className="font-bold">{formatCurrency(totalAmount, currency)}</span></span>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges}
            className="w-full sm:w-auto bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg transition-colors duration-200 min-h-[44px]"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Changes
          </Button>
          <Button
            onClick={handleSaveAll}
            disabled={!hasChanges}
            className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg transition-colors duration-200 min-h-[44px]"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settlement
          </Button>
        </div>
      </div>
    </div>
  );
});