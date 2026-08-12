import { useEffect, useState } from 'react';
import Link from 'next/link';
import ImpactMap from '../components/maps/ImpactMap';
import AppShell from '../components/ui/AppShell';
import Hero from '../components/ui/Hero';
import { getStats } from '@/services/api';
import {
  BookOpen,
  Heart,
  LayoutGrid,
  Users,
  Video,
  PenTool,
  FileText,
  Plus,
  Info,
  ChevronLeft,
  Gift,
  Map as MapIcon,
  User as UserIcon
} from 'lucide-react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    getStats()
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Stats fetch error:', err);
        setLoading(false);
      });
  }, []);

  const landingHero = (
    <Hero
      title="كل ختمة .. تثمر أثراً"
      subtitle="حولِي ختمة القُرآن إلى هدية للمجتمع واصبحي جزءاً من صناعة الأثر."
      variant="primary"
      graphic={
        <img
          src="/holy-quran-bgr.png"
          alt="Quran"
          className="object-cover w-full h-full drop-shadow-[-20px_4px_12px_rgba(94,32,59,0.15)] max-w-xs md:max-w-md lg:max-w-lg"
        />
      }
      actions={
        <>
          <Link href="/khatma/register" className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-[#4a1a2f] transition-all shadow-xl shadow-primary/10 active:scale-95">
            <Plus size={18} /> سجلي ختمتك
          </Link>
          <button className="bg-white text-primary border border-secondary-light/30 px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-background transition-all shadow-sm active:scale-95">
            <Info size={18} /> اعرفي المزيد
          </button>
        </>
      }
    />
  );

  return (
    <AppShell hero={landingHero}>
      <div className="space-y-8">
        {/* Service Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 py-4">
          {[
            { icon: <BookOpen />, label: 'إهداء مصحف', color: 'bg-background text-accent' },
            { icon: <Users />, label: 'تحفيظ الأطفال', color: 'bg-background text-primary' },
            { icon: <UserIcon />, label: 'تحفيظ كبار السن', color: 'bg-background text-secondary' },
            { icon: <Heart />, label: 'تعليم الدين للخادمات', color: 'bg-background text-red-600' },
            { icon: <Video />, label: 'تقديم غرفة زوم', color: 'bg-background text-blue-600' },
            { icon: <PenTool />, label: 'تصميم إعلان', color: 'bg-background text-secondary' },
            { icon: <FileText />, label: 'كتابة محتوى', color: 'bg-background text-primary' },
            { icon: <LayoutGrid />, label: 'المزيد', color: 'bg-background text-primary-muted' },
          ].map((service, i) => (
            <div key={i} className="flex flex-col items-center gap-3 group cursor-pointer">
              <div className={`w-14 h-14 md:w-16 md:h-16 ${service.color} rounded-2xl flex items-center justify-center text-xl md:text-2xl shadow-sm group-hover:scale-110 transition-transform border border-secondary-light/20`}>
                {service.icon}
              </div>
              <span className="text-sm font-black text-primary text-center">{service.label}</span>
            </div>
          ))}
        </section>

        {/* Map and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Stats Card */}
           <div className="lg:col-span-3 order-2 lg:order-1">
              <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-secondary-light/30 shadow-sm h-full">
                 <h3 className="text-lg font-black text-primary mb-6 md:mb-8">إحصائيات الأثر</h3>
                 <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
                    {[
                      { name: 'عدد الختمات', val: stats?.total_khatmas || 0, icon: '📖', color: 'bg-background' },
                      { name: 'عدد المبادرات', val: stats?.active_initiatives || 0, icon: '🎁', color: 'bg-background' },
                      { name: 'عدد المستفيدين', val: stats?.total_volunteers || 0, icon: '✨', color: 'bg-background' },
                      { name: 'ساعات التطوع', val: stats?.impact_hours || 0, icon: '🕒', color: 'bg-background' }
                    ].map((stat, i) => (
                      <div key={i} className="flex items-center gap-4">
                         <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center text-lg shadow-sm border border-secondary-light/20`}>{stat.icon}</div>
                         <div className="flex-1">
                            <p className="text-sm text-primary-muted font-bold">{stat.name}</p>
                            <h4 className="text-lg font-black text-primary">
                               {mounted ? (stat.val || 0).toLocaleString() : stat.val}
                            </h4>
                         </div>
                      </div>
                    ))}
                 </div>
                 <button className="w-full mt-8 py-3 bg-background text-primary-muted rounded-2xl text-sm font-black hover:bg-secondary-light/20 transition-colors">عرض التقارير التفصيلية</button>
              </div>
           </div>

           {/* Map Area */}
           <div className="lg:col-span-6 order-1 lg:order-2">
              <ImpactMap />
           </div>

           {/* Journey Card */}
           <div className="lg:col-span-3 order-3">
              <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-secondary-light/30 shadow-sm h-full flex flex-col">
                <h3 className="text-lg font-black text-primary mb-8">رحلة الختمة إلى الأثر</h3>
                <div className="space-y-8 relative flex-1">
                  <div className="absolute right-[17px] top-2 bottom-2 w-0.5 bg-background"></div>
                  {[
                    { step: 1, title: 'ختم القرآن', desc: 'سجلي ختمتك بسهولة', status: 'completed' },
                    { step: 2, title: 'اختاري هديتك', desc: 'حددي الهدية التي تودين تقديمها', status: 'current' },
                    { step: 3, title: 'قدمي الأثر', desc: 'نفذي الهدية ويشاركك الأثر', status: 'upcoming' },
                    { step: 4, title: 'يظهر أثرك', desc: 'تضاف هديتك على خريطة الأثر', status: 'upcoming' }
                  ].map((s, i) => (
                    <div key={i} className="flex items-start gap-4 relative z-10">
                      <div className="flex flex-col items-center shrink-0">
                        {s.status === 'completed' ? (
                          <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white shadow-sm border-4 border-white">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </div>
                        ) : s.status === 'current' ? (
                          <div className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-secondary bg-white shadow-sm">
                            <div className="w-3 h-3 bg-secondary rounded-full"></div>
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-full border-2 border-background bg-white shadow-sm"></div>
                        )}
                      </div>
                      <div className="bg-white pr-2 py-1">
                        <h4 className={`text-base font-black ${s.status === 'upcoming' ? 'text-secondary-light' : 'text-primary'}`}>{s.title}</h4>
                        <p className="text-sm text-primary-muted mt-1 font-bold leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
           </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
           {/* Start Gift Card */}
           <div className="bg-secondary rounded-[32px] md:rounded-[40px] p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-xl min-h-[250px] border border-white/20">
              <div className="relative z-10">
                 <h3 className="text-3xl font-black mb-3 text-primary">بدئي بأول هدية</h3>
                 <p className="text-primary/80 text-sm font-bold leading-relaxed opacity-80">واجعلي ختمتك بداية لأثر جميل</p>
              </div>
              <div className="absolute -left-10 -bottom-10 opacity-10">
                 <Gift size={200} color="var(--color-primary)" />
              </div>
              <button className="bg-white text-primary py-4 rounded-2xl font-black text-sm z-10 w-full hover:bg-background transition-all mt-8 active:scale-95 shadow-lg">تصفحي الهدايا</button>
           </div>

           {/* Recent Gifts */}
           <div className="bg-white p-8 rounded-[32px] md:rounded-[40px] border border-secondary-light/30 shadow-sm">
              <h3 className="text-lg font-black text-primary mb-6 border-b border-background pb-4 text-center">أحدث الهدايا</h3>
              <div className="space-y-6">
                 {[
                   { name: 'إهداء مصحف', time: 'منذ ساعتين', icon: <BookOpen size={14} />, color: 'bg-background text-accent' },
                   { name: 'تحفيظ طفلين', time: 'منذ 5 ساعات', icon: <Users size={14} />, color: 'bg-background text-primary' },
                   { name: 'تصميم إعلان', time: 'منذ يوم', icon: <PenTool size={14} />, color: 'bg-background text-secondary' }
                 ].map((gift, i) => (
                   <div key={i} className="flex justify-between items-center group cursor-pointer">
                      <div className="flex items-center gap-4">
                         <div className={`w-8 h-8 ${gift.color} rounded-lg flex items-center justify-center shadow-sm border border-secondary-light/10`}>{gift.icon}</div>
                         <div>
                           <h4 className="text-sm font-black text-primary group-hover:text-secondary transition-colors">{gift.name}</h4>
                           <p className="text-xs text-primary-muted font-bold mt-0.5">{gift.time}</p>
                         </div>
                      </div>
                      <ChevronLeft size={14} className="text-secondary-light group-hover:translate-x-1 transition-all" />
                   </div>
                 ))}
              </div>
              <button className="w-full mt-6 py-3 text-sm font-black text-primary-muted hover:text-primary bg-background rounded-xl transition-colors">عرض جميع الهدايا</button>
           </div>

           {/* Community Needs */}
           <div className="bg-white p-8 rounded-[32px] md:rounded-[40px] border border-secondary-light/30 shadow-sm h-full">
              <h3 className="text-lg font-black text-primary mb-6 border-b border-background pb-4 text-center">طلبات المحتاجين</h3>
              <div className="space-y-6">
                {[
                  { name: 'نحتاج إلى معلم لتحفيظ الأطفال', loc: 'الرياض - حي السلام', icon: <MapIcon size={14} /> },
                  { name: 'مطلوب مصحف للتعلم', loc: 'جدة - حي الروضة', icon: <BookOpen size={14} /> },
                  { name: 'مطلوب تصميم إعلان لمبادرة', loc: 'الدمام - حي الفيصلية', icon: <PenTool size={14} /> }
                ].map((need, i) => (
                  <div key={i} className="flex items-start gap-4 group cursor-pointer">
                      <div className="w-8 h-8 bg-background text-accent rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-secondary-light/10">{need.icon}</div>
                      <div>
                        <h4 className="text-sm font-black text-primary leading-tight group-hover:text-accent transition-colors">{need.name}</h4>
                        <p className="text-xs text-primary-muted mt-1.5 font-bold">{need.loc}</p>
                      </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-3 text-sm font-black text-primary-muted hover:text-accent bg-background rounded-xl transition-colors">عرض جميع الطلبات</button>
           </div>
        </div>

        {/* Inspiring Initiatives Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
           <div className="lg:col-span-8 bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-secondary-light/30 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-6 max-w-md w-full text-center md:text-right">
                 <h3 className="text-lg font-black text-primary">مبادرات ملهمة</h3>
                 <div className="flex items-center justify-center md:justify-start gap-4">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sara" className="w-16 h-16 rounded-full bg-background border-2 border-secondary-light/50 p-0.5 shadow-sm" />
                    <div className="text-right">
                       <h4 className="text-sm font-black text-primary">أم سارة</h4>
                       <div className="bg-primary text-white text-[9px] font-black px-3 py-1 rounded-full mt-1 inline-block">صانعة أثر</div>
                    </div>
                 </div>
                 <p className="text-sm text-primary-muted font-bold leading-relaxed">
                    من الخاتمات المؤثرات في مجتمعنا <br />
                    قدمت أكثر من 10 مبادرات متنوعة
                 </p>
                 <button className="text-sm font-black text-secondary flex items-center justify-center md:justify-start gap-2 hover:translate-x-1 transition-transform mx-auto md:mr-0">
                    تعرفي على قصتها <ChevronLeft size={14} />
                 </button>
              </div>
              <div className="h-48 md:h-full flex items-center justify-center">
                 <img src="https://img.freepik.com/free-vector/hand-drawn-muslim-woman-illustration_23-2149175232.jpg" className="h-full object-contain transform scale-110" />
              </div>
           </div>

           <div className="lg:col-span-4 bg-primary rounded-[32px] md:rounded-[40px] p-8 flex flex-col items-center justify-center text-center text-white relative overflow-hidden group min-h-[250px] shadow-xl border border-white/10">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                 <BookOpen size={120} color="var(--color-secondary)" />
              </div>
              <h3 className="text-xl font-black mb-4 relative z-10">الإعدادات</h3>
              <p className="text-sm text-secondary-light mb-6 opacity-70 relative z-10 font-bold">تحكمي في حسابك وتفضيلاتك</p>
              <button className="bg-white/10 hover:bg-white/20 text-white py-3 px-8 rounded-2xl text-sm font-black transition-colors relative z-10 border border-white/20 active:scale-95">انتقلي للإعدادات</button>
           </div>
        </div>
      </div>
    </AppShell>
  );
}
