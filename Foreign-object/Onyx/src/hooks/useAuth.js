import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [session,  setSession]  = useState(null);
  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    // Get existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else { setLoading(false); setAuthReady(true); }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); setAuthReady(true); }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error) setProfile(data);
    } catch (e) {
      console.warn('Profile fetch error:', e.message);
    } finally {
      setLoading(false);
      setAuthReady(true);
    }
  }

  // ── Sign Up ──
  async function signUp({ email, password, fullName }) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    // Insert profile row
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id:         data.user.id,
        full_name:  fullName.trim(),
        email:      email.trim().toLowerCase(),
        created_at: new Date().toISOString(),
      });
      if (profileError) console.warn('Profile insert error:', profileError.message);
    }
    return data;
  }

  // ── Sign In ──
  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  // ── Sign Out ──
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  // ── Update profile ──
  async function updateProfile(updates) {
    if (!session) return;
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', session.user.id)
      .select()
      .single();
    if (error) throw error;
    setProfile(data);
    return data;
  }

  return (
    <AuthContext.Provider value={{
      session,
      profile,
      loading,
      authReady,
      user: session?.user ?? null,
      signUp,
      signIn,
      signOut,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
