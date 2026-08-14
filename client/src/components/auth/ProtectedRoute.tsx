'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  /** When true, requires the user to have a verified email. */
  requireVerified?: boolean;
}

export default function ProtectedRoute({ children, allowedRoles, requireVerified = true }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (requireVerified && user && !user.email_verified) {
        // Authenticated but unverified — send to the verification screen.
        router.push('/auth/verify');
      } else if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
        // Redirect if user doesn't have the required role
        router.push('/dashboard');
      }
    }
  }, [loading, isAuthenticated, user, router, allowedRoles, requireVerified]);

  if (loading || !isAuthenticated || (requireVerified && user && !user.email_verified) || (allowedRoles && user?.role && !allowedRoles.includes(user.role))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}

