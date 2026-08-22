'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/ui/AppShell';
import Hero from '@/components/ui/Hero';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getSeekerNeeds, SeekerNeed, markNeedInProgress, markNeedFulfilled } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { MapPin, HelpCircle, MessageCircle, AlertCircle, Clock, CheckCircle2, Phone, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function BrowseNeeds() {
  const [needs, setNeeds] = useState<SeekerNeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [completingId, setCompletingId] = useState<number | null>(null);
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

  const handleComplete = async (id: number) => {
    if (!confirm('هل تأكدين إكمال وتلبية هذا الطلب بنجاح؟')) return;
    setCompletingId(id);
    try {
      await markNeedFulfilled(id, user?.id);
      loadNeeds();
    } catch (err: any) {
      alert(err.message || 'فشل تأكيد إكمال الطلب');
    } finally {
      setCompletingId(null);
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

  const renderNeedItem = (need: SeekerNeed, showChat: boolean, showClaim: boolean, showCall: boolean, showComplete: boolean = false) => (
    <div key={need.id} className="group rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] border border-secondary-light/20 bg-white p-5 sm:p-6 md:p-7 shadow-sm transition-all hover:shadow-md flex flex-col justify-between h-full">
      <div>
        {/* Top: Icon + Title & Location + Status Badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              {need.gift?.icon === 'book-open' ? '📖' : <MapPin size={22} />}
            </div>
            <div className="text-right min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-primary truncate">{need.gift?.name || 'طلب مساعدة'}</h3>
                {(need.messages_count ?? 0) > 0 && (
                  <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center text-accent animate-pulse shrink-0">
                    <MessageCircle size={10} />
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-primary-muted font-bold mt-0.5">
                <MapPin size={11} className="text-secondary shrink-0" />
                <span>{need.city || 'الرياض'}</span>
                {need.neighborhood && (
                  <>
                    <span className="opacity-40">•</span>
                    <span>{need.neighborhood}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          {need.status === 'fulfilled' ? (
            <span className="bg-green-50 text-green-600 text-[10px] font-black px-2.5 py-1 rounded-full border border-green-200 shrink-0 flex items-center gap-1">
              <CheckCircle2 size={11} /> تمت التلبية
            </span>
          ) : need.status === 'in_progress' ? (
            <span className="bg-secondary/10 text-secondary text-[10px] font-black px-2.5 py-1 rounded-full border border-secondary/20 shrink-0 flex items-center gap-1">
              <Clock size={11} /> قيد التنفيذ
            </span>
          ) : (
            <span className="bg-accent/10 text-accent text-[10px] font-black px-2.5 py-1 rounded-full border border-accent/20 shrink-0 flex items-center gap-1">
              <Clock size={11} /> متاح للدعم
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-primary-muted text-xs sm:text-sm font-medium leading-relaxed mb-4 line-clamp-3 text-right">
          {need.description}
        </p>
      </div>

      {/* Footer / Actions Bar */}
      <div className="pt-4 border-t border-secondary-light/10 mt-auto space-y-3">
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-primary-muted font-bold">
          <span>منذ {need.created_at_human || 'قليل'}</span>
          {need.user?.name && <span className="opacity-80">صاحبة الطلب: {need.user.name}</span>}
        </div>

        {/* Button Actions Grid */}
        <div className="space-y-2">
          {showComplete ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                {showChat && (
                  <Link
                    href={`/chat/need/${need.id}`}
                    className="bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 rounded-xl py-2.5 text-xs font-black transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle size={13} /> محادثة
                  </Link>
                )}
                {showCall && (
                  <Link
                    href={`/chat/need/${need.id}`}
                    className="bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/20 rounded-xl py-2.5 text-xs font-black transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Phone size={13} /> مكالمة صوتية
                  </Link>
                )}
              </div>
              <Button
                onClick={() => handleComplete(need.id)}
                disabled={completingId === need.id}
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-2.5 text-xs font-black shadow-md shadow-green-600/10 transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                {completingId === need.id ? <Loader2 size={14} className="animate-spin" /> : <><CheckCircle2 size={14} /> تم الإنجاز واكتمال الطلب</>}
              </Button>
            </>
          ) : showClaim ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {showChat && (
                <Link
                  href={user?.id ? `/chat/need/${need.id}` : '/auth/login'}
                  className="bg-background hover:bg-secondary-light/20 text-primary border border-secondary-light/30 rounded-xl py-2.5 text-xs font-black transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <MessageCircle size={13} /> استفسار / محادثة
                </Link>
              )}
              <Button
                onClick={() => handleClaim(need.id)}
                disabled={claimingId === need.id}
                className="bg-secondary hover:bg-secondary-dark text-white rounded-xl py-2.5 text-xs font-black shadow-md shadow-secondary/10 transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                {claimingId === need.id ? <Loader2 size={14} className="animate-spin" /> : <><CheckCircle2 size={14} /> استلام الطلب</>}
              </Button>
            </div>
          ) : (
            showChat && (
              <Link
                href={`/chat/need/${need.id}`}
                className="block w-full bg-background hover:bg-secondary-light/20 text-primary rounded-xl py-2.5 text-xs font-black transition-all text-center"
              >
                <span className="flex items-center justify-center gap-1.5"><MessageCircle size={13} /> سجل المحادثة</span>
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute allowedRoles={['khatma', 'admin']}>
      <AppShell hero={needsHero}>
        <div className="space-y-8 sm:space-y-12 pb-20">
          <div className="flex flex-col gap-2 sm:gap-4 md:flex-row md:items-center md:justify-between px-2">
            <div className="text-right">
              <h2 className="text-xl sm:text-2xl font-black text-primary">طلبات المحتاجين</h2>
              <p className="text-xs sm:text-sm text-primary-muted font-bold mt-0.5">مبادرات منتقاة لتقديم عطاء ملموس للمجتمع.</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs sm:text-sm font-bold p-4 sm:p-5 rounded-2xl md:rounded-3xl flex items-center gap-3">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          {loading && needs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 space-y-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
              <p className="text-primary-muted font-bold text-xs sm:text-sm">جاري تحميل الطلبات...</p>
            </div>
          ) : (
            <div className="space-y-12 sm:space-y-16">
              {/* 1. Available Section */}
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2.5 sm:gap-3 px-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent">
                    <Clock size={18} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-primary">طلبات متاحة ({available.length})</h3>
                </div>
                {available.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {available.map(n => renderNeedItem(n, true, true, false, false))}
                  </div>
                ) : (
                  <div className="py-8 sm:py-10 text-center bg-background/30 rounded-2xl md:rounded-[2.5rem] border border-dashed border-secondary-light/30">
                    <p className="text-primary-muted font-bold text-xs sm:text-sm">لا توجد طلبات متاحة حالياً.</p>
                  </div>
                )}
              </div>

              {/* 2. My Active Helping Section */}
              {myActiveHelping.length > 0 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2.5 sm:gap-3 px-2 border-t border-background pt-8 sm:pt-12">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary">
                      <Clock size={18} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-primary">طلبات قيد التنفيذ (بواسطتكِ) ({myActiveHelping.length})</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {myActiveHelping.map(n => renderNeedItem(n, true, false, true, true))}
                  </div>
                </div>
              )}

              {/* 3. My Completed Help Section */}
              {myCompletedHelp.length > 0 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2.5 sm:gap-3 px-2 border-t border-background pt-8 sm:pt-12">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                      <CheckCircle2 size={18} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-primary">طلبات لبيتها ({myCompletedHelp.length})</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {myCompletedHelp.map(n => renderNeedItem(n, true, false, false, false))}
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
