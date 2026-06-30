'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { GridBackground } from '../components/ui/grid-background';
import { ThemeToggle } from '../components/shared/theme-toggle';
import { GroupCard } from '../components/group';
import { CreateGroupDialog } from '../components/group';
import { DeleteGroupDialog } from '../components/ui/confirmation-dialog';
import { useToast } from '../hooks/use-toast';
import { createClient } from '../utils/supabase/client';
import { Plus, Users, Calculator, TrendingUp, LogOut, User, FolderPlus } from 'lucide-react';
import { AnimatedButton } from '../components/ui/animated-button';
import { LearnMoreButton } from '../components/ui/learn-more-button';
import { LandingPage } from '../components/landing/LandingPage';

const withTimeout = (p, ms = 5000) =>
  Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const [groups, setGroups] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteGroupDialog, setDeleteGroupDialog] = useState({ open: false, group: null });
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [supabase, setSupabase] = useState(null);

  useEffect(() => {
    try {
      const client = createClient();
      setSupabase(client);
    } catch (error) {
      console.error('Failed to initialize Supabase:', error);
      toast({ title: 'Configuration Error', description: 'Unable to connect to database.', variant: 'destructive' });
      setAuthLoading(false);
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!supabase) return;

    const initializeAuth = async () => {
      console.log('🚀 Starting initialization...');
      
      try {
        // Check for cached user first
        const cachedUserRaw = localStorage.getItem('spenza_user');
        if (cachedUserRaw) {
          try {
            const parsed = JSON.parse(cachedUserRaw);
            if (parsed?.id) {
              console.log('📱 Found cached user:', parsed.email);
              setUser(parsed);
              
              // Load cached groups immediately
              const cachedGroups = localStorage.getItem('spenza_groups');
              if (cachedGroups) {
                console.log('📱 Loading cached groups');
                setGroups(JSON.parse(cachedGroups));
              }
            }
          } catch (error) {
            console.warn('⚠️ Invalid cached data, clearing...');
            localStorage.removeItem('spenza_user');
            localStorage.removeItem('spenza_groups');
          }
        }

        // Verify with Supabase
        console.log('🔍 Checking Supabase session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('⚠️ Auth error:', error.message);
        } else if (session?.user) {
          console.log('✅ User verified:', session.user.email);
          setUser(session.user);
          localStorage.setItem('spenza_user', JSON.stringify(session.user));
          await loadGroups(session.user);
        } else {
          console.log('ℹ️ No session found');
          if (!cachedUserRaw) {
            setUser(null);
            setGroups([]);
          }
        }
      } catch (error) {
        console.error('💥 Initialization error:', error);
      } finally {
        console.log('✅ Initialization complete');
        setAuthLoading(false);
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth event:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        localStorage.setItem('spenza_user', JSON.stringify(session.user));
        await loadGroups(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setGroups([]);
        localStorage.removeItem('spenza_user');
        localStorage.removeItem('spenza_groups');
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const loadGroups = useCallback(async (currentUser = user) => {
    if (!supabase || !currentUser?.id) {
      console.log('⚠️ No user or supabase, clearing groups');
      setGroups([]);
      return;
    }

    try {
      console.log('📂 Loading groups for user:', currentUser.email);
      
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (groupsError) {
        console.error('❌ Supabase error:', groupsError.message);
        throw groupsError;
      }

      if (!groupsData?.length) {
        console.log('ℹ️ No groups found');
        setGroups([]);
        localStorage.setItem('spenza_groups', JSON.stringify([]));
        return;
      }

      console.log('✅ Loaded', groupsData.length, 'groups');

      const groupIds = groupsData.map(g => g.id);
      const [participantsResult, expensesResult] = await Promise.all([
        supabase.from('participants').select('*').in('group_id', groupIds),
        supabase.from('expenses').select('*').in('group_id', groupIds)
      ]);

      const participants = participantsResult.data || [];
      const expenses = expensesResult.data || [];

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

      const transformedGroups = groupsData.map(group => ({
        id: group.id,
        name: group.name,
        currency: group.currency || 'USD',
        createdAt: group.created_at,
        participants: participantsByGroup[group.id] || [],
        expenses: expensesByGroup[group.id] || []
      }));

      console.log('✅ Transformed groups with data');
      setGroups(transformedGroups);
      localStorage.setItem('spenza_groups', JSON.stringify(transformedGroups));
    } catch (error) {
      console.error('💥 Failed to load groups:', error);
      
      // Try to use cached data on error
      const cached = localStorage.getItem('spenza_groups');
      if (cached) {
        try {
          console.log('📱 Using cached groups due to error');
          setGroups(JSON.parse(cached));
        } catch (parseError) {
          console.error('Failed to parse cached groups:', parseError);
          setGroups([]);
        }
      } else {
        setGroups([]);
      }
      
      toast({ 
        title: 'Loading Error', 
        description: 'Failed to load groups. Using cached data if available.', 
        variant: 'destructive' 
      });
    }
  }, [user, supabase, toast]);

  const handleCreateGroup = useCallback(async (groupData) => {
    if (!supabase || !user) { router.push('/signup'); return; }
    try {
      const newGroup = { id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, name: groupData.name, currency: groupData.currency || 'INR', user_id: user.id };
      const { error } = await supabase.from('groups').insert([newGroup]);
      if (error) throw error;
      await loadGroups();
      setIsCreateDialogOpen(false);
      toast({ title: 'Group Created Successfully! 🎉', description: `"${groupData.name}" is ready for expense tracking.`, variant: 'default' });
    } catch (error) {
      console.error('Failed to create group:', error);
      toast({ title: 'Failed to Create Group', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    }
  }, [user, supabase, toast, loadGroups, router]);

  const handleViewGroup = useCallback((groupId) => { router.push(`/group/${groupId}`); }, [router]);

  const handleDeleteGroup = useCallback(async (groupId) => {
    const group = groups.find(g => g.id === groupId);
    setDeleteGroupDialog({ open: true, group });
  }, [groups]);

  const confirmDeleteGroup = useCallback(async () => {
    const group = deleteGroupDialog.group; if (!group || !supabase || !user) return;
    try {
      const { error } = await supabase.from('groups').delete().eq('id', group.id).eq('user_id', user.id);
      if (error) throw error;
      await loadGroups();
      setDeleteGroupDialog({ open: false, group: null });
      toast({ title: 'Group Deleted ✅', description: `"${group.name}" has been permanently deleted.`, variant: 'default' });
    } catch (error) {
      console.error('Failed to delete group:', error);
      toast({ title: 'Failed to Delete Group', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    }
  }, [deleteGroupDialog.group, supabase, user, toast, loadGroups]);

  const handleSignOut = useCallback(async () => {
    try { if (supabase) await supabase.auth.signOut(); } catch {}
    localStorage.removeItem('spenza_user');
    localStorage.removeItem('spenza_groups');
    setUser(null); setGroups([]);
    toast({ title: 'Signed Out', description: 'You have been successfully signed out.', variant: 'default' });
  }, [supabase, toast]);

  if (authLoading || isLoading) {
    return (
      <GridBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading Spenza...</p>
          </div>
        </div>
      </GridBackground>
    );
  }

  // If not authenticated, show the premium landing page
  if (!user) {
    return <LandingPage />;
  }

  // Authenticated Dashboard State
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
                    onClick={() => router.push('/login')}
                    className="relative text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer group"
                  >
                    <span className="relative">
                      Sign In
                      <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => router.push('/signup')}
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
                    onClick={() => router.push('/login')}
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
          {/* Groups Section (Dashboard Empty State & List) */}
          {groups.length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">Your Groups</h3>
                <div className="flex gap-2">
                  <AnimatedButton
                    onClick={() => user ? setIsCreateDialogOpen(true) : router.push('/signup')}
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
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <FolderPlus className="w-10 h-10 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Welcome to your Dashboard</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                You don't have any groups yet. Create your first group to start tracking expenses with friends, roommates, or colleagues.
              </p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 h-auto text-lg rounded-full transition-all hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" /> Create Your First Group
              </Button>
            </div>
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
