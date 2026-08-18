'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/ui/AppShell';
import Hero from '@/components/ui/Hero';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getSeekerNeeds, SeekerNeed } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { MapPin, HelpCircle, MessageCircle, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function BrowseNeeds() {
  const [needs, setNeeds] = useState<SeekerNeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    getSeekerNeeds()
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

  const available = needs.filter(n => !n.status || n.status === 'open');
  const myActiveHelping = needs.filter(n => n.status === 'in_progress' && n.fulfilled_by_id === user?.id);
  const myCompletedHelp = needs.filter(n => n.status === 'fulfilled' && n.fulfilled_by_id === user?.id);

  const renderNeedItem = (need: SeekerNeed, showChat: boolean) => (
    <div key={need.id} className="group rounded-[32px] md:rounded-[40px] border border-secondary-light/30 bg-white p-6 md:p-8 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between">
        <div className="flex items-start gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-background text-accent shadow-sm text-2xl group-hover:scale-110 transition-transform">
            {need.gift?.icon === 'book-open' ? '📖' : <MapPin size={24} />}
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-primary">{need.gift?.name || 'طلب مساعدة'}</h3>
              {(need.messages_count ?? 0) > 0 && (
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

        {showChat && (
          <div className="flex items-center gap-3">
            <Link
              href={user?.id ? `/chat/need/${need.id}` : '/auth/login'}
              className="flex-1 md:flex-none bg-accent hover:bg-[#0e3522] text-white rounded-2xl px-6 py-3.5 text-xs font-black shadow-lg shadow-accent/10 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <MessageCircle size={14} /> {need.status === 'open' ? 'مراسلة صاحبة الطلب' : 'المحادثات'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <ProtectedRoute allowedRoles={['khatma', 'admin']}>
      <AppShell hero={needsHero}>
        <div className="space-y-12">
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
          ) : (
            <div className="space-y-16">
              {/* 1. Available Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent">
                    <Clock size={20} />
                  </div>
                  <h3 className="text-xl font-black text-primary">طلبات متاحة</h3>
                </div>
                {available.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {available.map(n => renderNeedItem(n, true))}
                  </div>
                ) : (
                  <div className="py-10 text-center bg-background/30 rounded-[2.5rem] border border-dashed border-secondary-light/30">
                    <p className="text-primary-muted font-bold text-sm">لا توجد طلبات متاحة حالياً.</p>
                  </div>
                )}
              </div>

              {/* 2. My Active Helping Section */}
              {myActiveHelping.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 px-2 border-t border-background pt-12">
                    <div className="w-10 h-10 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary">
                      <Clock size={20} />
                    </div>
                    <h3 className="text-xl font-black text-primary">طلبات قيد التنفيذ (بواسطتكِ)</h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {myActiveHelping.map(n => renderNeedItem(n, true))}
                  </div>
                </div>
              )}

              {/* 3. My Completed Help Section */}
              {myCompletedHelp.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 px-2 border-t border-background pt-12">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                      <CheckCircle2 size={20} />
                    </div>
                    <h3 className="text-xl font-black text-primary">طلبات لبيتها</h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {myCompletedHelp.map(n => renderNeedItem(n, false))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
