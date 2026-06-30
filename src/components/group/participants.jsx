"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { formatCurrency } from "../../lib/calc";
import { cn } from "../../lib/utils/cn";
import { getMotionVariants, getTransition } from "../../lib/utils/motion";
import { Plus, Edit3, Trash2, Save, X, User } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import {
  appTheme,
  getCardStyles,
  getTextStyles,
  getButtonStyles,
  getIconContainerStyles,
  getContentCardStyles,
  getParticipantCardStyles,
  getParticipantTextStyles,
} from "../../lib/colors/app-theme";

// ParticipantForm component for the modal
export function ParticipantForm({
  participant,
  onSubmit,
  onCancel,
  showWeights = true,
}) {
  const [formData, setFormData] = useState({
    name: participant?.name || "",
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
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (
      showWeights &&
      (Number(formData.defaultWeight) <= 0 ||
        isNaN(Number(formData.defaultWeight)))
    ) {
      newErrors.defaultWeight = "Weight must be a positive number";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    const participantData = {
      ...formData,
      name: formData.name.trim(),
      defaultWeight: showWeights ? Number(formData.defaultWeight) : 1,
    };
    if (!participant) {
      participantData.id = `participant_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 9)}`;
      participantData.active = true;
    }
    onSubmit(participantData);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          onChange={(e) => handleInputChange("name", e.target.value)}
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
            onChange={(e) => handleInputChange("defaultWeight", e.target.value)}
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
            Weight determines how expenses are split (1.0 = normal share, 2.0 =
            double share, etc.)
          </p>
        </div>
      )}
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
          {participant ? "Update" : "Add"} Participant
        </Button>
      </div>
    </form>
  );
}

export function Participants({
  group,
  onAddParticipant,
  storageManager,
  onUpdateGroup,
  className,
}) {
  const { toast } = useToast();
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", defaultWeight: 1 });
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

  const participants = group?.participants || [];
  const currency = group?.currency || "USD";

  const handleEditParticipant = (participant) => {
    setEditingParticipant(participant.id);
    setEditForm({
      name: participant.name,
      defaultWeight: participant.defaultWeight || 1,
    });
  };

  const handleSaveEdit = async (participantId) => {
    if (editForm.name.trim()) {
      try {
        const updatedParticipant = {
          ...participants.find((p) => p.id === participantId),
          name: editForm.name.trim(),
          defaultWeight: editForm.defaultWeight,
        };

        await storageManager.updateParticipant(
          group.id,
          participantId,
          updatedParticipant
        );
        const updatedGroup = await storageManager.getGroup(group.id);
        onUpdateGroup(updatedGroup);
        setEditingParticipant(null);
        setEditForm({ name: "", defaultWeight: 1 });

        toast({
          title: "Participant Updated! ✨",
          description: `${updatedParticipant.name}'s details have been saved.`,
          variant: "default",
        });
      } catch (error) {
        console.error("Failed to update participant:", error);
        toast({
          title: "Update Failed",
          description:
            "Failed to update participant details. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingParticipant(null);
    setEditForm({ name: "", defaultWeight: 1 });
  };

  const handleDeleteParticipant = async (participantId) => {
    try {
      await storageManager.removeParticipant(group.id, participantId);
      const updatedGroup = await storageManager.getGroup(group.id);
      onUpdateGroup(updatedGroup);

      // Set flag to refresh homepage data
      localStorage.setItem('spenza_needs_refresh', 'true');
      console.log('🗑️ Participant removed, flagged for homepage refresh');

      const participant = participants.find((p) => p.id === participantId);
      toast({
        title: "Participant Removed ✅",
        description: `${participant?.name} has been removed from the group.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to remove participant:", error);
      toast({
        title: "Removal Failed",
        description: "Failed to remove participant. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("space-y-8", className)}
    >
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2 text-foreground">
            Participants
          </h2>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {participants.length} member{participants.length !== 1 ? "s" : ""}
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
                  d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-1m-3 1l-3-1"
                />
              </svg>
              Avg weight:{" "}
              {participants.length > 0
                ? (
                    participants.reduce(
                      (sum, p) => sum + (p.defaultWeight || 1),
                      0
                    ) / participants.length
                  ).toFixed(1)
                : "0"}
            </span>
          </div>
        </div>
        <Button
          onClick={onAddParticipant}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white shadow-lg shadow-blue-500/25 w-full sm:w-auto flex items-center gap-2 transition-all duration-200 hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          Add Participant
        </Button>
      </div>

      {participants.length === 0 ? (
        <div className="bg-gradient-to-br from-purple-200 to-purple-300 dark:from-purple-500/10 dark:to-purple-600/5 border border-purple-400 dark:border-purple-500/20 rounded-xl p-12 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-300 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
              <User className="h-8 w-8 text-purple-700" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              No participants yet
            </h3>
            <p className="mb-8 max-w-md mx-auto text-muted-foreground">
              Add group members to start splitting expenses. Each participant
              can have different weights for fair splitting.
            </p>
          </div>
          <Button
            onClick={onAddParticipant}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white shadow-lg shadow-blue-500/25 px-8 py-3 text-base transition-all duration-200 hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add First Participant
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {participants.map((participant, index) => (
            <motion.div
              key={participant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div
                className={`group relative overflow-hidden rounded-xl p-6 hover:scale-[1.02] transition-all duration-300 ${
                  index % 6 === 0 ? 'bg-gradient-to-br from-orange-200 to-orange-300 dark:from-orange-500/10 dark:to-orange-600/5 border border-orange-400 dark:border-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30' :
                  index % 6 === 1 ? 'bg-gradient-to-br from-emerald-200 to-emerald-300 dark:from-emerald-500/10 dark:to-emerald-600/5 border border-emerald-400 dark:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30' :
                  index % 6 === 2 ? 'bg-gradient-to-br from-blue-200 to-blue-300 dark:from-blue-500/10 dark:to-blue-600/5 border border-blue-400 dark:border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30' :
                  index % 6 === 3 ? 'bg-gradient-to-br from-purple-200 to-purple-300 dark:from-purple-500/10 dark:to-purple-600/5 border border-purple-400 dark:border-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30' :
                  index % 6 === 4 ? 'bg-gradient-to-br from-pink-200 to-pink-300 dark:from-pink-500/10 dark:to-pink-600/5 border border-pink-400 dark:border-pink-500/20 hover:shadow-lg hover:shadow-pink-500/30' :
                  'bg-gradient-to-br from-teal-200 to-teal-300 dark:from-teal-500/10 dark:to-teal-600/5 border border-teal-400 dark:border-teal-500/20 hover:shadow-lg hover:shadow-teal-500/30'
                }`}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                </div>

                <div className="relative flex items-center gap-4">
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm ${
                      index % 6 === 0 ? 'bg-orange-300 dark:bg-orange-500/20 text-orange-700' :
                      index % 6 === 1 ? 'bg-emerald-300 dark:bg-emerald-500/20 text-emerald-700' :
                      index % 6 === 2 ? 'bg-blue-300 dark:bg-blue-500/20 text-blue-700' :
                      index % 6 === 3 ? 'bg-purple-300 dark:bg-purple-500/20 text-purple-700' :
                      index % 6 === 4 ? 'bg-pink-300 dark:bg-pink-500/20 text-pink-700' :
                      'bg-teal-300 dark:bg-teal-500/20 text-teal-700'
                    }`}
                  >
                    {participant.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {editingParticipant === participant.id ? (
                      <div className="space-y-3">
                        <Input
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Participant name"
                          className="bg-white/50"
                        />
                        <Input
                          type="number"
                          min="0.1"
                          max="5"
                          step="0.1"
                          value={editForm.defaultWeight}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              defaultWeight: parseFloat(e.target.value) || 1,
                            }))
                          }
                          placeholder="Default weight"
                          className="bg-white/50"
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-lg truncate text-foreground">
                          {participant.name}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
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
                                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-1m-3 1l-3-1"
                              />
                            </svg>
                            <span>
                              Weight:{" "}
                              <span className="font-medium text-foreground">
                                {participant.defaultWeight || 1}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
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
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="font-medium text-green-600">
                              Active
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {editingParticipant === participant.id ? (
                      <>
                        <Button
                          onClick={() => handleSaveEdit(participant.id)}
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={() => handleEditParticipant(participant)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit3 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          onClick={() =>
                            handleDeleteParticipant(participant.id)
                          }
                          variant="outline"
                          size="sm"
                          className="border-red-400/40 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
