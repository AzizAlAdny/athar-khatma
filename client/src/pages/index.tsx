import { useEffect, useState } from 'react';
import Link from 'next/link';
import ImpactMap from '../components/maps/ImpactMap';
import AppShell from '../components/ui/AppShell';
import Hero from '../components/ui/Hero';
import { getPublicStats, getNeeds, getMapPins, getRecentGifts, Need, KhatmaPin, RecentGift } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

// Human-friendly Arabic relative time for the gifts feed.
const timeAgo = (iso?: string) => {
  if (!iso) return '';
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'الآن';
  if (mins === 1) return 'منذ دقيقة';
  if (mins === 2) return 'منذ دقيقتين';
  if (mins < 11) return `منذ ${mins} دقائق`;
  if (mins < 60) return `منذ ${mins} دقيقة`;

  const hours = Math.floor(mins / 60);
  if (hours === 1) return 'منذ ساعة';
  if (hours === 2) return 'منذ ساعتين';
  if (hours < 11) return `منذ ${hours} ساعات`;
  if (hours < 24) return `منذ ${hours} ساعة`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'منذ يوم';
  if (days === 2) return 'منذ يومين';
  if (days < 11) return `منذ ${days} أيام`;

  return new Date(iso).toLocaleDateString('ar-SA');
};
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
  LogIn,
  UserPlus,
  Map as MapIcon,
  User as UserIcon
} from 'lucide-react';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [pins, setPins] = useState<KhatmaPin[]>([]);
  const [recentGifts, setRecentGifts] = useState<RecentGift[]>([]);
  const [feedsLoading, setFeedsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    getPublicStats()
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Stats fetch error:', err);
        setLoading(false);
      });
    Promise.allSettled([getNeeds(), getMapPins(), getRecentGifts()])
      .then(([needsRes, pinsRes, recentRes]) => {
        if (needsRes.status === 'fulfilled') setNeeds(needsRes.value || []);
        if (pinsRes.status === 'fulfilled') setPins(pinsRes.value || []);
        if (recentRes.status === 'fulfilled') setRecentGifts(recentRes.value || []);
        setFeedsLoading(false);
      });
  }, []);

  // Real gifts feed: prefer the chronological API; fall back to map-pin services.
  const giftsFeed = (recentGifts.length > 0
    ? recentGifts.map(g => ({ name: g.gift_name, by: g.user_name, meta: timeAgo(g.created_at) }))
    : pins.flatMap(p => (p.services || []).map(service => ({ name: service, by: p.user_name, meta: p.city || '' })))
  ).slice(0, 3);

  // Real top contributor, taken from the public impact-map pins.
  const topContributor = pins.length > 0
    ? [...pins].sort((a, b) => (b.total_impact || 0) - (a.total_impact || 0))[0]
    : null;

  // Guests get signup/login CTAs; signed-in users go to their role's main action.
  const primaryAction = !isAuthenticated ? (
    <Link href="/auth/register" className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-[#4a1a2f] transition-all shadow-xl shadow-primary/10 active:scale-95">
      <UserPlus size={18} />تسجيل
    </Link>
  ) : user?.role === 'seeker' ? (
    <Link href="/needs" className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-[#4a1a2f] transition-all shadow-xl shadow-primary/10 active:scale-95">
      <Plus size={18} /> سجلي احتياجك
    </Link>
  ) : (
    <Link href="/khatma/register" className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-[#4a1a2f] transition-all shadow-xl shadow-primary/10 active:scale-95">
      <Plus size={18} /> سجلي ختمتك
    </Link>
  );

  const secondaryAction = !isAuthenticated ? (
    <Link href="/auth/login" className="bg-white text-primary border border-secondary-light/30 px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-background transition-all shadow-sm active:scale-95">
      <LogIn size={18} />دخول
    </Link>
  ) : user?.role === 'seeker' ? (
    <Link href="/needs" className="bg-white text-primary border border-secondary-light/30 px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-background transition-all shadow-sm active:scale-95">
      <Info size={18} /> طلباتي
    </Link>
  ) : (
    <Link href="/needs/browse" className="bg-white text-primary border border-secondary-light/30 px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-background transition-all shadow-sm active:scale-95">
      <Info size={18} /> تصفح الطلبات
    </Link>
  );

  const landingHero = (
    <Hero
      title={<>كل ختمة .. <span className="text-accent">تثمر أثراً</span></>}
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
          {primaryAction}
          {secondaryAction}
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
            { label: 'إهداء مصحف', icon: BookOpen, color: 'bg-background text-secondary' },
            { label: 'تحفيظ الأطفال', icon: Users, color: 'bg-background text-primary' },
            { label: 'تحفيظ كبار السن', icon: UserIcon, color: 'bg-background text-secondary' },
            { label: 'تعليم الدين للخادمات', icon: Heart, color: 'bg-background text-accent' },
            { label: 'تقديم غرفة زوم', icon: Video, color: 'bg-background text-secondary-dark' },
            { label: 'تصميم إعلان', icon: PenTool, color: 'bg-background text-secondary-muted' },
            { label: 'كتابة محتوى', icon: FileText, color: 'bg-background text-primary-muted' },
            { label: 'المزيد', icon: LayoutGrid, color: 'bg-background text-primary-muted' },
          ].map(({ label, icon: Icon, color }) => (
            <Link
              key={label}
              href="/needs/browse"
              className="group flex flex-col items-center gap-3 p-4 rounded-[32px] bg-white border border-secondary-light/10 shadow-sm transition-all hover:shadow-md active:scale-95"
            >
              <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                <Icon size={20} />
              </div>
              <span className="text-sm font-black text-primary text-center leading-tight">{label}</span>
            </Link>
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
                      {loading ? (
                        <div className="h-6 w-16 bg-background rounded-lg animate-pulse mt-1"></div>
                      ) : (
                        <h4 className="text-lg font-black text-primary">
                          {mounted ? (stat.val || 0).toLocaleString() : stat.val}
                        </h4>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {user?.role === 'admin' && (
                <Link href="/admin" className="block w-full mt-8 py-3 bg-background text-primary-muted rounded-2xl text-sm font-black hover:bg-secondary-light/20 transition-colors text-center">عرض التقارير التفصيلية</Link>
              )}
            </div>
          </div>

          {/* Map Area */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <ImpactMap />
          </div>

          {/* Journey Card */}
          <div className="lg:col-span-3 order-3">
            <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-secondary-light/30 shadow-sm h-full flex flex-col">
              <h3 className="text-lg font-black text-primary mb-8">كيف تعمل المنصة</h3>
              <div className="space-y-8 relative flex-1">
                <div className="absolute right-[17px] top-2 bottom-2 w-0.5 bg-secondary-light"></div>
                {[
                  { step: 1, title: 'ختم القرآن', desc: 'سجلي ختمتك بسهولة', status: 'completed' },
                  { step: 2, title: 'اختاري هديتك', desc: 'حددي الهدية التي تودين تقديمها', status: 'completed' },
                  { step: 3, title: 'قدمي الأثر', desc: 'نفذي الهدية ويشاركك الأثر', status: 'completed' },
                  { step: 4, title: 'يظهر أثرك', desc: 'تضاف هديتك على خريطة الأثر', status: 'completed' }
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
          <div className="bg-primary rounded-[32px] md:rounded-[40px] p-8 relative overflow-hidden flex flex-col justify-between shadow-xl min-h-[250px] border border-white/10">
            <div className="relative z-10">
              <h3 className="text-3xl font-black mb-3 text-secondary">ابداء بأول هدية</h3>
              <p className="text-secondary-light text-sm font-bold leading-relaxed opacity-80">واجعلي ختمتك بداية لأثر جميل</p>
            </div>
            <div className="absolute -left-10 -bottom-10 opacity-10">
              <Gift size={200} color="var(--color-secondary)" />
            </div>
            <Link href="/khatma/register" className="bg-secondary text-white py-4 rounded-2xl font-black text-sm z-10 w-full hover:bg-secondary-dark transition-all mt-8 active:scale-95 shadow-lg shadow-secondary/20 text-center">تصفح الهدايا</Link>
          </div>

          {/* Recent Gifts */}
          <div className="bg-white p-8 rounded-[32px] md:rounded-[40px] border border-secondary-light/30 shadow-sm">
            <h3 className="text-lg font-black text-primary mb-6 border-b border-background pb-4 text-center">أحدث الهدايا</h3>
            {feedsLoading ? (
              <div className="space-y-6">
                {[0, 1, 2].map(i => (
                  <div key={i} className="h-10 rounded-xl bg-background animate-pulse"></div>
                ))}
              </div>
            ) : giftsFeed.length > 0 ? (
              <div className="space-y-6">
                {giftsFeed.map((gift, i) => (
                  <div key={i} className="flex justify-between items-center group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-background text-secondary rounded-lg flex items-center justify-center shadow-sm border border-secondary-light/10"><Gift size={14} /></div>
                      <div>
                        <h4 className="text-sm font-black text-primary group-hover:text-secondary transition-colors">{gift.name}</h4>
                        <p className="text-xs text-primary-muted font-bold mt-0.5">بواسطة {gift.by}{gift.meta ? ` • ${gift.meta}` : ''}</p>
                      </div>
                    </div>
                    <ChevronLeft size={14} className="text-secondary-light group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-primary-muted font-bold text-center py-6">لا توجد هدايا مسجلة بعد.</p>
            )}
            <Link href="/needs/browse" className="block w-full mt-6 py-3 text-sm font-black text-primary-muted hover:text-primary bg-background rounded-xl transition-colors text-center">عرض جميع الهدايا</Link>
          </div>

          {/* Community Needs */}
          <div className="bg-white p-8 rounded-[32px] md:rounded-[40px] border border-secondary-light/30 shadow-sm h-full">
            <h3 className="text-lg font-black text-primary mb-6 border-b border-background pb-4 text-center">طلبات المحتاجين</h3>
            {feedsLoading ? (
              <div className="space-y-6">
                {[0, 1, 2].map(i => (
                  <div key={i} className="h-12 rounded-xl bg-background animate-pulse"></div>
                ))}
              </div>
            ) : needs.length > 0 ? (
              <div className="space-y-6">
                {needs.slice(0, 3).map((need) => (
                  <div key={need.id} className="flex items-start gap-4 group cursor-pointer">
                    <div className="w-8 h-8 bg-background text-accent rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-secondary-light/10"><MapIcon size={14} /></div>
                    <div>
                      <h4 className="text-sm font-black text-primary leading-tight group-hover:text-accent transition-colors">{need.gift?.name || 'طلب مساعدة'}</h4>
                      <p className="text-xs text-primary-muted mt-1.5 font-bold">{[need.city, need.neighborhood].filter(Boolean).join(' - ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-primary-muted font-bold text-center py-6">لا توجد طلبات احتياج حالياً.</p>
            )}
            <Link href="/needs/browse" className="block w-full mt-6 py-3 text-sm font-black text-primary-muted hover:text-accent bg-background rounded-xl transition-colors text-center">عرض جميع الطلبات</Link>
          </div>
        </div>

        {/* Inspiring Initiatives Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
          {topContributor && (
            <div className="lg:col-span-8 bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-secondary-light/30 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-6 max-w-md w-full text-center md:text-right">
                <h3 className="text-lg font-black text-primary">مبادرات ملهمة</h3>
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-background border-2 border-secondary-light/50 shadow-sm flex items-center justify-center text-secondary">
                    <UserIcon size={28} />
                  </div>
                  <div className="text-right">
                    <h4 className="text-sm font-black text-primary">{topContributor.user_name}</h4>
                    <div className="bg-primary text-white text-[9px] font-black px-3 py-1 rounded-full mt-1 inline-block">صانعة أثر</div>
                  </div>
                </div>
                <p className="text-sm text-primary-muted font-bold leading-relaxed">
                  من الخاتمات المؤثرات في مجتمعنا <br />
                  قدمت {(topContributor.services || []).length} {(topContributor.services || []).length === 1 ? 'مبادرة' : 'مبادرات'}{(topContributor.total_impact || 0) > 0 ? ` • ${topContributor.total_impact} نقطة أثر` : ''}
                </p>
              </div>
              <div className="h-48 md:h-full flex items-center justify-center">
                <img src="/holy-quran.png" alt="القرآن الكريم" className="h-full object-contain transform scale-110" />
              </div>
            </div>
          )}

          {!isAuthenticated ? (
            <div className={`${topContributor ? 'lg:col-span-4' : 'lg:col-span-12'} bg-primary rounded-[32px] md:rounded-[40px] p-8 flex flex-col items-center justify-center text-center text-white relative overflow-hidden group min-h-[250px] shadow-xl border border-white/10`}>
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <UserPlus size={120} color="var(--color-secondary)" />
              </div>
              <h3 className="text-xl font-black mb-4 relative z-10">انضمي إلينا</h3>
              <p className="text-sm text-secondary-light mb-6 opacity-70 relative z-10 font-bold">انشاء حسابك وابدائي صناعة الأثر اليوم</p>
              <Link href="/auth/register" className="bg-white text-primary py-3 px-8 rounded-2xl text-sm font-black transition-colors relative z-10 border border-white/20 active:scale-95">
                إنشاء حساب جديد
              </Link>
            </div>
          ) : (
            <div className={`${topContributor ? 'lg:col-span-4' : 'lg:col-span-12'} bg-primary rounded-[32px] md:rounded-[40px] p-8 flex flex-col items-center justify-center text-center text-white relative overflow-hidden group min-h-[250px] shadow-xl border border-white/10`}>
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <BookOpen size={120} color="var(--color-secondary)" />
              </div>
              <h3 className="text-xl font-black mb-4 relative z-10">الإعدادات</h3>
              <p className="text-sm text-secondary-light mb-6 opacity-70 relative z-10 font-bold">تحكمي في حسابك وتفضيلاتك</p>
              <Link href="/profile" className="bg-white/10 hover:bg-white/20 text-white py-3 px-8 rounded-2xl text-sm font-black transition-colors relative z-10 border border-white/20 active:scale-95">
                انتقلي للإعدادات
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
