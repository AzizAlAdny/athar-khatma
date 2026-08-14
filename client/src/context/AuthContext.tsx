'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import {
  authUserKey,
  clearAuthStorage,
  saveAuthUser,
  User
} from '@/services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
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
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to load auth state:', error);
        clearAuthStorage();
      } finally {
        setLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    saveAuthUser(userData);
  };

  const logout = () => {
    setUser(null);
    clearAuthStorage();
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user
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

