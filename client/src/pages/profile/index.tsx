'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/ui/AppShell';
import AtharProfile from '@/components/ui/AtharProfile';
import Hero from '@/components/ui/Hero';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getKhatmaProfile, KhatmaProfile, authUserKey } from '@/services/api';
import { User, Settings, ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const [profile, setProfile] = useState<KhatmaProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem(authUserKey) : null;
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const userId = user.id || 1;

      getKhatmaProfile(userId)
        .then(data => {
          setProfile(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Profile fetch error:', err);
          setError('تعذر تحميل بيانات الملف الشخصي.');
          setLoading(false);
        });
    } else {
      // In a protected route, this case shouldn't be reached as ProtectedRoute handles redirect.
      // But we keep it for safety during loading or edge cases.
      setLoading(false);
    }
  }, []);

  const profileHero = (
    <Hero
      title="ملفكِ الشخصي"
      subtitle="تابعي إنجازاتكِ، وأديري مساهماتكِ في صناعة الأثر."
      variant="primary"
      actions={
        <div className="flex gap-4">
          <Link href="/dashboard" className="bg-white text-primary border border-secondary-light/30 px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-background transition-all shadow-sm active:scale-95">
             <ArrowLeft size={18} /> العودة للوحة التحكم
          </Link>
          <button className="bg-secondary text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-secondary-dark transition-all shadow-xl shadow-secondary/10 active:scale-95">
            <Settings size={18} /> إعدادات الحساب
          </button>
        </div>
      }
      graphic={
        <div className="w-48 h-48 rounded-full bg-primary/5 flex items-center justify-center text-primary/10">
          <User size={120} />
        </div>
      }
    />
  );

  return (
    <ProtectedRoute>
      <AppShell hero={profileHero}>
        <div className="pb-20">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
               <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
               <p className="text-primary-muted font-bold">جاري تحميل ملفكِ الشخصي...</p>
            </div>
          ) : error ? (
            <div className="max-w-md mx-auto text-center py-20 px-6 bg-white rounded-[2.5rem] shadow-sm border border-secondary-light/20">
               <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-black">!</span>
               </div>
               <h3 className="text-xl font-black text-primary mb-2">عذراً، حدث خطأ</h3>
               <p className="text-primary-muted font-medium mb-8">{error}</p>
               <Link href="/dashboard" className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm">العودة للرئيسية</Link>
            </div>
          ) : profile ? (
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(94,32,59,0.02)] border border-secondary-light/20">
               <AtharProfile
                 data={{
                   user: profile.user,
                   impact_score: profile.impact_score || 0,
                   achievements: (profile.achievements || []) as any
                 }}
                 isPage
               />
            </div>
          ) : null}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
