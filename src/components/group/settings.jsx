'use client';

import React, { useMemo } from 'react';
import { StorageManager } from '../../lib/storage/storage-manager';
import { GroupSettings } from './index.js';
import { useToast } from '../../hooks/use-toast';

export function Settings({ group, onUpdateGroup, onBack }) {
  const { toast } = useToast();
  const storageManager = useMemo(() => new StorageManager(), []);

  const handleDeleteGroup = async (groupId) => {
    try {
      console.log("🗑️ Deleting group:", groupId);

      // Delete the group from storage
      await storageManager.deleteGroup(groupId);

      console.log("✅ Group deleted successfully");

      // Show success message
      toast({
        title: "Group Deleted ✅",
        description: `"${group.name}" has been permanently deleted.`,
        variant: "default",
      });

      // Navigate back to home after deletion
      onBack();
    } catch (error) {
      console.error("💥 Failed to delete group:", error);

      // Show error message
      toast({
        title: "Delete Failed",
        description: "Failed to delete group. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <GroupSettings
      group={group}
      onUpdateGroup={onUpdateGroup}
      onDeleteGroup={handleDeleteGroup}
    />
  );
}