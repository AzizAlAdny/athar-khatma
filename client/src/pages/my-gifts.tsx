'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/ui/AppShell';
import Hero from '@/components/ui/Hero';
import Button from '@/components/ui/Button';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getUserKhatmas, deleteKhatma } from '@/services/api';
import {
  Gift,
  Calendar,
  ChevronLeft,
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
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function MyGifts() {
  const [data, setData] = useState<{ khatmas: any[], total_impact_score: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
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

  const handleDeleteKhatma = async (id: number) => {
    if (!confirm('هل أنتِ متأكدة من حذف هذه الختمة وجميع العطايا المرتبطة بها؟')) return;
    setDeletingId(id);
    try {
      await deleteKhatma(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'فشل حذف الختمة');
    } finally {
      setDeletingId(null);
    }
  };

  const giftsHero = (
    <Hero
      title="هداياي وأثري"
      subtitle="تتبعي مسيرة عطائكِ وراجعي الختمات التي سجلتها والمبادرات التي أطلقتها."
      variant="primary"
      actions={
        <Link href="/khatma/register">
          <Button className="bg-white text-primary border border-secondary-light/30 px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-background transition-all shadow-sm active:scale-95">
            <Plus size={18} /> ختمة جديدة
          </Button>
        </Link>
      }
      graphic={
        <div className="bg-white/10 p-6 rounded-[2.5rem] backdrop-blur-sm border border-white/20 text-white flex flex-col items-center">
          <Award size={64} className="mb-4 text-secondary" />
          <p className="text-xs font-bold opacity-80 mb-1">إجمالي نقاط الأثر</p>
          <h3 className="text-4xl font-black text-secondary">{data?.total_impact_score || 0}</h3>
        </div>
      }
    />
  );

  return (
    <ProtectedRoute allowedRoles={['khatma', 'admin']}>
      <AppShell hero={giftsHero}>
        <div className="space-y-8 pb-20">
          <div className="flex justify-between items-center px-2">
            <div className="text-right">
              <h2 className="text-2xl font-black text-primary">سجل العطاء</h2>
              <p className="text-sm text-primary-muted font-bold mt-1">قائمة بالختمات والمبادرات المسجلة باسمكِ.</p>
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
          ) : data?.khatmas && data.khatmas.length > 0 ? (
            <div className="grid gap-4 md:gap-6">
              {data.khatmas.map((khatma) => (
                <div key={khatma.id} className="bg-white rounded-2xl md:rounded-[2.5rem] p-4 sm:p-6 md:p-8 shadow-sm border border-secondary-light/20 hover:shadow-md transition-all group">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6">
                    <div className="flex items-start gap-3 sm:gap-5 flex-1 min-w-0">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-secondary/10 flex items-center justify-center text-secondary text-xl sm:text-2xl shrink-0 group-hover:scale-105 transition-transform">
                        <BookOpen size={24} className="sm:w-7 sm:h-7" />
                      </div>
                      <div className="text-right w-full min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-base sm:text-lg font-black text-primary truncate">سجل العطاء #{khatma.id}</h3>
                          {khatma.status === 'active' && (
                            <button
                              onClick={() => handleDeleteKhatma(khatma.id)}
                              disabled={deletingId === khatma.id}
                              className="text-red-500 hover:text-red-700 p-1.5 transition-colors shrink-0"
                              title="حذف الختمة"
                            >
                              {deletingId === khatma.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            </button>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-primary-muted font-bold">
                          <span className="flex items-center gap-1"><Calendar size={12} /> {khatma.completion_date}</span>
                          <span className="flex items-center gap-1 text-secondary"><Sparkles size={12} /> {khatma.impact_score} نقطة أثر</span>
                        </div>

                        <div className="mt-4 sm:mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          {(khatma.achievements || []).map((achievement: any, idx: number) => (
                            <div key={idx} className="flex flex-col justify-between gap-2.5 bg-background p-3.5 sm:p-4 rounded-2xl border border-secondary-light/10 w-full min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="relative shrink-0">
                                    <Gift size={14} className="text-secondary" />
                                    {achievement.messages_count > 0 && (
                                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full border border-white"></div>
                                    )}
                                  </div>
                                  <span className="text-xs font-black text-primary truncate">{achievement.gift_name}</span>
                                </div>

                                {achievement.status === 'delivered' ? (
                                  <span className="bg-green-50 text-green-600 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-green-100 shrink-0">
                                    <CheckCircle2 size={10} /> تم التسليم
                                  </span>
                                ) : achievement.status === 'in_progress' ? (
                                  <span className="bg-secondary/10 text-secondary text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-secondary/20 shrink-0">
                                    <Clock size={10} /> قيد التنفيذ
                                  </span>
                                ) : (
                                  <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-blue-100 shrink-0">
                                    <Clock size={10} /> متوفر
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between mt-1 pt-2 border-t border-secondary-light/10">
                                <div className="flex items-center gap-1">
                                  {achievement.average_rating > 0 && (
                                    <div className="flex items-center gap-0.5 bg-yellow-50 px-1.5 py-0.5 rounded-lg border border-yellow-100">
                                      <span className="text-[10px] font-black text-yellow-700">{achievement.average_rating}</span>
                                      <Star size={10} className="text-yellow-400 fill-yellow-400" />
                                    </div>
                                  )}
                                </div>

                                <div className="flex gap-1.5 sm:gap-2">
                                  {achievement.status !== 'delivered' && (
                                    <>
                                      <Link href={`/chat/gift/${achievement.id}`}>
                                        <button className="flex items-center gap-1 text-[10px] font-black text-primary hover:text-secondary transition-colors bg-white px-2.5 py-1.5 rounded-lg border border-secondary-light/20 shadow-xs">
                                          <MessageCircle size={12} /> محادثة
                                        </button>
                                      </Link>
                                      {achievement.status === 'in_progress' && (
                                        <Link href={`/chat/gift/${achievement.id}`}>
                                          <button
                                            className="flex items-center gap-1 text-[10px] font-black text-secondary hover:text-primary transition-colors bg-white px-2.5 py-1.5 rounded-lg border border-secondary-light/20 shadow-xs"
                                          >
                                            <Phone size={12} /> مكالمة
                                          </button>
                                        </Link>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
