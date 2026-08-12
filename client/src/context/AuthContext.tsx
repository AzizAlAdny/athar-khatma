'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import {
  authTokenKey,
  authUserKey,
  clearAuthStorage,
  saveAuthToken,
  saveAuthUser,
  User
} from '@/services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedToken = localStorage.getItem(authTokenKey);
        const storedUser = localStorage.getItem(authUserKey);

        if (storedToken && storedUser) {
          setToken(storedToken);
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

  const login = (userData: any, authToken: string) => {
    setToken(authToken);
    setUser(userData);
    saveAuthToken(authToken);
    saveAuthUser(userData);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    clearAuthStorage();
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      isAuthenticated: !!token
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
