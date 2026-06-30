import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getSupabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  phone: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  authReady: boolean;
  user: User | null;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setAuthReady(true);
      setLoading(false);
      return;
    }

    sb.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
      setAuthReady(true);
      setLoading(false);
    });

    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const sb = getSupabase();
    if (!sb) return;
    const { data } = await sb
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
  }

  async function signUp(email: string, password: string, fullName: string) {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.');

    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    if (!data.user && !data.session) {
      throw new Error('Account created but could not sign in automatically. Please check your email for a confirmation link.');
    }
  }

  async function signIn(email: string, password: string) {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.');

    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signOut() {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
  }

  async function updateProfile(updates: Partial<Profile>) {
    const sb = getSupabase();
    if (!sb || !session?.user) return;
    const { error } = await sb
      .from('profiles')
      .update(updates)
      .eq('id', session.user.id);
    if (error) throw error;
    setProfile(prev => prev ? { ...prev, ...updates } : null);
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    const sb = getSupabase();
    if (!sb || !session?.user?.email) throw new Error('Not authenticated');

    const { error: signInError } = await sb.auth.signInWithPassword({
      email: session.user.email,
      password: currentPassword,
    });
    if (signInError) throw new Error('Current password is incorrect.');

    const { error: updateError } = await sb.auth.updateUser({ password: newPassword });
    if (updateError) throw updateError;
  }

  return (
    <AuthContext.Provider
      value={{
        session, profile, loading, authReady,
        user: session?.user ?? null,
        signUp, signIn, signOut, updateProfile, changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
