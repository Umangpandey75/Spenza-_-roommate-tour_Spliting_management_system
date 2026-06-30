'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { GridBackground } from '../components/ui/grid-background';
import { ThemeToggle } from '../components/shared/theme-toggle';
import { GroupCard } from '../components/group';
import { CreateGroupDialog } from '../components/group';
import { DeleteGroupDialog } from '../components/ui/confirmation-dialog';
import { useStorage } from '../contexts/storage-context';
import { useToast } from '../hooks/use-toast';
import { createClient } from '../utils/supabase/client';
import { useRealtimeGroups } from '../hooks/use-realtime';
import { Plus, Users, Calculator, Receipt, TrendingUp, LogOut, User } from 'lucide-react';
import { AnimatedButton } from '../components/ui/animated-button';
import { LearnMoreButton } from '../components/ui/learn-more-button';

export default function Home() {
  const storageManager = useStorage();
  const { toast } = useToast();
  const supabase = createClient();
  const [groups, setGroups] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteGroupDialog, setDeleteGroupDialog] = useState({ open: false, group: null });
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);

  // Enhanced initialization with navigation handling
  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Starting initialization...');
      
      setIsLoading(true);
      setAuthLoading(true);

      try {
        // First, check for cached user to show UI immediately
        const cachedUser = localStorage.getItem('spenza_user');
        if (cachedUser) {
          try {
            const parsedUser = JSON.parse(cachedUser);
            console.log('📱 Found cached user:', parsedUser.email);
            setUser(parsedUser);
            setAuthLoading(false);
            
            // Load cached groups immediately for fast UI
            const cachedGroups = localStorage.getItem('spenza_groups');
            if (cachedGroups) {
              const parsedGroups = JSON.parse(cachedGroups);
              console.log('📱 Loaded cached groups:', parsedGroups.length);
              setGroups(parsedGroups);
              setIsLoading(false);
            }
          } catch (cacheError) {
            console.warn('⚠️ Invalid cached data:', cacheError);
            localStorage.removeItem('spenza_user');
            localStorage.removeItem('spenza_groups');
          }
        }

        // Then verify with Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('⚠️ Auth error:', error.message);
          if (!cachedUser) {
            setUser(null);
            setGroups([]);
          }
        } else if (session?.user) {
          console.log('✅ User verified:', session.user.email);
          setUser(session.user);
          localStorage.setItem('spenza_user', JSON.stringify(session.user));
          
          // Load fresh groups from Supabase
          await loadGroupsFromSupabase(session.user);
        } else {
          console.log('ℹ️ No session, clearing data');
          setUser(null);
          setGroups([]);
          localStorage.removeItem('spenza_user');
          localStorage.removeItem('spenza_groups');
        }
      } catch (error) {
        console.error('💥 Initialization error:', error);
        // Don't clear cached data on network errors
        if (!localStorage.getItem('spenza_user')) {
          setUser(null);
          setGroups([]);
        }
      } finally {
        // Always clear loading states
        setIsLoading(false);
        setAuthLoading(false);
      }
    };

    initializeApp();

    // Simplified auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth event:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        localStorage.setItem('spenza_user', JSON.stringify(session.user));
        await loadGroupsFromSupabase(session.user);
        setAuthLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setGroups([]);
        localStorage.removeItem('spenza_user');
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []); // Empty dependency array

  // Handle page visibility and navigation changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        console.log('👁️ Page became visible, refreshing data...');
        loadGroupsFromSupabase(user);
      }
    };

    const handleFocus = () => {
      if (user) {
        console.log('🎯 Window focused, refreshing data...');
        loadGroupsFromSupabase(user);
      }
    };

    // Add storage event listener for cross-tab updates
    const handleStorageChange = (e) => {
      if (e.key === 'spenza_groups_updated' && user) {
        console.log('📱 Groups updated in another tab, refreshing...');
        loadGroupsFromSupabase(user);
        // Clear the flag
        localStorage.removeItem('spenza_groups_updated');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  // Add effect to refresh data when navigating back to homepage
  useEffect(() => {
    // Set up an interval to check for data updates periodically when on homepage
    let refreshInterval;
    
    if (user) {
      // Check for updates every 30 seconds when on homepage
      refreshInterval = setInterval(() => {
        const shouldRefresh = localStorage.getItem('spenza_needs_refresh');
        if (shouldRefresh === 'true') {
          console.log('🔄 Auto-refreshing due to data changes...');
          loadGroupsFromSupabase(user);
          localStorage.removeItem('spenza_needs_refresh');
        }
      }, 5000); // Check every 5 seconds
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [user]);

  // Refresh data when component becomes visible (navigation back)
  useEffect(() => {
    const handlePageShow = () => {
      if (user) {
        console.log('📄 Page shown, refreshing data...');
        loadGroupsFromSupabase(user);
      }
    };

    // This fires when navigating back with browser back button
    window.addEventListener('pageshow', handlePageShow);
    
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [user]);

  // Real-time groups subscription
  const handleRealtimeGroupsChange = useCallback(async (payload) => {
    console.log('📡 Real-time groups change:', payload);
    
    try {
      // Reload groups from Supabase when real-time event occurs
      await loadGroupsFromSupabase();
      
      // Show toast notification based on event type
      if (payload.eventType === 'INSERT') {
        toast({
          title: 'New Group Added',
          description: 'A new group has been synced to your account.',
          variant: 'default',
        });
      } else if (payload.eventType === 'UPDATE') {
        toast({
          title: 'Group Updated',
          description: 'A group has been updated and synced.',
          variant: 'default',
        });
      } else if (payload.eventType === 'DELETE') {
        toast({
          title: 'Group Removed',
          description: 'A group has been deleted and synced.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('❌ Failed to handle real-time groups change:', error);
    }
  }, [toast]);

  // Set up real-time subscription
  const { testConnection } = useRealtimeGroups(
    user?.id, 
    realtimeEnabled ? handleRealtimeGroupsChange : null
  );

  // Handle user state changes (when user logs in/out during navigation)
  useEffect(() => {
    if (user && !authLoading && !isLoading) {
      console.log('👤 User state changed, ensuring groups are loaded...');
      // Only reload if we don't have groups already
      if (groups.length === 0) {
        loadGroupsFromSupabase(user);
      }
    } else if (!user && !authLoading) {
      console.log('👤 No user, clearing groups...');
      setGroups([]);
    }
  }, [user, authLoading, isLoading]); // Include isLoading to prevent race conditions



  const loadGroupsFromLocalStorage = async () => {
    try {
      console.log('📂 Loading groups from localStorage...');
      const storedGroups = localStorage.getItem('spenza_groups');
      const groups = storedGroups ? JSON.parse(storedGroups) : [];
      console.log('✅ Loaded groups from localStorage:', groups);
      setGroups(groups);
    } catch (error) {
      console.error('💥 Failed to load groups from localStorage:', error);
      setGroups([]);
    }
  };

  const loadGroupsFromSupabase = async (currentUser = user) => {
    if (!currentUser?.id) {
      console.log('⚠️ No user ID, skipping Supabase load');
      setGroups([]);
      return;
    }

    try {
      console.log('📂 Loading groups for user:', currentUser.email);
      
      const { data: groups, error } = await supabase
        .from('groups')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase error:', error.message);
        // Don't clear groups on error, keep cached ones
        const cachedGroups = localStorage.getItem('spenza_groups');
        if (cachedGroups && (!groups || groups.length === 0)) {
          console.log('📱 Using cached groups due to Supabase error');
          setGroups(JSON.parse(cachedGroups));
        } else {
          setGroups([]);
        }
        return;
      }

      if (!groups || groups.length === 0) {
        console.log('ℹ️ No groups found');
        setGroups([]);
        localStorage.setItem('spenza_groups', JSON.stringify([]));
        return;
      }

      console.log('✅ Loaded', groups.length, 'groups, now loading participants and expenses...');

      // Load participants and expenses for all groups
      const groupIds = groups.map(g => g.id);
      
      const [participantsResult, expensesResult] = await Promise.all([
        supabase.from('participants').select('*').in('group_id', groupIds),
        supabase.from('expenses').select('*').in('group_id', groupIds)
      ]);

      const participants = participantsResult.data || [];
      const expenses = expensesResult.data || [];

      console.log('📊 Loaded', participants.length, 'participants and', expenses.length, 'expenses');

      // Group participants and expenses by group_id for efficient lookup
      const participantsByGroup = participants.reduce((acc, p) => {
        if (!acc[p.group_id]) acc[p.group_id] = [];
        acc[p.group_id].push(p);
        return acc;
      }, {});

      const expensesByGroup = expenses.reduce((acc, e) => {
        if (!acc[e.group_id]) acc[e.group_id] = [];
        acc[e.group_id].push(e);
        return acc;
      }, {});

      // Transform groups with their related data
      const transformedGroups = groups.map(group => ({
        id: group.id,
        name: group.name,
        currency: group.currency || 'USD',
        createdAt: group.created_at,
        participants: participantsByGroup[group.id] || [],
        expenses: expensesByGroup[group.id] || []
      }));

      console.log('✅ Transformed groups with participants and expenses');
      setGroups(transformedGroups);
      localStorage.setItem('spenza_groups', JSON.stringify(transformedGroups));
      
    } catch (error) {
      console.error('💥 Failed to load groups:', error);
      // Keep cached groups on network error
      const cachedGroups = localStorage.getItem('spenza_groups');
      if (cachedGroups) {
        console.log('📱 Using cached groups due to network error');
        setGroups(JSON.parse(cachedGroups));
      } else {
        setGroups([]);
      }
    }
  };

  // Generic load function that tries Supabase first, then localStorage
  const loadGroups = async () => {
    if (user) {
      console.log('👤 User authenticated, loading from Supabase...');
      await loadGroupsFromSupabase();
    } else {
      console.log('👤 No user, clearing groups...');
      setGroups([]); // Clear groups for unauthenticated users
    }
  };

  const handleCreateGroup = useCallback(async (groupData) => {
    try {
      const newGroup = {
        id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: groupData.name,
        currency: groupData.currency || 'INR',
        createdAt: new Date().toISOString(),
        participants: [],
        expenses: []
      };

      console.log('Creating new group:', newGroup);

      if (user) {
        // Save to Supabase for authenticated users
        console.log('💾 Saving to Supabase...');
        const supabaseGroup = {
          id: newGroup.id, // Use our generated ID
          name: newGroup.name,
          currency: newGroup.currency,
          user_id: user.id
          // created_at and updated_at will be auto-generated by Supabase
        };
        
        const { error } = await supabase
          .from('groups')
          .insert([supabaseGroup]);
          
        if (error) {
          console.error('❌ Failed to save group to Supabase:', error.message);
          // Fallback to localStorage
          console.log('💾 Falling back to localStorage...');
          const existingGroups = JSON.parse(localStorage.getItem('spenza_groups') || '[]');
          existingGroups.push(newGroup);
          localStorage.setItem('spenza_groups', JSON.stringify(existingGroups));
        } else {
          console.log('✅ Saved to Supabase successfully');
        }
      } else {
        // Save to localStorage for non-authenticated users
        console.log('💾 Saving to localStorage...');
        const existingGroups = JSON.parse(localStorage.getItem('spenza_groups') || '[]');
        existingGroups.push(newGroup);
        localStorage.setItem('spenza_groups', JSON.stringify(existingGroups));
        console.log('✅ Saved to localStorage successfully');
      }
      
      await loadGroups(); // Reload groups
      setIsCreateDialogOpen(false);

      toast({
        title: 'Group Created Successfully! 🎉',
        description: `"${groupData.name}" is ready for expense tracking.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Failed to create group:', error);
      toast({
        title: 'Failed to Create Group',
        description: 'Something went wrong while creating your group. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const handleViewGroup = useCallback((groupId) => {
    // Navigate to group detail page
    window.location.href = `/group/${groupId}`;
  }, []);

  const handleDeleteGroup = useCallback(async (groupId) => {
    const group = groups.find(g => g.id === groupId);
    setDeleteGroupDialog({ open: true, group });
  }, [groups]);

  const confirmDeleteGroup = async () => {
    const group = deleteGroupDialog.group;
    if (!group) {
      console.error('❌ No group selected for deletion');
      return;
    }

    try {
      console.log('🗑️ Deleting group:', group.id, group.name);

      if (user) {
        // Delete from Supabase for authenticated users
        console.log('🗑️ Deleting from Supabase...');
        const { error } = await supabase
          .from('groups')
          .delete()
          .eq('id', group.id)
          .eq('user_id', user.id); // Ensure user can only delete their own groups
          
        if (error) {
          console.error('❌ Failed to delete group from Supabase:', error.message);
          // Fallback to localStorage
          console.log('🗑️ Falling back to localStorage deletion...');
          const existingGroups = JSON.parse(localStorage.getItem('spenza_groups') || '[]');
          const filteredGroups = existingGroups.filter(g => g.id !== group.id);
          localStorage.setItem('spenza_groups', JSON.stringify(filteredGroups));
        } else {
          console.log('✅ Deleted from Supabase successfully');
        }
      } else {
        // Delete from localStorage for non-authenticated users
        console.log('🗑️ Deleting from localStorage...');
        const existingGroups = JSON.parse(localStorage.getItem('spenza_groups') || '[]');
        const filteredGroups = existingGroups.filter(g => g.id !== group.id);
        localStorage.setItem('spenza_groups', JSON.stringify(filteredGroups));
        console.log('✅ Deleted from localStorage successfully');
      }

      await loadGroups(); // Reload groups
      setDeleteGroupDialog({ open: false, group: null });

      toast({
        title: 'Group Deleted ✅',
        description: `"${group.name}" has been permanently deleted.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('💥 Failed to delete group:', error);
      toast({
        title: 'Failed to Delete Group',
        description: 'Something went wrong while deleting the group. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('🔄 Signing out user...');
      
      // Clear cached user data immediately
      localStorage.removeItem('spenza_user');
      setUser(null);
      
      // Try to sign out from Supabase (but don't wait for it)
      supabase.auth.signOut().catch(err => {
        console.warn('⚠️ Supabase signout failed:', err);
      });
      
      // Clear groups for signed out user
      setGroups([]);

      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
        variant: 'default',
      });
      
      console.log('✅ Sign out completed');
    } catch (error) {
      console.error('Error signing out:', error);
      
      // Force logout even if there's an error
      localStorage.removeItem('spenza_user');
      setUser(null);
      setGroups([]); // Clear groups
      
      toast({
        title: 'Signed Out',
        description: 'You have been signed out.',
        variant: 'default',
      });
    }
  };

  return (
    <GridBackground>
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800" role="banner">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="flex-shrink-0">
              <img 
                src="/spenza-logo.png" 
                alt="Spenza Logo" 
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">
                Spenza
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Smart Expense Splitting</p>
            </div>
          </div>
          <nav aria-label="Site navigation" className="flex items-center gap-3 flex-shrink-0">
            {authLoading ? (
              <div className="w-8 h-8 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            ) : user ? (
              // Authenticated user navigation
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground truncate max-w-32">
                      {user.email?.split('@')[0]}
                    </span>
                  </div>
                  <AnimatedButton
                    onClick={handleSignOut}
                    icon={LogOut}
                    text="Sign Out"
                    className="bg-gray-600 hover:bg-gray-700"
                  />
                </div>
                <div className="sm:hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted relative group transition-all duration-200 hover:scale-110 cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                  </Button>
                </div>
              </div>
            ) : (
              // Unauthenticated user navigation
              <>
                <div className="hidden sm:flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = '/login'}
                    className="relative text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer group"
                  >
                    <span className="relative">
                      Sign In
                      <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => window.location.href = '/signup'}
                    className="relative bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer group"
                  >
                    <span className="relative">
                      Sign Up
                      <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </Button>
                </div>
                <div className="sm:hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = '/login'}
                    className="relative text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer group"
                  >
                    <span className="relative">
                      Sign In
                      <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </Button>
                </div>
              </>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="container mx-auto px-4 py-8" role="main">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <section className="text-center mb-8" aria-labelledby="welcome-heading">
            <div className="mb-6">
              <h2 id="welcome-heading" className="text-3xl sm:text-4xl font-bold mb-3">
                <span 
                  className="bg-clip-text text-transparent animate-pulse"
                  style={{
                    background: 'linear-gradient(-45deg, #0f172a, #581c87, #1e1b4b, #7c3aed, #3b82f6, #0f172a)',
                    backgroundSize: '400% 400%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'gradientShift 4s ease-in-out infinite'
                  }}
                >
                  Welcome to Spenza
                </span>
              </h2>
              <style jsx>{`
                @keyframes gradientShift {
                  0% {
                    background-position: 0% 50%;
                  }
                  50% {
                    background-position: 100% 50%;
                  }
                  100% {
                    background-position: 0% 50%;
                  }
                }
              `}</style>
              <p className="text-lg sm:text-xl font-semibold mb-4 text-muted-foreground">
                Split expenses effortlessly, settle debts instantly
              </p>

            </div>

            {groups.length === 0 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <LearnMoreButton
                    onClick={() => {
                      console.log('🔄 Create First Group button clicked, user:', user?.email);
                      if (user) {
                        console.log('✅ Opening create dialog...');
                        setIsCreateDialogOpen(true);
                      } else {
                        console.log('❌ No user, redirecting to signup...');
                        window.location.href = '/signup';
                      }
                    }}
                    text={user ? 'Create Your First Group' : 'Get Started - Sign Up'}
                    aria-describedby="create-group-description"
                  />

                </div>

                {!user && !authLoading && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      Want to sync your groups across devices?
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = '/signup'}
                        className="relative border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20 cursor-pointer group"
                      >
                        <span className="relative">
                          Create Account
                          <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full"></span>
                        </span>
                      </Button>
                      <span className="text-xs text-muted-foreground">or</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = '/login'}
                        className="relative text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer group"
                      >
                        <span className="relative">
                          Sign In
                          <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full"></span>
                        </span>
                      </Button>
                    </div>
                  </div>
                )}


              </div>
            )}
            <p id="create-group-description" className="sr-only">
              Create a new expense group to start tracking shared costs with friends, roommates, or travel companions
            </p>
          </section>

          {/* Groups Section */}
          {(isLoading || authLoading) ? (
            <div className="text-center py-12" role="status" aria-live="polite">
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"
                aria-hidden="true"
              ></div>
              <p className="text-muted-foreground mt-4">Loading groups...</p>
            </div>
          ) : groups.length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">Your Groups</h3>
                <div className="flex gap-2">
                  <AnimatedButton
                    onClick={() => user ? setIsCreateDialogOpen(true) : window.location.href = '/signup'}
                    icon={Plus}
                    text="New Group"
                    aria-label="Create a new expense group"
                  />
                </div>
              </div>

              <div
                className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                role="list"
                aria-label="Your expense groups"
              >
                {groups.map((group) => (
                  <div key={group.id} role="listitem">
                    <GroupCard
                      group={group}
                      onView={handleViewGroup}
                      onDelete={handleDeleteGroup}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Features Overview */}
              <Card className="max-w-4xl mx-auto mt-6 sm:mt-8 mb-6 sm:mb-8 border border-border bg-card text-card-foreground shadow-sm">
                <CardContent className="p-4 sm:p-8">
                  <div className="text-center mb-6 sm:mb-8 pt-2 sm:pt-4">
                    <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-2 sm:mb-3">Everything you need to manage shared expenses</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">Simple, powerful, and designed for real-world use</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    <div className="text-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 rounded-full bg-muted flex items-center justify-center">
                        <Users className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                      </div>
                      <h4 className="font-medium text-foreground mb-2 text-sm sm:text-base">Group Management</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">Create groups, add participants with custom weights, and track balances across multiple currencies</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 rounded-full bg-muted flex items-center justify-center">
                        <Calculator className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                      </div>
                      <h4 className="font-medium text-foreground mb-2 text-sm sm:text-base">Smart Splitting</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">Add expenses quickly with flexible weighted distribution and fair calculations for any scenario</p>
                    </div>
                    
                    <div className="text-center lg:col-span-1 sm:col-span-2 lg:col-start-auto sm:col-start-1 sm:mx-auto sm:max-w-xs lg:max-w-none">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 rounded-full bg-muted flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                      </div>
                      <h4 className="font-medium text-foreground mb-2 text-sm sm:text-base">Clear Insights</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">Interactive graphs, real-time calculations, and minimal settlements to keep everyone happy</p>
                    </div>
                  </div>
                </CardContent>
              </Card>


            </>
          )}
        </div>
      </main>

      {/* Create Group Dialog */}
      <CreateGroupDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateGroup={handleCreateGroup}
      />

      {/* Delete Group Dialog */}
      <DeleteGroupDialog
        open={deleteGroupDialog.open}
        onOpenChange={(open) => {
          console.log('🔄 Homepage: Dialog onOpenChange called with:', open);
          setDeleteGroupDialog({ open, group: open ? deleteGroupDialog.group : null });
        }}
        onConfirm={confirmDeleteGroup}
        groupName={deleteGroupDialog.group?.name || ''}
      />
    </GridBackground>
  );
}