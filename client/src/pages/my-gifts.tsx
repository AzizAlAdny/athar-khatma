'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/ui/AppShell';
import Hero from '@/components/ui/Hero';
import Button from '@/components/ui/Button';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getUserKhatmas } from '@/services/api';
import {
  Gift,
  Calendar,
  ChevronLeft,
  Sparkles,
  Award,
  BookOpen,
  Plus
} from 'lucide-react';
import Link from 'next/link';

export default function MyGifts() {
  const [data, setData] = useState<{ khatmas: any[], total_impact_score: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

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
    <ProtectedRoute allowedRoles={['khatma', 'seeker', 'admin']}>
      <AppShell hero={giftsHero}>
        <div className="space-y-8 pb-20">
          <div className="flex justify-between items-center px-2">
            <div className="text-right">
              <h2 className="text-2xl font-black text-primary">سجل العطاء</h2>
              <p className="text-sm text-primary-muted font-bold mt-1">قائمة بالختمات والمبادرات المسجلة باسمكِ.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-primary-muted font-bold">جاري تحميل السجل...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-100 text-red-600 p-8 rounded-[2.5rem] text-center">
              <p className="font-bold">{error}</p>
            </div>
          ) : data?.khatmas && data.khatmas.length > 0 ? (
            <div className="grid gap-6">
              {data.khatmas.map((khatma) => (
                <div key={khatma.id} className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-secondary-light/20 hover:shadow-md transition-all group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-5">
                      <div className="w-16 h-16 rounded-3xl bg-secondary/10 flex items-center justify-center text-secondary text-2xl shrink-0 group-hover:scale-110 transition-transform">
                        <BookOpen size={28} />
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-black text-primary">ختمة {khatma.type}</h3>
                          <span className="bg-accent/10 text-accent text-[10px] font-black px-3 py-1 rounded-full">مكتملة</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-primary-muted font-bold">
                          <span className="flex items-center gap-1"><Calendar size={12} /> {khatma.completion_date}</span>
                          <span className="flex items-center gap-1 text-secondary"><Sparkles size={12} /> {khatma.impact_score} نقطة أثر</span>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                          {(khatma.achievements || []).map((achievement: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 bg-background px-4 py-2 rounded-xl border border-secondary-light/10">
                              <div className="relative">
                                <Gift size={14} className="text-secondary" />
                                {achievement.messages_count > 0 && (
                                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full border border-white"></div>
                                )}
                              </div>
                              <span className="text-xs font-black text-primary">{achievement.gift_name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button className="flex items-center justify-center gap-2 text-primary-muted font-black text-xs hover:text-secondary transition-colors md:px-4">
                      تفاصيل الأثر <ChevronLeft size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[3rem] border-2 border-dashed border-secondary-light bg-white/50 p-20 text-center">
              <div className="w-20 h-20 bg-secondary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-secondary/30">
                <Gift size={40} />
              </div>
              <h3 className="text-xl font-black text-primary mb-2">لا يوجد سجل عطاء حالياً</h3>
              <p className="text-primary-muted font-bold mb-8 max-w-sm mx-auto">سجلي ختمتكِ الأولى اليوم واختاري هديتكِ للمجتمع لتبدأي في صناعة الأثر.</p>
              <Link href="/khatma/register">
                <Button className="btn-gold px-12 py-4 text-sm font-black">ابدأ الآن ✨</Button>
              </Link>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
