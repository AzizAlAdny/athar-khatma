'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import {
  authUserKey,
  clearAuthStorage,
  saveAuthUser,
  saveAuthToken,
  logout as apiLogout,
  User
} from '@/services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User, token?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedUser = localStorage.getItem(authUserKey);
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to load auth state:', error);
        clearAuthStorage();
      } finally {
        setLoading(false);
      }
    };

    loadStoredAuth();

    const handleUnauthorized = () => {
      setUser(null);
      clearAuthStorage();
      if (typeof window !== 'undefined' && !router.pathname.startsWith('/auth/')) {
        router.push('/auth/login');
      }
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [router]);

  // Redirect unverified users to verification page
  useEffect(() => {
    if (user && !user.email_verified && router.pathname !== '/auth/verify' && !router.pathname.startsWith('/auth/')) {
      router.push('/auth/verify');
    }
  }, [user, router.pathname]);

  const login = (userData: User, token?: string) => {
    setUser(userData);
    saveAuthUser(userData);
    if (token) {
      saveAuthToken(token);
    }
  };

  const logout = () => {
    // Best-effort server-side token revocation; clear local state regardless.
    apiLogout().catch(() => {});
    setUser(null);
    clearAuthStorage();
    router.push('/auth/login');
  };

  const isVerified = user?.email_verified || false;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user,
      isVerified
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

