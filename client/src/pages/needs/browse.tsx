'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/ui/AppShell';
import Hero from '@/components/ui/Hero';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getSeekerNeeds, SeekerNeed, markNeedInProgress } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { MapPin, HelpCircle, MessageCircle, AlertCircle, Clock, CheckCircle2, Phone, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function BrowseNeeds() {
  const [needs, setNeeds] = useState<SeekerNeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadNeeds = () => {
    setLoading(true);
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
  };

  useEffect(() => {
    loadNeeds();
  }, []);

  const handleClaim = async (id: number) => {
    setClaimingId(id);
    try {
      await markNeedInProgress(id);
      loadNeeds(); // Refresh to update sections
    } catch (err: any) {
      alert(err.message || 'فشل استلام الطلب');
    } finally {
      setClaimingId(null);
    }
  };

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

  const renderNeedItem = (need: SeekerNeed, showChat: boolean, showClaim: boolean, showCall: boolean) => (
    <div key={need.id} className="group rounded-3xl md:rounded-[40px] border border-secondary-light/30 bg-white p-4 sm:p-6 md:p-8 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center justify-between">
        <div className="flex items-start gap-3 sm:gap-5 flex-1 min-w-0">
          <div className="flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl sm:rounded-3xl bg-background text-accent shadow-sm text-xl sm:text-2xl group-hover:scale-105 transition-transform">
            {need.gift?.icon === 'book-open' ? '📖' : <MapPin size={22} className="sm:w-6 sm:h-6" />}
          </div>
          <div className="text-right flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-primary truncate">{need.gift?.name || 'طلب مساعدة'}</h3>
              {(need.messages_count ?? 0) > 0 && (
                <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center text-accent animate-pulse shrink-0">
                  <MessageCircle size={10} />
                </div>
              )}
            </div>
            <p className="text-primary-muted text-xs sm:text-sm font-medium mt-1 leading-relaxed line-clamp-2">{need.description}</p>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-primary-muted font-bold mt-2.5 sm:mt-3">
              <MapPin size={12} className="text-secondary shrink-0" />
              <span>{need.city || 'الرياض'}</span>
              {need.neighborhood && (
                <>
                  <span className="opacity-50">•</span>
                  <span>{need.neighborhood}</span>
                </>
              )}
              <span className="opacity-50">•</span>
              <span>منذ {need.created_at_human || 'قليل'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full lg:w-auto pt-2 lg:pt-0 border-t border-secondary-light/10 lg:border-t-0">
          {showChat && (
            <Link
              href={user?.id ? `/chat/need/${need.id}` : '/auth/login'}
              className="flex-1 lg:flex-none bg-accent hover:bg-accent-dark text-white rounded-2xl px-4 sm:px-6 py-3 text-xs font-black shadow-lg shadow-accent/10 transition-all active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap"
            >
              <MessageCircle size={14} /> {need.status === 'open' ? 'مراسلة صاحبة الطلب' : 'المحادثات'}
            </Link>
          )}

          {showClaim && (
             <Button
                onClick={() => handleClaim(need.id)}
                disabled={claimingId === need.id}
                className="flex-1 lg:flex-none bg-secondary text-white rounded-2xl px-4 sm:px-6 py-3 text-xs font-black shadow-lg shadow-secondary/10 transition-all active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap"
             >
                {claimingId === need.id ? <Loader2 size={14} className="animate-spin" /> : <><CheckCircle2 size={14} /> استلام الطلب</>}
             </Button>
          )}

          {showCall && (
             <Link
                href={`/chat/need/${need.id}`}
                className="flex-1 lg:flex-none bg-white border border-secondary-light/40 text-primary hover:bg-background rounded-2xl px-4 sm:px-6 py-3 text-xs font-black transition-all active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap"
             >
                <Phone size={14} className="text-secondary" /> مكالمة صوتية
             </Link>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute allowedRoles={['khatma', 'admin']}>
      <AppShell hero={needsHero}>
        <div className="space-y-8 sm:space-y-12">
          <div className="flex flex-col gap-2 sm:gap-4 md:flex-row md:items-center md:justify-between px-2">
            <div className="text-right">
              <h2 className="text-xl sm:text-2xl font-black text-primary">طلبات المحتاجين</h2>
              <p className="text-xs sm:text-sm text-primary-muted font-bold mt-0.5">مبادرات منتقاة لتقديم عطاء ملموس للمجتمع.</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-bold p-5 rounded-3xl flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0" />
              {error}
            </div>
          )}

          {loading && needs.length === 0 ? (
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
                    {available.map(n => renderNeedItem(n, true, true, false))}
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
                    {myActiveHelping.map(n => renderNeedItem(n, true, false, true))}
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
                    {myCompletedHelp.map(n => renderNeedItem(n, false, false, false))}
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
