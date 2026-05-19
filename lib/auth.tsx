'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type AuthUser = {
  name: string;
  email: string;
  provider: 'Credentials' | 'Google' | 'Facebook';
};

type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  signInWithProvider: (provider: 'Google' | 'Facebook') => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const STORAGE_KEY = 'thesismate_auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const saveUser = useCallback((currentUser: AuthUser) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
    setUser(currentUser);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    if (!email.includes('@') || password.trim().length < 6) {
      setError('Please enter a valid email and at least 6 characters password.');
      return false;
    }

    const currentUser = { name: 'Student Researcher', email, provider: 'Credentials' as const };
    saveUser(currentUser);
    return true;
  }, [saveUser]);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    setError(null);
    if (!name.trim() || !email.includes('@') || password.trim().length < 6) {
      setError('Enter your full name, a valid email, and a password with at least 6 characters.');
      return false;
    }

    const currentUser = { name: name.trim(), email, provider: 'Credentials' as const };
    saveUser(currentUser);
    return true;
  }, [saveUser]);

  const signInWithProvider = useCallback(async (provider: 'Google' | 'Facebook') => {
    setError(null);
    const currentUser = {
      name: provider === 'Google' ? 'Google Scholar User' : 'Facebook Researcher',
      email: provider === 'Google' ? 'google.user@example.com' : 'facebook.user@example.com',
      provider,
    } as AuthUser;

    saveUser(currentUser);
  }, [saveUser]);

  const signOut = useCallback(() => {
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      error,
      signIn,
      signUp,
      signOut,
      signInWithProvider,
    }),
    [error, signIn, signInWithProvider, signOut, signUp, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
