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
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function MyNeeds() {
  const { user } = useAuth();
  const [needs, setNeeds] = useState<SeekerNeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [confirmCompleteId, setConfirmCompleteId] = useState<number | null>(null);

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
    setCompletingId(id);
    setError(null);
    try {
      await markNeedFulfilled(id);
      loadNeeds();
      setConfirmCompleteId(null);
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
    <div key={need.id} className="group rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] border border-secondary-light/20 bg-white p-5 sm:p-6 md:p-7 shadow-sm transition-all hover:shadow-md flex flex-col justify-between h-full w-full min-w-0">
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
              <CheckCircle2 size={11} /> مكتمل
            </span>
          ) : need.status === 'in_progress' ? (
            <span className="bg-secondary/10 text-secondary text-[10px] font-black px-2.5 py-1 rounded-full border border-secondary/20 shrink-0 flex items-center gap-1">
              <Clock size={11} /> قيد التنفيذ
            </span>
          ) : (
            <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2.5 py-1 rounded-full border border-blue-100 shrink-0 flex items-center gap-1">
              <Clock size={11} /> قيد الانتظار
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
          {need.fulfilled_by && <span className="opacity-80">صانعة الأثر: {need.fulfilled_by.name}</span>}
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
                    <MessageCircle size={13} /> المحادثات
                  </Link>
                )}
                {showCall && (
                  <Link
                    href={`/chat/need/${need.id}`}
                    className="bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/20 rounded-xl py-2.5 text-xs font-black transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Phone size={13} /> مكالمة
                  </Link>
                )}
              </div>
              <Button
                onClick={() => setConfirmCompleteId(need.id)}
                disabled={completingId === need.id}
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-2.5 text-xs font-black shadow-md shadow-green-600/10 transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                {completingId === need.id ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>جاري التحديث...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} /> تأكيد الاستلام واكتمال الطلب
                  </>
                )}
              </Button>
            </>
          ) : showDelete ? (
            <Button
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl py-2.5 text-xs font-black transition-all active:scale-95 flex items-center justify-center gap-1.5"
              onClick={() => setConfirmDeleteId(need.id)}
              disabled={deletingId === need.id}
            >
              {deletingId === need.id ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  <Trash2 size={14} /> حذف الطلب
                </>
              )}
            </Button>
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
    <ProtectedRoute allowedRoles={['seeker']}>
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
            <div className="space-y-12 sm:space-y-16">
              {/* 1. Pending Section */}
              {pending.length > 0 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2.5 sm:gap-3 px-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <Clock size={18} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-primary">طلبات قيد الانتظار ({pending.length})</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {pending.map(n => renderNeedItem(n, false, true, false, false))}
                  </div>
                </div>
              )}

              {/* 2. In Progress Section */}
              {inProgress.length > 0 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2.5 sm:gap-3 px-2 border-t border-background pt-8 sm:pt-12">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary">
                      <Clock size={18} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-primary">طلبات قيد التنفيذ ({inProgress.length})</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {inProgress.map(n => renderNeedItem(n, true, false, true, true))}
                  </div>
                </div>
              )}

              {/* 3. Completed Section */}
              {completed.length > 0 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2.5 sm:gap-3 px-2 border-t border-background pt-8 sm:pt-12">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                      <CheckCircle2 size={18} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-primary">طلبات مكتملة ({completed.length})</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
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

        {/* Delete Need Confirmation Modal */}
        <ConfirmModal
          isOpen={confirmDeleteId !== null}
          onClose={() => setConfirmDeleteId(null)}
          onConfirm={() => { if (confirmDeleteId) handleDelete(confirmDeleteId); }}
          title="تأكيد حذف الطلب"
          message="هل أنتِ متأكدة من رغبتك في حذف هذا الطلب؟ لا يمكن التراجع عن هذه الخطوة."
          variant="danger"
          confirmText="نعم، حذف الطلب"
          isLoading={deletingId !== null}
          loadingText="جاري الحذف..."
        />

        {/* Complete Need Confirmation Modal */}
        <ConfirmModal
          isOpen={confirmCompleteId !== null}
          onClose={() => setConfirmCompleteId(null)}
          onConfirm={() => { if (confirmCompleteId) handleComplete(confirmCompleteId); }}
          title="تأكيد استلام الاحتياج"
          message="هل تأكدين استلام وتلبية هذا الاحتياج بنجاح؟ سيتم تحويل حالة الطلب إلى مكتمل."
          variant="success"
          confirmText="نعم، تأكيد الاكتمال ✨"
          isLoading={completingId !== null}
          loadingText="جاري التحديث..."
        />
      </AppShell>
    </ProtectedRoute>
  );
}
