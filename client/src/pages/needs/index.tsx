'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/ui/AppShell';
import Button from '@/components/ui/Button';
import Hero from '@/components/ui/Hero';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { getSeekerNeeds, deleteMySeekerNeed, markNeedFulfilled, SeekerNeed } from '@/services/api';
import { Plus, MapPin, HelpCircle, Trash2, AlertCircle, Loader2, MessageCircle, Clock, CheckCircle2, Phone, Star } from 'lucide-react';

export default function MyNeeds() {
  const { user } = useAuth();
  const [needs, setNeeds] = useState<SeekerNeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const loadNeeds = () => {
    setLoading(true);
    getSeekerNeeds()
      .then(data => {
        const mine = (data || []).filter(n => n.user_id === user?.id);
        setNeeds(mine);
        setLoading(false);
      })
      .catch(err => {
        console.error('My needs fetch error:', err);
        setError('تعذر تحميل طلباتكِ، يرجى المحاولة لاحقاً.');
        setLoading(false);
      });
  };

  useEffect(() => {
    if (user?.id) {
      loadNeeds();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    setError(null);
    try {
      await deleteMySeekerNeed(id);
      setNeeds(prev => prev.filter(n => n.id !== id));
      setConfirmDeleteId(null);
    } catch (err: any) {
      setError(err.message || 'فشل حذف الطلب، يرجى المحاولة لاحقاً.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleComplete = async (id: number) => {
    if (!confirm('هل تأكدين استلام وتلبية هذا الاحتياج بنجاح؟')) return;
    setCompletingId(id);
    setError(null);
    try {
      await markNeedFulfilled(id);
      loadNeeds();
    } catch (err: any) {
      setError(err.message || 'فشل تأكيد اكتمال الطلب.');
    } finally {
      setCompletingId(null);
    }
  };

  const needsHero = (
    <Hero
      title="طلباتي"
      subtitle="تابعي طلبات الاحتياج التي سجلتها وأديريها بسهولة."
      variant="accent"
      actions={
        <Link href="/needs/register">
          <Button variant="accent" size="lg" className="flex items-center justify-center gap-2 w-full md:w-auto">
            <Plus size={18} /> أضيفي احتياجاً
          </Button>
        </Link>
      }
      graphic={
        <div className="w-48 h-48 rounded-full bg-accent/5 flex items-center justify-center text-accent/20">
          <HelpCircle size={120} />
        </div>
      }
    />
  );

  const pending = needs.filter(n => !n.status || n.status === 'open');
  const inProgress = needs.filter(n => n.status === 'in_progress');
  const completed = needs.filter(n => n.status === 'fulfilled');

  const renderNeedItem = (need: SeekerNeed, showChat: boolean, showDelete: boolean, showCall: boolean, showComplete: boolean = false) => (
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
            <Link href={`/chat/need/${need.id}`} className="flex-1 lg:flex-none">
              <Button className="w-full bg-secondary/5 hover:bg-secondary/10 text-primary rounded-2xl px-4 py-3 text-xs font-black transition-all active:scale-95 flex items-center justify-center gap-1.5">
                <MessageCircle size={14} /> المحادثات
              </Button>
            </Link>
          )}

          {showCall && (
             <Link
                href={`/chat/need/${need.id}`}
                className="flex-1 lg:flex-none bg-white border border-secondary-light/40 text-primary hover:bg-background rounded-2xl px-4 py-3 text-xs font-black transition-all active:scale-95 flex items-center justify-center gap-1.5 whitespace-nowrap"
             >
                <Phone size={14} className="text-secondary" /> مكالمة
             </Link>
          )}

          {showComplete && (
             <Button
                onClick={() => handleComplete(need.id)}
                disabled={completingId === need.id}
                className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700 text-white rounded-2xl px-4 sm:px-6 py-3 text-xs font-black shadow-lg shadow-green-600/10 transition-all active:scale-95 flex items-center justify-center gap-1.5 whitespace-nowrap"
             >
                {completingId === need.id ? <Loader2 size={14} className="animate-spin" /> : <><CheckCircle2 size={14} /> تأكيد الاستلام واكتمال الطلب</>}
             </Button>
          )}

          {showDelete && (
            confirmDeleteId === need.id ? (
              <div className="flex items-center gap-2 w-full lg:w-auto">
                <Button
                  className="flex-1 lg:flex-none bg-red-600 hover:bg-red-700 text-white rounded-2xl px-4 sm:px-5 py-3 text-xs font-black transition-all active:scale-95 whitespace-nowrap"
                  onClick={() => handleDelete(need.id)}
                  disabled={deletingId === need.id}
                >
                  {deletingId === need.id ? (
                    <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> جاري الحذف...</span>
                  ) : 'تأكيد الحذف'}
                </Button>
                <Button
                  className="bg-background text-primary-muted rounded-2xl px-4 py-3 text-xs font-black hover:text-primary transition-all active:scale-95"
                  onClick={() => setConfirmDeleteId(null)}
                  disabled={deletingId === need.id}
                >
                  إلغاء
                </Button>
              </div>
            ) : (
              <Button
                className="flex-1 lg:flex-none bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl px-4 sm:px-6 py-3 text-xs font-black shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                onClick={() => setConfirmDeleteId(need.id)}
              >
                <Trash2 size={14} /> حذف
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute allowedRoles={['seeker', 'admin']}>
      <AppShell hero={needsHero}>
        <div className="space-y-8 sm:space-y-12 pb-20">
          <div className="flex flex-col gap-2 sm:gap-4 md:flex-row md:items-center md:justify-between px-2">
            <div className="text-right">
              <h2 className="text-xl sm:text-2xl font-black text-primary">إدارة طلباتي</h2>
              <p className="text-xs sm:text-sm text-primary-muted font-bold mt-0.5">
                {needs.length > 0 ? `لديكِ ${needs.length} ${needs.length === 1 ? 'طلب مسجل' : 'طلبات مسجلة'}.` : 'قائمة الطلبات التي سجلتها باسمكِ.'}
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs sm:text-sm font-bold p-4 sm:p-5 rounded-2xl md:rounded-3xl flex items-center gap-3">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 space-y-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
              <p className="text-primary-muted font-bold text-xs sm:text-sm">جاري تحميل طلباتكِ...</p>
            </div>
          ) : needs.length > 0 ? (
            <div className="space-y-10 sm:space-y-16">
              {/* 1. Pending Section */}
              {pending.length > 0 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2.5 sm:gap-3 px-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent">
                      <Clock size={18} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-primary">طلبات قيد الانتظار ({pending.length})</h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {pending.map(n => renderNeedItem(n, false, true, false, false))}
                  </div>
                </div>
              )}

              {/* 2. In Progress Section */}
              {inProgress.length > 0 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2.5 sm:gap-3 px-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary">
                      <Clock size={18} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-primary">طلبات قيد التنفيذ ({inProgress.length})</h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {inProgress.map(n => renderNeedItem(n, true, false, true, true))}
                  </div>
                </div>
              )}

              {/* 3. Completed Section */}
              {completed.length > 0 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2.5 sm:gap-3 px-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                      <CheckCircle2 size={18} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-primary">طلبات مكتملة ({completed.length})</h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {completed.map(n => renderNeedItem(n, true, false, false, false))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="col-span-full rounded-[40px] border border-dashed border-secondary-light bg-white p-16 text-center shadow-sm">
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus size={24} className="text-secondary-muted" />
              </div>
              <p className="text-primary-muted font-bold text-lg">لم تسجلي أي طلب بعد..</p>
              <p className="text-secondary-muted text-sm mt-1 mb-8">سجلي احتياجكِ الأول وسيصلكِ الدعم من صانعات الأثر.</p>
              <Link href="/needs/register">
                <Button variant="accent" size="lg">
                  <span className="flex items-center justify-center gap-2"><Plus size={16} /> أضيفي احتياجاً</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
