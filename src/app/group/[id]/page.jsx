'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { GridBackground } from '@/components/ui/grid-background';
import { GroupDashboard } from '@/components/group';
import { StorageManager } from '@/lib/storage';

const storageManager = new StorageManager();

export default function GroupDetailPage({ params }) {
  const router = useRouter();
  const [group, setGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const resolvedParams = use(params);

  useEffect(() => {
    loadGroup();
    router.prefetch('/');
  }, [resolvedParams.id, router]);

  const loadGroup = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedGroup = await storageManager.getGroup(resolvedParams.id);
      if (!loadedGroup) { setError('Group not found'); return; }
      setGroup(loadedGroup);
    } catch (err) {
      console.error('Failed to load group:', err);
      setError('Failed to load group');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateGroup = async (updatedGroup) => {
    try { await storageManager.saveGroup(updatedGroup); setGroup(updatedGroup); } catch (err) { console.error('Failed to update group:', err); }
  };

  const handleBack = () => {
    // Explicit navigation avoids Chromium bfcache quirks
    router.push('/');
  };

  if (isLoading) {
    return (
      <GridBackground className="flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading group...</p>
        </div>
      </GridBackground>
    );
  }

  if (error) {
    return (
      <GridBackground className="flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">{error}</h2>
          <button onClick={handleBack} className="text-blue-600 dark:text-blue-400 hover:underline">Back to Groups</button>
        </div>
      </GridBackground>
    );
  }

  return (
    <GridBackground>
      <GroupDashboard group={group} onUpdateGroup={handleUpdateGroup} onBack={handleBack} />
    </GridBackground>
  );
}
