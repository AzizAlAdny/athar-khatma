'use client';

import Link from 'next/link';
import AppShell from '@/components/ui/AppShell';
import Button from '@/components/ui/Button';
import Hero from '@/components/ui/Hero';
import ImpactMap from '@/components/maps/ImpactMap';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import {
  BookOpen,
  Heart,
  Pencil,
  Sparkles,
  UserPlus,
  Gift,
  Video,
  MapPin,
  ChevronLeft,
  Plus
} from 'lucide-react';

const options = [
  { label: 'تحفيظ كبيرات السن', icon: UserPlus, color: 'bg-orange-50 text-orange-600' },
  { label: 'تحفيظ صغار', icon: Heart, color: 'bg-purple-50 text-purple-600' },
  { label: 'تعليم خادمات', icon: BookOpen, color: 'bg-green-50 text-green-600' },
  { label: 'تقديم غرفة زوم', icon: Video, color: 'bg-blue-50 text-blue-600' },
  { label: 'تصميم إعلان', icon: Sparkles, color: 'bg-pink-50 text-pink-600' },
  { label: 'كتابة محتوى', icon: Pencil, color: 'bg-indigo-50 text-indigo-600' },
  { label: 'إهداء مصحف', icon: Gift, color: 'bg-emerald-50 text-emerald-600' },
];

const requests = [
  { title: 'إعداد مصحف', subtitle: 'طلب من مدرسة الأثر', loc: 'الرياض' },
  { title: 'تحفيظ طفلين', subtitle: 'طلب من معلمة في الرياض', loc: 'جدة' },
  { title: 'تصميم إعلان', subtitle: 'طلب لحملة خيرية', loc: 'الدمام' },
];

const gifts = [
  { title: 'إعداد مصحف', user: 'فريق الأثر', time: 'منذ ساعتين' },
  { title: 'تحفيظ أطفال', user: 'رياض الخبراء', time: 'منذ 5 ساعات' },
  { title: 'تصميم إعلان', user: 'حملة خيرية', time: 'منذ يوم' },
];

const UserDashboard = () => {
  const dashboardHero = (
    <Hero
      title="مرحباً بكِ في ختمة وأثر "
      subtitle="تابعي ختماتكِ، وأضيفي أثراً جديداً في مجتمعكِ اليوم."
      variant="primary"
      actions={
        <>
          <Link href="/khatma/register" className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-[#4a1a2f] transition-all shadow-xl shadow-primary/10 active:scale-95">
            <Plus size={18} /> سجلي ختمتك
          </Link>
          <button className="bg-white text-primary border border-secondary-light/30 px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-background transition-all shadow-sm active:scale-95">
            <Sparkles size={18} /> تابعي أثرك
          </button>
        </>
      }
    />
  );

  return (
    <ProtectedRoute>
      <AppShell hero={dashboardHero}>
        <div className="space-y-8">
          {/* Quick Options Grid */}
          <section className="grid gap-4 grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
            {options.map(({ label, icon: Icon, color }) => (
              <button
                key={label}
                type="button"
                className="group flex flex-col items-center gap-3 p-4 rounded-[32px] bg-white border border-secondary-light/10 shadow-sm transition-all hover:shadow-md active:scale-95"
              >
                <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon size={20} />
                </div>
                <span className="text-[11px] font-black text-primary text-center leading-tight">{label}</span>
              </button>
            ))}
          </section>

          {/* Map and Info Section */}
          <section className="grid gap-8 lg:grid-cols-12">
            {/* Map Column */}
            <div className="lg:col-span-8">
              <ImpactMap />
            </div>

            {/* Side Column: Journey & Quick Info */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white p-6 md:p-8 rounded-[40px] border border-secondary-light/30 shadow-sm h-full flex flex-col">
                <h3 className="text-lg font-black text-primary mb-6">الرحلة إلى الأثر</h3>
                <div className="space-y-6 relative flex-1">
                  <div className="absolute right-[17px] top-2 bottom-2 w-0.5 bg-background"></div>
                  {[
                    { step: '1', title: 'اختاري ختمتك', detail: 'حددي نوع الختمة وأهدافها.', status: 'completed' },
                    { step: '2', title: 'اضيفي هدية', detail: 'اكتملي بخيار هدية يرفع الأثر.', status: 'current' },
                    { step: '3', title: 'تابعي مساهمتك', detail: 'رصد الأثر يصل إليك بوضوح.', status: 'upcoming' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 relative z-10">
                      <div className="flex flex-col items-center shrink-0">
                        {item.status === 'completed' ? (
                          <div className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center text-white shadow-sm border-4 border-white">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </div>
                        ) : item.status === 'current' ? (
                          <div className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-secondary bg-white shadow-sm">
                            <div className="w-3 h-3 bg-secondary rounded-full"></div>
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-full border-2 border-background bg-white shadow-sm"></div>
                        )}
                      </div>
                      <div className="bg-white pr-2 py-1 text-right">
                        <p className={`text-sm font-black ${item.status === 'upcoming' ? 'text-secondary-light' : 'text-slate-900'}`}>{item.title}</p>
                        <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Lists Section */}
          <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Recent Gifts Card */}
            <div className="bg-white p-8 rounded-[40px] border border-secondary-light/30 shadow-sm flex flex-col">
              <h3 className="mb-6 text-lg font-black text-primary border-b border-background pb-4 text-center">أحدث الهدايا</h3>
              <div className="flex-1 space-y-6">
                {gifts.map((gift, i) => (
                  <div key={i} className="flex justify-between items-center group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-background text-secondary rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-secondary-light/20 transition-colors">
                        <Gift size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-gray-800 group-hover:text-secondary transition-colors">{gift.title}</h4>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">{gift.user} • {gift.time}</p>
                      </div>
                    </div>
                    <ChevronLeft size={16} className="text-secondary-light group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-4 text-xs font-black text-primary-muted hover:text-primary bg-background rounded-2xl transition-colors active:scale-95">عرض جميع الهدايا</button>
            </div>

            {/* Community Needs Card */}
            <div className="bg-white p-8 rounded-[40px] border border-secondary-light/30 shadow-sm flex flex-col">
              <h3 className="mb-6 text-lg font-black text-primary border-b border-background pb-4 text-center">طلبات تحتاج أثركِ</h3>
              <div className="flex-1 space-y-6">
                {requests.map((request, i) => (
                  <div key={i} className="flex items-start gap-4 group cursor-pointer">
                    <div className="w-10 h-10 bg-background text-accent rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-gray-800 leading-tight group-hover:text-accent transition-colors">{request.title}</h4>
                      <p className="text-[10px] text-gray-400 mt-1.5 font-bold flex items-center gap-1">
                        <span>{request.loc}</span>
                        <span>•</span>
                        <span>{request.subtitle}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-4 text-xs font-black text-primary-muted hover:text-accent bg-background rounded-2xl transition-colors active:scale-95">تصفحي جميع الطلبات</button>
            </div>

            {/* Inspiring Initiatives Card */}
            <div className="bg-primary rounded-[40px] p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-xl">
              <div className="relative z-10">
                <h3 className="text-xl font-black mb-4">مبادرات ملهمة</h3>
                <div className="flex items-center gap-4 mb-6">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sara" className="w-12 h-12 rounded-full bg-white/10 p-0.5 border border-white/20" />
                  <div>
                    <h4 className="text-sm font-black">أم سارة</h4>
                    <p className="text-[10px] text-secondary-muted opacity-70">رائدة مبادرات الأثر</p>
                  </div>
                </div>
                <p className="text-xs text-white/80 font-medium leading-relaxed opacity-80">
                  قصة نجاح بدأت بختمة قرآن واحدة وتحولت إلى 10 مبادرات مجتمعية مؤثرة.
                </p>
              </div>
              <div className="absolute -left-10 -bottom-10 opacity-10">
                <Sparkles size={200} color="var(--color-secondary)" />
              </div>
              <button className="bg-white text-primary py-4 rounded-2xl font-black text-xs z-10 w-full hover:bg-background transition-all mt-8 active:scale-95">اقرئي قصتها</button>
            </div>
          </section>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
};

export default UserDashboard;
