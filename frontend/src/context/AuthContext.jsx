import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

export const LOCAL_DEMO_PERSONAS = [
  {
    id: 'a5feee45-d02a-488d-8e49-a4f7a2e5fd83',
    username: 'guest_explorer',
    email: 'guest@skillswap.local',
    password: 'GuestPassword123!',
    fullName: 'Guest Explorer',
    role: 'Instant Guest Mode (Zero setup)',
    bio: 'Exploring SkillSwap in local guest mode. Interested in design, coding, and creative arts.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    location: 'Local Workspace',
    preferredLearningMode: 'flexible',
  },
  {
    id: '42f7e518-7bd0-4f7e-b83b-8d65da9dfafb',
    username: 'maya_design',
    email: 'maya@skillswap.local',
    password: 'Password123!',
    fullName: 'Maya Lin',
    role: 'UI/UX & Design Systems Lead',
    bio: 'Product designer focusing on accessible typography, design tokens, and playful micro-interactions.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    location: 'San Francisco, CA',
    preferredLearningMode: 'remote',
  },
  {
    id: '7273150a-9be4-49a0-aca2-fb6a04c20604',
    username: 'lucas_dev',
    email: 'lucas@skillswap.local',
    password: 'Password123!',
    fullName: 'Lucas Vance',
    role: 'Full Stack Engineer & Rust Enthusiast',
    bio: 'Full stack engineer curious about distributed systems, Rust, and modern component design.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    location: 'Seattle, WA',
    preferredLearningMode: 'flexible',
  },
  {
    id: 'cc6bb12c-6373-4c99-a5e3-a774f5844019',
    username: 'julian_music',
    email: 'julian@skillswap.local',
    password: 'Password123!',
    fullName: 'Julian Hayes',
    role: 'Electronic Music Producer',
    bio: 'Sound designer and analog synth enthusiast. Excited to teach beat-making and learn culinary arts.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    location: 'Austin, TX',
    preferredLearningMode: 'remote',
  }
];

const LOCAL_STORAGE_KEY = 'skillswap_local_account';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLocalGuest, setIsLocalGuest] = useState(false);

  // Re-fetch user profile from public.profiles with auto-healing if missing
  const fetchProfile = useCallback(async (userId) => {
    if (!userId || !isSupabaseConfigured()) {
      setProfile(null);
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Profile fetch note:', error.message);
      }

      if (data) {
        setProfile(data);
        return data;
      }

      return null;
    } catch (err) {
      console.warn('Profile error:', err);
      return null;
    }
  }, []);

  // Hydrate session and setup real-time auth change listener
  useEffect(() => {
    // Check if user was in local account mode
    try {
      const savedLocal = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedLocal) {
        const parsed = JSON.parse(savedLocal);
        if (parsed?.user && parsed?.profile) {
          setUser(parsed.user);
          setProfile(parsed.profile);
          setIsLocalGuest(true);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not read local account cache:', e);
    }

    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // 1. Get initial active Supabase session
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      setSession(initialSession);
      const currentUser = initialSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        let userProf = await fetchProfile(currentUser.id);
        // Auto-heal missing profile row to prevent blank pages
        if (!userProf) {
          const fallbackUsername = (currentUser.email?.split('@')[0] || 'member')
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '');
          try {
            await supabase.from('profiles').upsert({
              id: currentUser.id,
              username: fallbackUsername,
              full_name: currentUser.user_metadata?.full_name || fallbackUsername,
              onboarding_completed: false,
              time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
              preferred_learning_mode: 'flexible',
            }, { onConflict: 'id' });
            userProf = await fetchProfile(currentUser.id);
          } catch (healErr) {
            console.warn('Auto-heal profile note:', healErr.message);
          }
        }
      }
      setLoading(false);
    });

    // 2. Subscribe to auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        // If in local guest mode, do not override unless explicit sign in happened
        if (localStorage.getItem(LOCAL_STORAGE_KEY) && !currentSession) {
          return;
        }

        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          setIsLocalGuest(false);
          try {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          } catch (e) {}

          let userProf = await fetchProfile(currentUser.id);
          if (!userProf) {
            const fallbackUsername = (currentUser.email?.split('@')[0] || 'member')
              .toLowerCase()
              .replace(/[^a-z0-9_]/g, '');
            try {
              await supabase.from('profiles').upsert({
                id: currentUser.id,
                username: fallbackUsername,
                full_name: currentUser.user_metadata?.full_name || fallbackUsername,
                onboarding_completed: false,
                time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
                preferred_learning_mode: 'flexible',
              }, { onConflict: 'id' });
              await fetchProfile(currentUser.id);
            } catch (err) {
              console.warn('Profile sync note:', err.message);
            }
          }
        } else if (!localStorage.getItem(LOCAL_STORAGE_KEY)) {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign in as Local Account / Guest Mode
  const signInAsGuest = async (personaIdentifier = 'guest_explorer') => {
    setLoading(true);
    const persona = LOCAL_DEMO_PERSONAS.find(
      (p) => p.username === personaIdentifier || p.id === personaIdentifier
    ) || LOCAL_DEMO_PERSONAS[0];

    // Try signing in with Supabase Auth first so real authenticated tokens are active
    if (isSupabaseConfigured() && persona.password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: persona.email,
          password: persona.password,
        });

        if (!error && data?.session && data?.user) {
          setSession(data.session);
          setUser(data.user);
          const prof = await fetchProfile(data.user.id);
          setIsLocalGuest(true);
          try {
            localStorage.setItem(
              LOCAL_STORAGE_KEY,
              JSON.stringify({ user: data.user, profile: prof, personaKey: persona.username })
            );
          } catch (e) {}
          setLoading(false);
          return { user: data.user, profile: prof, isLocalGuest: true };
        }
      } catch (authErr) {
        console.warn('Supabase guest auth fallback to local store:', authErr.message);
      }
    }

    // Direct local account state fallback (works 100% offline or if auth is down)
    const localUserObj = {
      id: persona.id,
      email: persona.email,
      user_metadata: {
        full_name: persona.fullName,
        username: persona.username,
      },
      app_metadata: { provider: 'local_guest' },
    };

    const localProfileObj = {
      id: persona.id,
      username: persona.username,
      full_name: persona.fullName,
      avatar_url: persona.avatarUrl,
      bio: persona.bio,
      location: persona.location,
      time_zone: 'UTC',
      preferred_learning_mode: persona.preferredLearningMode || 'flexible',
      onboarding_completed: true,
      rating_avg: 5.0,
      rating_count: 3,
      is_local_guest: true,
    };

    setUser(localUserObj);
    setProfile(localProfileObj);
    setIsLocalGuest(true);
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ user: localUserObj, profile: localProfileObj, personaKey: persona.username })
      );
    } catch (e) {}

    setLoading(false);
    return { user: localUserObj, profile: localProfileObj, isLocalGuest: true };
  };

  // Sign up with Supabase Auth
  const signUp = async (email, password, { fullName, username }) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured in .env');
    }

    // Clean up local guest mode if active
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {}
    setIsLocalGuest(false);

    const trimmedEmail = (email || '').trim().toLowerCase();
    const cleanUsername = (username || trimmedEmail.split('@')[0])
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '');

    if (!cleanUsername || cleanUsername.length < 3) {
      throw new Error('Username must be at least 3 characters and contain only letters, numbers, or underscores.');
    }

    // 1. Proactively check if username is already taken to avoid cryptic 500 trigger failure
    try {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', cleanUsername)
        .maybeSingle();

      if (existingUser) {
        throw new Error(`Username "@${cleanUsername}" is already taken. Please choose another username.`);
      }
    } catch (checkErr) {
      if (checkErr.message?.includes('already taken')) {
        throw checkErr;
      }
    }

    // 2. Perform Supabase Auth SignUp
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          full_name: fullName?.trim() || cleanUsername,
          username: cleanUsername,
        },
      },
    });

    if (error) {
      if (error.message?.includes('Database error saving new user')) {
        throw new Error('Could not create account: this username may already be in use. Please choose another username.');
      }
      if (error.message?.includes('User already registered') || error.message?.includes('already registered')) {
        throw new Error('An account with this email address already exists. Please sign in instead.');
      }
      throw error;
    }

    // 3. Supabase duplicate email detection when email enumeration protection is on
    if (data?.user && (!data.user.identities || data.user.identities.length === 0)) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    // 4. Ensure profile row exists immediately if session was established
    let userProfile = null;
    if (data?.user && data?.session) {
      setSession(data.session);
      setUser(data.user);

      try {
        const { data: existingProf } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!existingProf) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            username: cleanUsername,
            full_name: fullName?.trim() || cleanUsername,
            onboarding_completed: false,
            time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
            preferred_learning_mode: 'flexible',
          }, { onConflict: 'id' });
        }
      } catch (upsertErr) {
        console.warn('Profile fallback sync note:', upsertErr.message);
      }
      userProfile = await fetchProfile(data.user.id);
    }

    return { data, profile: userProfile, session: data?.session, user: data?.user };
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured in .env');
    }

    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {}
    setIsLocalGuest(false);

    const cleanEmail = (email || '').trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      if (error.message?.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please verify your credentials or create a new account.');
      }
      throw error;
    }

    let userProfile = null;
    if (data?.session && data?.user) {
      setSession(data.session);
      setUser(data.user);
      userProfile = await fetchProfile(data.user.id);
    }

    return { data, profile: userProfile, session: data?.session, user: data?.user };
  };

  // Sign out (handles both Supabase session and local account mode)
  const signOut = async () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {}
    setIsLocalGuest(false);

    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Signout note:', e);
      }
    }

    setUser(null);
    setSession(null);
    setProfile(null);
  };

  // Forgot Password / Password Reset Email
  const resetPassword = async (email) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured in .env');
    }

    const redirectTo = `${window.location.origin}/reset-password`;
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) throw error;
    return data;
  };

  // Update password
  const updatePassword = async (newPassword) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured in .env');
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return data;
  };

  // Helper to re-fetch profile on demand
  const refreshProfile = async () => {
    if (user?.id) {
      return await fetchProfile(user.id);
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    isLocalGuest,
    signInAsGuest,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    refreshProfile,
    isAuthenticated: Boolean(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
