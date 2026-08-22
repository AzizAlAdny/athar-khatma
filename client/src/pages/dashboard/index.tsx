'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/ui/AppShell';
import Button from '@/components/ui/Button';
import Hero from '@/components/ui/Hero';
import ImpactMap from '@/components/maps/ImpactMap';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { getRecentGifts, getSeekerNeeds, getPublicStats, getUserKhatmas, KhatmaGift, SeekerNeed } from '@/services/api';
import {
  BookOpen,
  Sparkles,
  Gift,
  MapPin,
  ChevronLeft,
  Plus,
  Clock,
  CheckCircle2,
  MessageCircle,
  Award,
  Users
} from 'lucide-react';

const khatmaOptions = [
  { label: 'تسجيل ختمة', icon: BookOpen, color: 'bg-background text-primary', href: '/khatma/register' },
  { label: 'تصفح الطلبات', icon: MapPin, color: 'bg-background text-accent', href: '/needs/browse' },
  { label: 'سجل العطاء', icon: Award, color: 'bg-background text-secondary', href: '/my-gifts' },
  { label: 'الرسائل', icon: MessageCircle, color: 'bg-background text-primary-muted', href: '/chat' },
];

const seekerOptions = [
  { label: 'إضافة احتياج', icon: Plus, color: 'bg-background text-accent', href: '/needs/register' },
  { label: 'استكشاف العطايا', icon: Gift, color: 'bg-background text-secondary', href: '/needs/giftbrowser' },
  { label: 'طلباتي', icon: Clock, color: 'bg-background text-primary', href: '/needs' },
  { label: 'الرسائل', icon: MessageCircle, color: 'bg-background text-primary-muted', href: '/chat' },
];

const UserDashboard = () => {
  const { user } = useAuth();
  const isSeeker = user?.role === 'seeker';

  const [stats, setStats] = useState<any>(null);
  const [recentGifts, setRecentGifts] = useState<KhatmaGift[]>([]);
  const [myGifts, setMyGifts] = useState<any[]>([]);
  const [recentNeeds, setRecentNeeds] = useState<SeekerNeed[]>([]);
  const [myNeeds, setMyNeeds] = useState<SeekerNeed[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [statsRes, giftsRes, needsRes, khatmasRes] = await Promise.allSettled([
          getPublicStats(),
          getRecentGifts(),
          getSeekerNeeds(),
          !isSeeker ? getUserKhatmas() : Promise.resolve(null)
        ]);

        if (statsRes.status === 'fulfilled') setStats(statsRes.value);
        if (giftsRes.status === 'fulfilled') setRecentGifts((giftsRes.value || []).slice(0, 3));

        if (needsRes.status === 'fulfilled') {
          const allNeeds = needsRes.value || [];
          setRecentNeeds(allNeeds.filter(n => !n.status || n.status === 'open').slice(0, 3));
          setMyNeeds(allNeeds.filter(n => n.user_id === user.id).slice(0, 3));
        }

        if (khatmasRes.status === 'fulfilled' && khatmasRes.value) {
          const extractedGifts = (khatmasRes.value.khatmas || []).flatMap((k: any) =>
            (k.achievements || []).map((a: any) => ({
              id: a.id,
              gift_name: a.gift_name,
              status: a.status,
              date: a.date || k.completion_date,
              khatma_id: k.id,
            }))
          );
          setMyGifts(extractedGifts.slice(0, 3));
        }
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, isSeeker]);

  const dashboardHero = (
    <Hero
      title={isSeeker ? "مرحباً بكِ في مجتمع الأثر" : "مرحباً بكِ صانعة الأثر"}
      subtitle={isSeeker ? "سجلي احتياجكِ اليوم وستجدين الدعم من صانعات الأثر في مجتمعنا." : "تابعي ختماتكِ، وأضيفي أثراً جديداً في مجتمعكِ اليوم."}
      variant="primary"
      centered={true}
      actions={
        <>
          {isSeeker ? (
            <Link href="/needs/register" className="bg-primary text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-xl shadow-primary/10 active:scale-95">
              <Plus size={18} /> سجلي احتياجكِ
            </Link>
          ) : (
            <Link href="/khatma/register" className="bg-primary text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-xl shadow-primary/10 active:scale-95">
              <Plus size={18} /> سجلي ختمتكِ
            </Link>
          )}
          <Link href={isSeeker ? "/needs/giftbrowser" : "/my-gifts"} className="bg-white text-primary border border-secondary-light/30 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-background transition-all shadow-sm active:scale-95">
            {isSeeker ? <Gift size={18} /> : <Sparkles size={18} />}
            {isSeeker ? "استكشفي العطايا" : "تابعي أثركِ"}
          </Link>
        </>
      }
    />
  );

  const activeOptions = isSeeker ? seekerOptions : khatmaOptions;

  return (
    <ProtectedRoute>
      <AppShell hero={dashboardHero}>
        <div className="space-y-6 sm:space-y-8">
          {/* Quick Action Grid */}
          <section className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
            {activeOptions.map(({ label, icon: Icon, color, href }) => (
              <Link key={label} href={href}>
                <button
                  type="button"
                  className="w-full group flex flex-col items-center gap-2.5 sm:gap-3 p-4 sm:p-6 rounded-2xl sm:rounded-[32px] bg-white border border-secondary-light/10 shadow-sm transition-all hover:shadow-md active:scale-95"
                >
                  <div className={`w-11 h-11 sm:w-14 sm:h-14 ${color} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                    <Icon size={22} className="sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-xs sm:text-sm md:text-base font-black text-primary text-center leading-tight">{label}</span>
                </button>
              </Link>
            ))}
          </section>

          {/* Map and Info Section */}
          <section className="grid gap-6 sm:gap-8 lg:grid-cols-12">
            {/* Map Column */}
            <div className="lg:col-span-8">
              <ImpactMap />
            </div>

            {/* Side Column: Steps/Journey */}
            <div className="lg:col-span-4 space-y-6 sm:space-y-8">
              <div className="bg-white p-5 sm:p-6 md:p-8 rounded-3xl md:rounded-[40px] border border-secondary-light/30 shadow-sm h-full flex flex-col">
                <h3 className="text-base sm:text-lg font-black text-primary mb-4 sm:mb-6">{isSeeker ? "كيف تحصلين على الدعم" : "الرحلة إلى الأثر"}</h3>
                <div className="space-y-4 sm:space-y-6 relative flex-1">
                  <div className="absolute right-[15px] sm:right-[17px] top-2 bottom-2 w-0.5 bg-secondary-light/60"></div>
                  {(isSeeker ? [
                    { title: 'سجلي احتياجكِ', detail: 'صفي نوع المساعدة التي تحتاجينها.', status: 'completed' },
                    { title: 'تواصلي مع الخاتمة', detail: 'نسقي التفاصيل عبر الدردشة الخاصة.', status: 'completed' },
                    { title: 'تمت تلبية الطلب', detail: 'أغلقي الطلب وقيمي التجربة.', status: 'completed' },
                  ] : [
                    { title: 'اختاري ختمتكِ', detail: 'حددي تاريخ ختمتكِ وأهدافها.', status: 'completed' },
                    { title: 'أضيفي عطاياكِ', detail: 'حددي الخدمات التي تودين تقديمها.', status: 'completed' },
                    { title: 'اصنعي الأثر', detail: 'لبي طلبات المجتمع وتابعي نقاطكِ.', status: 'completed' },
                  ]).map((item, i) => (
                    <div key={i} className="flex items-start gap-3 sm:gap-4 relative z-10">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary rounded-full flex items-center justify-center text-white shadow-sm border-2 sm:border-4 border-white">
                          <CheckCircle2 size={13} className="sm:w-3.5 sm:h-3.5" />
                        </div>
                      </div>
                      <div className="bg-white pr-1.5 sm:pr-2 py-0.5 text-right">
                        <p className="text-sm sm:text-base font-black text-primary">{item.title}</p>
                        <p className="text-xs sm:text-sm text-primary-muted font-medium mt-0.5 sm:mt-1 leading-relaxed">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Feed Section */}
          <section className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* 1. Needs Feed Card (Own needs for seeker, community needs for khatma) */}
            <div className="bg-white p-5 sm:p-7 md:p-8 rounded-3xl md:rounded-[40px] border border-secondary-light/30 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="mb-4 sm:mb-6 text-base sm:text-lg font-black text-primary border-b border-background pb-3 sm:pb-4 text-center">
                  {isSeeker ? "طلباتي الأخيرة" : "طلبات تحتاج أثركِ"}
                </h3>
                <div className="space-y-4 sm:space-y-5">
                  {isSeeker ? (
                    myNeeds.length > 0 ? myNeeds.map((need, i) => (
                      <Link key={i} href="/needs">
                        <div className="flex justify-between items-center group cursor-pointer p-2 rounded-2xl hover:bg-background/50 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-accent/10 text-accent rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xs shrink-0">
                              <MapPin size={16} />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-black text-primary group-hover:text-accent transition-colors truncate">{need.gift?.name || 'طلب مساعدة'}</h4>
                              <p className="text-[10px] sm:text-xs text-primary-muted font-bold mt-0.5 truncate">
                                {need.city || 'الرياض'} • {need.status === 'in_progress' ? 'قيد التنفيذ' : need.status === 'fulfilled' ? 'مكتمل' : 'قيد الانتظار'}
                              </p>
                            </div>
                          </div>
                          <ChevronLeft size={16} className="text-secondary-light group-hover:translate-x-1 transition-all shrink-0" />
                        </div>
                      </Link>
                    )) : (
                      <p className="text-center text-primary-muted font-bold text-xs sm:text-sm py-8 sm:py-10">لم تسجلي أي طلب بعد.</p>
                    )
                  ) : (
                    recentNeeds.length > 0 ? recentNeeds.map((need, i) => (
                      <Link key={i} href="/needs/browse">
                        <div className="flex justify-between items-center group cursor-pointer p-2 rounded-2xl hover:bg-background/50 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-background text-accent rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xs shrink-0">
                              <MapPin size={16} />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-black text-primary group-hover:text-accent transition-colors truncate">{need.gift?.name || 'طلب مساعدة'}</h4>
                              <p className="text-[10px] sm:text-xs text-primary-muted font-bold mt-0.5 truncate">{need.city || 'الرياض'} • {need.created_at_human || 'منذ قليل'}</p>
                            </div>
                          </div>
                          <ChevronLeft size={16} className="text-secondary-light group-hover:translate-x-1 transition-all shrink-0" />
                        </div>
                      </Link>
                    )) : (
                      <p className="text-center text-primary-muted font-bold text-xs sm:text-sm py-8 sm:py-10">لا توجد طلبات جديدة حالياً.</p>
                    )
                  )}
                </div>
              </div>
              <Link href={isSeeker ? "/needs" : "/needs/browse"}>
                <button className="w-full mt-6 sm:mt-8 py-3 sm:py-3.5 text-xs font-black text-primary-muted hover:text-accent bg-background rounded-2xl transition-colors active:scale-95">
                  {isSeeker ? "إدارة جميع طلباتي" : "تصفح جميع الطلبات"}
                </button>
              </Link>
            </div>

            {/* 2. Gifts Feed Card (Own gifts for khatma, community gifts for seeker) */}
            <div className="bg-white p-5 sm:p-7 md:p-8 rounded-3xl md:rounded-[40px] border border-secondary-light/30 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="mb-4 sm:mb-6 text-base sm:text-lg font-black text-primary border-b border-background pb-3 sm:pb-4 text-center">
                  {!isSeeker ? "عطاياي ومبادراتي" : "أحدث العطايا المتاحة"}
                </h3>
                <div className="space-y-4 sm:space-y-5">
                  {!isSeeker ? (
                    myGifts.length > 0 ? myGifts.map((gift, i) => (
                      <Link key={i} href="/my-gifts">
                        <div className="flex justify-between items-center group cursor-pointer p-2 rounded-2xl hover:bg-background/50 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-secondary/10 text-secondary rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xs shrink-0">
                              <Gift size={16} />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-black text-primary group-hover:text-secondary transition-colors truncate">{gift.gift_name}</h4>
                              <p className="text-[10px] sm:text-xs text-primary-muted font-bold mt-0.5 truncate">
                                ختمة #{gift.khatma_id} • {gift.status === 'in_progress' ? 'قيد التنفيذ' : gift.status === 'delivered' ? 'تم التسليم' : 'متاح بالمنصة'}
                              </p>
                            </div>
                          </div>
                          <ChevronLeft size={16} className="text-secondary-light group-hover:translate-x-1 transition-all shrink-0" />
                        </div>
                      </Link>
                    )) : (
                      <p className="text-center text-primary-muted font-bold text-xs sm:text-sm py-8 sm:py-10">لم تسجلي أي عطاء بعد.</p>
                    )
                  ) : (
                    recentGifts.length > 0 ? recentGifts.map((gift, i) => (
                      <Link key={i} href="/needs/giftbrowser">
                        <div className="flex justify-between items-center group cursor-pointer p-2 rounded-2xl hover:bg-background/50 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-background text-secondary rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xs group-hover:bg-secondary-light/20 transition-colors shrink-0">
                              <Gift size={16} />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-black text-primary group-hover:text-secondary transition-colors truncate">{gift.gift_name}</h4>
                              <p className="text-[10px] sm:text-xs text-primary-muted font-bold mt-0.5 truncate">{gift.user_name} • {gift.city || 'المملكة'}</p>
                            </div>
                          </div>
                          <ChevronLeft size={16} className="text-secondary-light group-hover:translate-x-1 transition-all shrink-0" />
                        </div>
                      </Link>
                    )) : (
                      <p className="text-center text-primary-muted font-bold text-xs sm:text-sm py-8 sm:py-10">لا توجد عطايا مسجلة بعد.</p>
                    )
                  )}
                </div>
              </div>
              <Link href={!isSeeker ? "/my-gifts" : "/needs/giftbrowser"}>
                <button className="w-full mt-6 sm:mt-8 py-3 sm:py-3.5 text-xs font-black text-primary-muted hover:text-primary bg-background rounded-2xl transition-colors active:scale-95">
                  {!isSeeker ? "سجل جميع عطاياي" : "استكشاف جميع العطايا"}
                </button>
              </Link>
            </div>

            {/* 3. Impact Stats / Info Card */}
            <div className="bg-primary rounded-3xl md:rounded-[40px] p-6 sm:p-7 md:p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-xl">
              <div className="relative z-10">
                <h3 className="text-base sm:text-lg font-black mb-4 sm:mb-6">إحصائيات مجتمعنا</h3>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 rounded-xl flex items-center justify-center text-secondary shrink-0">
                      <Sparkles size={18} className="sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <p className="text-[9px] sm:text-[10px] opacity-70 font-bold uppercase tracking-wider">إجمالي نقاط الأثر</p>
                      <h4 className="text-lg sm:text-xl font-black">{stats?.total_impact_points || 0}</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 rounded-xl flex items-center justify-center text-secondary shrink-0">
                      <Users size={18} className="sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <p className="text-[9px] sm:text-[10px] opacity-70 font-bold uppercase tracking-wider">صانعات الأثر</p>
                      <h4 className="text-lg sm:text-xl font-black">{stats?.total_volunteers || 0}</h4>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-white/80 font-medium leading-relaxed mt-6 sm:mt-8">
                  {isSeeker
                    ? "نحن هنا لخدمتكِ، كل مبادرة هي هدية من القلب لنشر بركة القرآن."
                    : "كل ختمة قرآن تسجلينها تفتح باباً جديداً من أبواب الأثر في مجتمعكِ."}
                </p>
              </div>
              <div className="absolute -left-10 -bottom-10 opacity-10 pointer-events-none">
                <Sparkles size={200} color="var(--color-secondary)" />
              </div>
              <Link href="/profile" className="w-full">
                <button className="bg-white text-primary py-3 sm:py-3.5 rounded-2xl font-black text-xs z-10 w-full hover:bg-background transition-all mt-6 sm:mt-8 active:scale-95 shadow-sm">
                  عرض ملفي الشخصي
                </button>
              </Link>
            </div>
          </section>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
};

export default UserDashboard;
