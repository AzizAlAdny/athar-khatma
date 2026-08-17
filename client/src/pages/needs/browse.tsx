'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/ui/AppShell';
import Hero from '@/components/ui/Hero';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getNeeds, Need } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { MapPin, HelpCircle, MessageCircle, AlertCircle } from 'lucide-react';

export default function BrowseNeeds() {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

  useEffect(() => {
    getNeeds()
      .then(data => {
        setNeeds(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Needs fetch error:', err);
        setError('تعذر تحميل الطلبات، يرجى المحاولة لاحقاً.');
        setLoading(false);
      });
  }, []);


  const needsHero = (
    <Hero
      title="طلبات تحتاج أثركِ"
      subtitle="اكتشفي الطلبات المجتمعية التي تنتظر دعمك وشاركي في صناعة أثر حقيقي يدوم."
      variant="accent"
      graphic={
        <div className="w-48 h-48 rounded-full bg-accent/5 flex items-center justify-center text-accent/20">
          <HelpCircle size={120} />
        </div>
      }
    />
  );

  return (
    <ProtectedRoute allowedRoles={['khatma', 'admin']}>
      <AppShell hero={needsHero}>
        <div className="space-y-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between px-2">
            <div className="text-right">
              <h2 className="text-2xl font-black text-primary">طلبات المحتاجين</h2>
              <p className="text-sm text-primary-muted font-bold">مبادرات منتقاة لتقديم عطاء ملموس للمجتمع.</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-bold p-5 rounded-3xl flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
              <p className="text-primary-muted font-bold">جاري تحميل الطلبات...</p>
            </div>
          ) : needs.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {needs.map((need) => (
                <div key={need.id} className="group rounded-[32px] md:rounded-[40px] border border-secondary-light/30 bg-white p-6 md:p-8 shadow-sm transition-all hover:shadow-md">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between">
                    <div className="flex items-start gap-5">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-background text-accent shadow-sm text-2xl group-hover:scale-110 transition-transform">
                        {need.gift?.icon === 'book-open' ? '📖' : <MapPin size={24} />}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-primary">{need.gift?.name || 'طلب مساعدة'}</h3>
                          {need.messages_count > 0 && (
                            <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center text-accent animate-pulse">
                              <MessageCircle size={10} />
                            </div>
                          )}
                        </div>
                        <p className="text-primary-muted text-sm font-medium mt-1 leading-relaxed line-clamp-2">{need.description}</p>
                        <div className="flex items-center gap-2 text-xs text-primary-muted font-bold mt-3">
                          <MapPin size={12} className="text-secondary" />
                          <span>{need.city || 'الرياض'}</span>
                          {need.neighborhood && (
                            <>
                              <span className="mx-1 opacity-50">•</span>
                              <span>{need.neighborhood}</span>
                            </>
                          )}
                          <span className="mx-1 opacity-50">•</span>
                          <span>منذ {need.created_at_human || 'قليل'}</span>
                        </div>
                      </div>
                    </div>
                                        <div className="flex items-center gap-3">
                      <Link
                        href={user?.id ? `/chat/need/${need.id}` : '/auth/login'}
                        className="flex-1 md:flex-none bg-accent hover:bg-[#0e3522] text-white rounded-2xl px-6 py-3.5 text-xs font-black shadow-lg shadow-accent/10 transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <MessageCircle size={14} /> مراسلة صاحبة الطلب
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="col-span-full rounded-[40px] border border-dashed border-secondary-light bg-white p-16 text-center shadow-sm">
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-6">
                <HelpCircle size={24} className="text-secondary-muted" />
              </div>
              <p className="text-primary-muted font-bold text-lg">لا توجد طلبات احتياج حالياً..</p>
              <p className="text-secondary-muted text-sm mt-1">كوني أنتِ المبادرة الأولى في صناعة الأثر!</p>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}


