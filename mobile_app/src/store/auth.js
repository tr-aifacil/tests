import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import supabase from '../lib/supabase';
import { registerPushToken } from '../lib/push';

const AuthContext = createContext({
  session: null,
  profile: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {}
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const pushRegisteredRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        setSession(session);
        setLoading(false);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = useCallback(
    async (userId) => {
      if (!userId) {
        setProfile(null);
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Failed to load profile', error);
        return null;
      }

      if (data) {
        setProfile(data);
        return data;
      }

      const fallbackName = session?.user?.user_metadata?.full_name ||
        session?.user?.email?.split('@')[0] ||
        'Cliente Pilates';

      const { data: inserted, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: fallbackName,
          role: 'client'
        })
        .select()
        .maybeSingle();

      if (insertError) {
        console.warn('Failed to create default profile', insertError);
        return null;
      }

      setProfile(inserted);
      return inserted;
    },
    [session?.user?.email, session?.user?.user_metadata?.full_name]
  );

  useEffect(() => {
    if (!session?.user?.id) {
      pushRegisteredRef.current = false;
      return;
    }

    fetchProfile(session.user.id);
  }, [session?.user?.id, fetchProfile]);

  useEffect(() => {
    if (!session?.user?.id || pushRegisteredRef.current === true) {
      return;
    }

    pushRegisteredRef.current = true;
    registerPushToken(session.user.id).catch((error) => {
      console.warn('Push token registration error', error);
    });
  }, [session?.user?.id]);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      throw error;
    }

    if (data.session?.user?.id) {
      await fetchProfile(data.session.user.id);
    }

    return data.session;
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      profile,
      loading,
      signIn,
      signOut,
      refreshProfile: fetchProfile
    }),
    [session, profile, loading, signIn, signOut, fetchProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
