'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/ui/AppShell';
import Hero from '@/components/ui/Hero';
import Button from '@/components/ui/Button';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getUserKhatmas, deleteKhatmaGift, markGiftDelivered, deleteKhatma } from '@/services/api';
import {
  Gift,
  Calendar,
  Sparkles,
  Award,
  BookOpen,
  Plus,
  MessageCircle,
  Star,
  CheckCircle2,
  Clock,
  Phone,
  Trash2,
  Loader2,
  Check
} from 'lucide-react';
import Link from 'next/link';

export default function MyGifts() {
  const [data, setData] = useState<{ khatmas: any[], total_impact_score: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingGiftId, setDeletingGiftId] = useState<number | null>(null);
  const [completingGiftId, setCompletingGiftId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    getUserKhatmas()
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error('My gifts fetch error:', err);
        setError('تعذر تحميل سجل العطاءات الخاص بكِ.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteGift = async (id: number) => {
    if (!confirm('هل أنتِ متأكدة من حذف هذا العطاء؟')) return;
    setDeletingGiftId(id);
    try {
      await deleteKhatmaGift(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'فشل حذف العطاء');
    } finally {
      setDeletingGiftId(null);
    }
  };

  const handleCompleteGift = async (id: number) => {
    if (!confirm('هل تأكدين إكمال وتسليم هذا العطاء للمستفيدة؟')) return;
    setCompletingGiftId(id);
    try {
      await markGiftDelivered(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'فشل تأكيد تسليم العطاء');
    } finally {
      setCompletingGiftId(null);
    }
  };

  const giftsHero = (
    <Hero
      title="هداياي وأثري"
      subtitle="تتبعي مسيرة عطائكِ وتابعي حالة العطايا والمبادرات التي أطلقتها للمجتمع."
      variant="primary"
      actions={
        <Link href="/khatma/register">
          <Button className="bg-white text-primary border border-secondary-light/30 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-background transition-all shadow-sm active:scale-95">
            <Plus size={18} /> ختمة جديدة
          </Button>
        </Link>
      }
      graphic={
        <div className="bg-white/10 p-4 sm:p-6 rounded-2xl md:rounded-[2.5rem] backdrop-blur-sm border border-white/20 text-white flex flex-col items-center">
          <Award size={48} className="mb-2 sm:mb-4 text-secondary sm:w-16 sm:h-16" />
          <p className="text-[10px] sm:text-xs font-bold opacity-80 mb-0.5 sm:mb-1">إجمالي نقاط الأثر</p>
          <h3 className="text-2xl sm:text-4xl font-black text-secondary">{data?.total_impact_score || 0}</h3>
        </div>
      }
    />
  );

  // Flatten all achievements (gifts) across user's khatmas
  const allGifts = (data?.khatmas || []).flatMap(khatma =>
    (khatma.achievements || []).map((achievement: any) => ({
      ...achievement,
      khatma_id: khatma.id,
      completion_date: khatma.completion_date,
      impact_score: khatma.impact_score,
    }))
  );

  // Separate sections based on status
  const pendingGifts = allGifts.filter(g => g.status === 'pending');
  const inProgressGifts = allGifts.filter(g => g.status === 'in_progress');
  const deliveredGifts = allGifts.filter(g => g.status === 'delivered');

  return (
    <ProtectedRoute allowedRoles={['khatma', 'admin']}>
      <AppShell hero={giftsHero}>
        <div className="space-y-8 sm:space-y-12 pb-20">
          <div className="flex justify-between items-center px-2">
            <div className="text-right">
              <h2 className="text-xl sm:text-2xl font-black text-primary">سجل عطاياي</h2>
              <p className="text-xs sm:text-sm text-primary-muted font-bold mt-0.5">قائمة بالعطايا والمبادرات المسجلة باسمكِ مصنفة حسب الحالة.</p>
            </div>
          </div>

          {loading && !data ? (
            <div className="flex flex-col items-center justify-center py-16 md:py-20 space-y-4">
              <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-primary-muted font-bold text-sm md:text-base">جاري تحميل السجل...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-100 text-red-600 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] text-center">
              <p className="font-bold text-sm md:text-base">{error}</p>
            </div>
          ) : allGifts.length > 0 ? (
            <div className="space-y-12 sm:space-y-16">
              {/* Section 1: In-Progress Gifts (Requested by seekers) */}
              {inProgressGifts.length > 0 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2.5 sm:gap-3 px-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                      <Clock size={18} />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-primary">عطايا قيد التنفيذ والتنسيق ({inProgressGifts.length})</h3>
                      <p className="text-[11px] sm:text-xs text-primary-muted font-medium">تم طلبها من مستفيدات، يمكنكِ التواصل وتأكيد التسليم.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {inProgressGifts.map((gift) => (
                      <div key={gift.id} className="bg-white rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 shadow-sm border border-secondary/30 hover:shadow-md transition-all flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                              <Gift size={22} />
                            </div>
                            <span className="bg-secondary/10 text-secondary text-[10px] font-black px-2.5 py-1 rounded-full border border-secondary/20 flex items-center gap-1">
                              <Clock size={10} /> قيد التنفيذ
                            </span>
                          </div>

                          <div className="text-right mb-4">
                            <h4 className="text-base sm:text-lg font-black text-primary truncate mb-1">{gift.gift_name}</h4>
                            <div className="flex items-center gap-2 text-[11px] font-bold text-primary-muted">
                              <span className="flex items-center gap-1"><Calendar size={11} /> {gift.date || gift.completion_date}</span>
                              <span>•</span>
                              <span className="text-secondary font-black">ختمة #{gift.khatma_id}</span>
                            </div>
                          </div>
                        </div>

                        {/* In Progress Actions: Chat, Call, Done Complete button */}
                        <div className="space-y-2 pt-3 border-t border-secondary-light/10">
                          <div className="grid grid-cols-2 gap-2">
                            <Link
                              href={`/chat/gift/${gift.id}`}
                              className="bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 rounded-xl py-2 text-[11px] font-black transition-all active:scale-95 flex items-center justify-center gap-1.5"
                            >
                              <MessageCircle size={13} /> محادثة
                            </Link>
                            <Link
                              href={`/chat/gift/${gift.id}`}
                              className="bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/20 rounded-xl py-2 text-[11px] font-black transition-all active:scale-95 flex items-center justify-center gap-1.5"
                            >
                              <Phone size={13} /> مكالمة
                            </Link>
                          </div>
                          <Button
                            onClick={() => handleCompleteGift(gift.id)}
                            disabled={completingGiftId === gift.id}
                            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-2.5 text-xs font-black shadow-md shadow-green-600/10 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                          >
                            {completingGiftId === gift.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <>
                                <Check size={14} /> تم الإنجاز واكتمال التسليم
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 2: Pending Gifts (Waiting for seekers - Display only delete button) */}
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2.5 sm:gap-3 px-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-primary">عطايا قيد الانتظار ({pendingGifts.length})</h3>
                    <p className="text-[11px] sm:text-xs text-primary-muted font-medium">عطايا معروضة للمجتمع بانتظار من يستفيد منها.</p>
                  </div>
                </div>

                {pendingGifts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {pendingGifts.map((gift) => (
                      <div key={gift.id} className="bg-white rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 shadow-sm border border-secondary-light/20 hover:shadow-md transition-all flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-accent/5 flex items-center justify-center text-accent">
                              <Gift size={22} />
                            </div>
                            <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2.5 py-1 rounded-full border border-blue-100 flex items-center gap-1">
                              <Clock size={10} /> متاح بالمنصة
                            </span>
                          </div>

                          <div className="text-right mb-4">
                            <h4 className="text-base sm:text-lg font-black text-primary truncate mb-1">{gift.gift_name}</h4>
                            <div className="flex items-center gap-2 text-[11px] font-bold text-primary-muted">
                              <span className="flex items-center gap-1"><Calendar size={11} /> {gift.date || gift.completion_date}</span>
                              <span>•</span>
                              <span className="text-secondary font-black">ختمة #{gift.khatma_id}</span>
                            </div>
                          </div>
                        </div>

                        {/* Pending Action: ONLY Delete button */}
                        <div className="pt-3 border-t border-secondary-light/10">
                          <button
                            onClick={() => handleDeleteGift(gift.id)}
                            disabled={deletingGiftId === gift.id}
                            className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl py-2.5 text-xs font-black transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            {deletingGiftId === gift.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <>
                                <Trash2 size={14} /> حذف العطاء
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 sm:py-8 px-4 text-center bg-background/30 rounded-2xl border border-dashed border-secondary-light/30">
                    <p className="text-primary-muted font-bold text-xs">لا توجد عطايا قيد الانتظار حالياً.</p>
                  </div>
                )}
              </div>

              {/* Section 3: Completed / Delivered Gifts */}
              {deliveredGifts.length > 0 && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2.5 sm:gap-3 px-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-primary">عطايا مكتملة وتم تسليمها ({deliveredGifts.length})</h3>
                      <p className="text-[11px] sm:text-xs text-primary-muted font-medium">عطايا وصلت لمستحقيها وتركت أثراً مباركاً.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {deliveredGifts.map((gift) => (
                      <div key={gift.id} className="bg-white rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 shadow-sm border border-green-100 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
                              <CheckCircle2 size={22} />
                            </div>
                            <span className="bg-green-50 text-green-600 text-[10px] font-black px-2.5 py-1 rounded-full border border-green-200 flex items-center gap-1">
                              <CheckCircle2 size={10} /> تم التسليم ✨
                            </span>
                          </div>

                          <div className="text-right mb-4">
                            <h4 className="text-base sm:text-lg font-black text-primary truncate mb-1">{gift.gift_name}</h4>
                            <div className="flex items-center gap-2 text-[11px] font-bold text-primary-muted">
                              <span className="flex items-center gap-1"><Calendar size={11} /> {gift.date || gift.completion_date}</span>
                              {gift.average_rating > 0 && (
                                <div className="flex items-center gap-0.5 bg-yellow-50 px-1.5 py-0.5 rounded-lg border border-yellow-100 mr-auto">
                                  <span className="text-[10px] font-black text-yellow-700">{gift.average_rating}</span>
                                  <Star size={10} className="text-yellow-400 fill-yellow-400" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-secondary-light/10">
                          <Link
                            href={`/chat/gift/${gift.id}`}
                            className="w-full bg-background hover:bg-secondary-light/20 text-primary rounded-xl py-2 text-[11px] font-black transition-all flex items-center justify-center gap-1.5"
                          >
                            <MessageCircle size={13} /> سجل المحادثة
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl md:rounded-[3rem] border-2 border-dashed border-secondary-light bg-white/50 p-8 sm:p-14 md:p-20 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-secondary/5 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-secondary/30">
                <Gift size={32} className="sm:w-10 sm:h-10" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-primary mb-2">لا يوجد سجل عطاء حالياً</h3>
              <p className="text-primary-muted font-bold text-xs sm:text-sm mb-6 sm:mb-8 max-w-sm mx-auto">سجلي ختمتكِ الأولى اليوم واختاري هديتكِ للمجتمع لتبدأي في صناعة الأثر.</p>
              <Link href="/khatma/register">
                <Button className="btn-gold px-8 sm:px-12 py-3.5 sm:py-4 text-xs sm:text-sm font-black">ابدأ الآن ✨</Button>
              </Link>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
