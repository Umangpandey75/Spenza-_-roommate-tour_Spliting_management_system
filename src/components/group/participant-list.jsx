'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils/cn';

/**
 * ParticipantList component with add/edit/delete functionality and weight management
 * @param {Object} props
 * @param {import('../../types/index.js').Group} props.group - Group data
 * @param {Function} props.onAddParticipant - Callback when participant is added
 * @param {Function} props.onUpdateParticipant - Callback when participant is updated
 * @param {Function} props.onRemoveParticipant - Callback when participant is removed
 * @param {boolean} props.showWeights - Whether to show weight management
 * @param {string} props.className - Additional CSS classes
 */
export function ParticipantList({ 
  group, 
  onAddParticipant, 
  onUpdateParticipant, 
  onRemoveParticipant,
  showWeights = true,
  className 
}) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);

  // Sort participants by name for consistent display
  const sortedParticipants = useMemo(() => {
    if (!group?.participants) return [];
    return [...group.participants]
      .filter(p => p.active)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [group?.participants]);

  const [addError, setAddError] = useState(null);
  const handleAddParticipant = async (participantData) => {
    setAddError(null);
    if (onAddParticipant) {
      try {
        await onAddParticipant(participantData);
        setIsAddDialogOpen(false);
      } catch (err) {
        setAddError(err.message || 'Failed to add participant');
      }
    }
  };

  const handleUpdateParticipant = (participantId, updates) => {
    if (onUpdateParticipant) {
      onUpdateParticipant(participantId, updates);
    }
    setEditingParticipant(null);
  };

  const handleRemoveParticipant = (participantId) => {
    if (onRemoveParticipant) {
      onRemoveParticipant(participantId);
    }
  };

  const canRemoveParticipant = (participantId) => {
    // Check if participant has any expenses
    const hasExpenses = group?.expenses?.some(expense => 
      expense.payerId === participantId || 
      expense.split?.some(split => split.participantId === participantId && split.included)
    );
    return !hasExpenses;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Participants ({sortedParticipants.length})
        </h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Participant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Participant</DialogTitle>
            </DialogHeader>
            <ParticipantForm
              onSubmit={handleAddParticipant}
              onCancel={() => setIsAddDialogOpen(false)}
              showWeights={showWeights}
            />
            {addError && (
              <p className="text-red-500 text-xs mt-2 text-center">{addError}</p>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Participants List */}
      {sortedParticipants.length > 0 ? (
        <div className="grid gap-3">
          {sortedParticipants.map(participant => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              onEdit={() => setEditingParticipant(participant)}
              onRemove={() => handleRemoveParticipant(participant.id)}
              canRemove={canRemoveParticipant(participant.id)}
              showWeights={showWeights}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground mb-4">
              <svg className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h4 className="font-semibold mb-2">No participants yet</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Add participants to start tracking expenses
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              Add First Participant
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      {editingParticipant && (
        <Dialog open={true} onOpenChange={() => setEditingParticipant(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Participant</DialogTitle>
            </DialogHeader>
            <ParticipantForm
              participant={editingParticipant}
              onSubmit={(data) => handleUpdateParticipant(editingParticipant.id, data)}
              onCancel={() => setEditingParticipant(null)}
              showWeights={showWeights}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/**
 * Individual participant card
 */
function ParticipantCard({ participant, onEdit, onRemove, canRemove, showWeights }) {
  return (
    <Card className="transition-all duration-200 hover:shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {participant.name.charAt(0).toUpperCase()}
              </span>
            </div>
            
            {/* Participant Info */}
            <div>
              <h4 className="font-semibold">{participant.name}</h4>
              {showWeights && (
                <p className="text-sm text-muted-foreground">
                  Default weight: {participant.defaultWeight}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              aria-label={`Edit ${participant.name}`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Button>
            
            {canRemove ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="text-muted-foreground hover:text-destructive"
                aria-label={`Remove ${participant.name}`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            ) : (
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className="h-4 w-4 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Form for adding/editing participants
 */
function ParticipantForm({ participant, onSubmit, onCancel, showWeights }) {
  const [formData, setFormData] = useState({
    name: participant?.name || '',
    defaultWeight: participant?.defaultWeight || 1,
  });
  const [errors, setErrors] = useState({});
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

  // Helper function to get input styles based on theme
  const getInputStyles = (hasError = false) => ({
    backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.8)' : 'rgba(255, 255, 255, 0.9)',
    borderColor: hasError 
      ? (isDarkMode ? 'rgb(239, 68, 68)' : 'rgb(220, 38, 38)')
      : (isDarkMode ? 'rgba(75, 85, 99, 0.6)' : 'rgba(209, 213, 219, 0.8)'),
    color: isDarkMode ? 'rgb(243, 244, 246)' : 'rgb(17, 24, 39)',
  });

  // Helper function to get button styles based on theme
  const getPrimaryButtonStyles = () => ({
    backgroundColor: isDarkMode ? 'rgb(59, 130, 246)' : 'rgb(37, 99, 235)',
    borderColor: isDarkMode ? 'rgb(59, 130, 246)' : 'rgb(37, 99, 235)',
    color: 'white',
  });

  const getSecondaryButtonStyles = () => ({
    backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.8)' : 'rgba(255, 255, 255, 0.9)',
    borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.6)' : 'rgba(209, 213, 219, 0.8)',
    color: isDarkMode ? 'rgb(243, 244, 246)' : 'rgb(17, 24, 39)',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (showWeights && (Number(formData.defaultWeight) <= 0 || isNaN(Number(formData.defaultWeight)))) {
      newErrors.defaultWeight = 'Weight must be a positive number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Generate ID for new participants
    const participantData = {
      ...formData,
      name: formData.name.trim(),
      defaultWeight: showWeights ? Number(formData.defaultWeight) : 1,
    };

    if (!participant) {
      participantData.id = `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      participantData.active = true;
    }

    onSubmit(participantData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name Input */}
      <div>
        <label 
          htmlFor="participant-name" 
          className="block text-sm font-medium mb-2"
          style={{ color: isDarkMode ? 'rgb(209, 213, 219)' : 'rgb(55, 65, 81)' }}
        >
          Name *
        </label>
        <Input
          id="participant-name"
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter participant name"
          className="border-2 transition-colors duration-200 focus:ring-2 focus:ring-opacity-50"
          style={{
            ...getInputStyles(!!errors.name),
            '--tw-ring-color': isDarkMode ? 'rgb(59, 130, 246)' : 'rgb(37, 99, 235)',
          }}
          autoFocus
        />
        {errors.name && (
          <p 
            className="text-sm mt-1 font-medium"
            style={{ color: isDarkMode ? 'rgb(248, 113, 113)' : 'rgb(220, 38, 38)' }}
          >
            {errors.name}
          </p>
        )}
      </div>

      {/* Weight Input */}
      {showWeights && (
        <div>
          <label 
            htmlFor="participant-weight" 
            className="block text-sm font-medium mb-2"
            style={{ color: isDarkMode ? 'rgb(209, 213, 219)' : 'rgb(55, 65, 81)' }}
          >
            Default Weight
          </label>
          <Input
            id="participant-weight"
            type="number"
            min="0.1"
            step="0.1"
            value={formData.defaultWeight}
            onChange={(e) => handleInputChange('defaultWeight', e.target.value)}
            placeholder="1.0"
            className="border-2 transition-colors duration-200 focus:ring-2 focus:ring-opacity-50"
            style={{
              ...getInputStyles(!!errors.defaultWeight),
              '--tw-ring-color': isDarkMode ? 'rgb(59, 130, 246)' : 'rgb(37, 99, 235)',
            }}
          />
          {errors.defaultWeight && (
            <p 
              className="text-sm mt-1 font-medium"
              style={{ color: isDarkMode ? 'rgb(248, 113, 113)' : 'rgb(220, 38, 38)' }}
            >
              {errors.defaultWeight}
            </p>
          )}
          <p 
            className="text-xs mt-1"
            style={{ color: isDarkMode ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}
          >
            Weight determines how expenses are split (1.0 = normal share, 2.0 = double share, etc.)
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="border-2 transition-colors duration-200 hover:opacity-80"
          style={getSecondaryButtonStyles()}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          className="border-2 transition-colors duration-200 hover:opacity-90"
          style={getPrimaryButtonStyles()}
        >
          {participant ? 'Update' : 'Add'} Participant
        </Button>
      </div>
    </form>
  );
}