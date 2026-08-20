'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/ui/AppShell';
import Button from '@/components/ui/Button';
import Hero from '@/components/ui/Hero';
import ImpactMap from '@/components/maps/ImpactMap';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { getRecentGifts, getSeekerNeeds, getPublicStats, KhatmaGift, SeekerNeed } from '@/services/api';
import {
  BookOpen,
  Heart,
  Pencil,
  Sparkles,
  UserPlus,
  User,
  Gift,
  Video,
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
  const [stats, setStats] = useState<any>(null);
  const [recentGifts, setRecentGifts] = useState<KhatmaGift[]>([]);
  const [recentNeeds, setRecentNeeds] = useState<SeekerNeed[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, giftsData, needsData] = await Promise.all([
          getPublicStats(),
          getRecentGifts(),
          getSeekerNeeds()
        ]);
        setStats(statsData);
        setRecentGifts((giftsData || []).slice(0, 3));
        setRecentNeeds((needsData || []).filter(n => n.status === 'open').slice(0, 3));
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const isSeeker = user?.role === 'seeker';

  const dashboardHero = (
    <Hero
      title={isSeeker ? "مرحباً بكِ في مجتمع الأثر" : "مرحباً بكِ صانعة الأثر"}
      subtitle={isSeeker ? "سجلي احتياجكِ اليوم وستجدين الدعم من صانعات الأثر في مجتمعنا." : "تابعي ختماتكِ، وأضيفي أثراً جديداً في مجتمعكِ اليوم."}
      variant="primary"
      centered={true}
      actions={
        <>
          {isSeeker ? (
            <Link href="/needs/register" className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-xl shadow-primary/10 active:scale-95">
              <Plus size={18} /> سجلي احتياجكِ
            </Link>
          ) : (
            <Link href="/khatma/register" className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-xl shadow-primary/10 active:scale-95">
              <Plus size={18} /> سجلي ختمتكِ
            </Link>
          )}
          <Link href={isSeeker ? "/needs/giftbrowser" : "/my-gifts"} className="bg-white text-primary border border-secondary-light/30 px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-background transition-all shadow-sm active:scale-95">
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
        <div className="space-y-8">
          {/* Quick Action Grid */}
          <section className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {activeOptions.map(({ label, icon: Icon, color, href }) => (
              <Link key={label} href={href}>
                <button
                  type="button"
                  className="w-full group flex flex-col items-center gap-3 p-6 rounded-[32px] bg-white border border-secondary-light/10 shadow-sm transition-all hover:shadow-md active:scale-95"
                >
                  <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                  </div>
                  <span className="text-base font-black text-primary text-center leading-tight">{label}</span>
                </button>
              </Link>
            ))}
          </section>

          {/* Map and Info Section */}
          <section className="grid gap-8 lg:grid-cols-12">
            {/* Map Column */}
            <div className="lg:col-span-8">
              <ImpactMap />
            </div>

            {/* Side Column: Steps/Journey */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white p-6 md:p-8 rounded-[40px] border border-secondary-light/30 shadow-sm h-full flex flex-col">
                <h3 className="text-lg font-black text-primary mb-6">{isSeeker ? "كيف تحصلين على الدعم" : "الرحلة إلى الأثر"}</h3>
                <div className="space-y-6 relative flex-1">
                  <div className="absolute right-[17px] top-2 bottom-2 w-0.5 bg-secondary-light"></div>
                  {(isSeeker ? [
                    { title: 'سجلي احتياجكِ', detail: 'صفي نوع المساعدة التي تحتاجينها.', status: 'completed' },
                    { title: 'تواصلي مع الخاتمة', detail: 'نسقي التفاصيل عبر الدردشة الخاصة.', status: 'completed' },
                    { title: 'تمت تلبية الطلب', detail: 'أغلقي الطلب وقيمي التجربة.', status: 'completed' },
                  ] : [
                    { title: 'اختاري ختمتكِ', detail: 'حددي تاريخ ختمتكِ وأهدافها.', status: 'completed' },
                    { title: 'أضيفي عطاياكِ', detail: 'حددي الخدمات التي تودين تقديمها.', status: 'completed' },
                    { title: 'اصنعي الأثر', detail: 'لبي طلبات المجتمع وتابعي نقاطكِ.', status: 'completed' },
                  ]).map((item, i) => (
                    <div key={i} className="flex items-start gap-4 relative z-10">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white shadow-sm border-4 border-white">
                          <CheckCircle2 size={14} />
                        </div>
                      </div>
                      <div className="bg-white pr-2 py-1 text-right">
                        <p className="text-base font-black text-primary">{item.title}</p>
                        <p className="text-sm text-primary-muted font-medium mt-1 leading-relaxed">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Feed Section */}
          <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Community Needs Feed */}
            <div className="bg-white p-8 rounded-[40px] border border-secondary-light/30 shadow-sm flex flex-col">
              <h3 className="mb-6 text-lg font-black text-primary border-b border-background pb-4 text-center">طلبات تحتاج أثركِ</h3>
              <div className="flex-1 space-y-6">
                {recentNeeds.length > 0 ? recentNeeds.map((need, i) => (
                  <Link key={i} href="/needs/browse">
                    <div className="flex justify-between items-center group cursor-pointer mb-6 last:mb-0">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-background text-accent rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-primary group-hover:text-accent transition-colors">{need.gift?.name || 'طلب مساعدة'}</h4>
                          <p className="text-xs text-primary-muted font-bold mt-0.5">{need.city} • {need.created_at_human}</p>
                        </div>
                      </div>
                      <ChevronLeft size={16} className="text-secondary-light group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                )) : (
                  <p className="text-center text-primary-muted font-bold py-10">لا توجد طلبات جديدة حالياً.</p>
                )}
              </div>
              <Link href="/needs/browse">
                <button className="w-full mt-8 py-4 text-xs font-black text-primary-muted hover:text-accent bg-background rounded-2xl transition-colors active:scale-95">عرض جميع الطلبات</button>
              </Link>
            </div>

            {/* Community Gifts Feed */}
            <div className="bg-white p-8 rounded-[40px] border border-secondary-light/30 shadow-sm flex flex-col">
              <h3 className="mb-6 text-lg font-black text-primary border-b border-background pb-4 text-center">أحدث العطايا</h3>
              <div className="flex-1 space-y-6">
                {recentGifts.length > 0 ? recentGifts.map((gift, i) => (
                  <Link key={i} href="/needs/giftbrowser">
                    <div className="flex justify-between items-center group cursor-pointer mb-6 last:mb-0">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-background text-secondary rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-secondary-light/20 transition-colors">
                          <Gift size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-primary group-hover:text-secondary transition-colors">{gift.gift_name}</h4>
                          <p className="text-xs text-primary-muted font-bold mt-0.5">{gift.user_name} • {gift.city}</p>
                        </div>
                      </div>
                      <ChevronLeft size={16} className="text-secondary-light group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                )) : (
                  <p className="text-center text-primary-muted font-bold py-10">لا توجد عطايا مسجلة بعد.</p>
                )}
              </div>
              <Link href="/needs/giftbrowser">
                <button className="w-full mt-8 py-4 text-xs font-black text-primary-muted hover:text-primary bg-background rounded-2xl transition-colors active:scale-95">استكشاف جميع العطايا</button>
              </Link>
            </div>

            {/* Impact Stats / Info Card */}
            <div className="bg-primary rounded-[40px] p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-xl">
              <div className="relative z-10">
                <h3 className="text-lg font-black mb-6">إحصائيات مجتمعنا</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-secondary">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] opacity-70 font-bold uppercase tracking-wider">إجمالي نقاط الأثر</p>
                      <h4 className="text-xl font-black">{stats?.total_impact_points || 0}</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-secondary">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] opacity-70 font-bold uppercase tracking-wider">صانعات الأثر</p>
                      <h4 className="text-xl font-black">{stats?.total_volunteers || 0}</h4>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-white/80 font-medium leading-relaxed mt-10">
                  {isSeeker
                    ? "نحن هنا لخدمتكِ، كل مبادرة هي هدية من القلب لنشر بركة القرآن."
                    : "كل ختمة قرآن تسجلينها تفتح باباً جديداً من أبواب الأثر في مجتمعكِ."}
                </p>
              </div>
              <div className="absolute -left-10 -bottom-10 opacity-10">
                <Sparkles size={200} color="var(--color-secondary)" />
              </div>
              <Link href="/profile" className="w-full">
                <button className="bg-white text-primary py-4 rounded-2xl font-black text-xs z-10 w-full hover:bg-background transition-all mt-8 active:scale-95">عرض ملفي الشخصي</button>
              </Link>
            </div>
          </section>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
};

export default UserDashboard;
