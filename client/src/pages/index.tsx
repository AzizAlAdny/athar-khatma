import { useEffect, useState } from 'react';
import Link from 'next/link';
import ImpactMap from '../components/maps/ImpactMap';
import AppShell from '../components/ui/AppShell';
import Hero from '../components/ui/Hero';
import {
  getPublicStats,
  getNeeds,
  getMapPins,
  getRecentGifts,
  getVisitorMessages,
  createVisitorMessage,
  Need,
  KhatmaPin,
  RecentGift,
  VisitorMessage
} from '@/services/api';
import { useAuth } from '@/context/AuthContext';
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
  User as UserIcon,
  Sparkles,
  Clock,
  GraduationCap,
  LayoutDashboard,
  X
} from 'lucide-react';

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

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [pins, setPins] = useState<KhatmaPin[]>([]);
  const [recentGifts, setRecentGifts] = useState<RecentGift[]>([]);
  const [feedsLoading, setFeedsLoading] = useState(true);
  const [visitorMessages, setVisitorMessages] = useState<VisitorMessage[]>([]);
  const [visitorLoading, setVisitorLoading] = useState(true);
  const [showWordModal, setShowWordModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [newOrganization, setNewOrganization] = useState('');
  const [sendingWord, setSendingWord] = useState(false);
  const [wordSuccess, setWordSuccess] = useState<string | null>(null);

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
    Promise.allSettled([getNeeds(), getMapPins(), getRecentGifts(), getVisitorMessages(1, 6)])
      .then(([needsRes, pinsRes, recentRes, visitorRes]) => {
        if (needsRes.status === 'fulfilled') setNeeds(needsRes.value || []);
        if (pinsRes.status === 'fulfilled') setPins(pinsRes.value || []);
        if (recentRes.status === 'fulfilled') setRecentGifts(recentRes.value || []);
        if (visitorRes.status === 'fulfilled' && visitorRes.value?.data) {
          setVisitorMessages(visitorRes.value.data);
        }
        setFeedsLoading(false);
        setVisitorLoading(false);
      });
  }, []);

  const handleWordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sendingWord) return;

    setSendingWord(true);
    try {
      const res = await createVisitorMessage({
        message: newMessage.trim(),
        organization: newOrganization.trim() || undefined,
      });
      if (res?.data) {
        setVisitorMessages(prev => [res.data, ...prev]);
        setWordSuccess('تم تسجيل كلمتكِ المباركة بنجاح، شكراً لمشاركتكِ الكريمة!');
        setNewMessage('');
        setNewOrganization('');
        setTimeout(() => {
          setShowWordModal(false);
          setWordSuccess(null);
        }, 1800);
      }
    } catch (err: any) {
      console.error('Submit visitor word error:', err);
      alert(err.message || 'تعذر تسجيل الكلمة حالياً، يرجى المحاولة لاحقاً');
    } finally {
      setSendingWord(false);
    }
  };

  // Real gifts feed: prefer the chronological API; fall back to map-pin services.
  const giftsFeed = (recentGifts.length > 0
    ? recentGifts.map(g => ({ name: g.gift_name, by: g.user_name, meta: timeAgo(g.created_at) }))
    : pins.flatMap(p => (p.gifts || []).map((gift: string) => ({ name: gift, by: p.user_name, meta: p.city || '' })))
  ).slice(0, 3);

  // Real top contributor, taken from the public impact-map pins.
  const topContributor = pins.length > 0
    ? [...pins].sort((a, b) => (b.total_impact || 0) - (a.total_impact || 0))[0]
    : null;

  // Guests get signup/login CTAs; signed-in users go to their role's main action.
  const primaryAction = !isAuthenticated ? (
    <Link href="/auth/register" className="bg-primary text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-xl shadow-primary/10 active:scale-95">
      <UserPlus size={18} /> إنشاء حساب جديد
    </Link>
  ) : user?.role === 'admin' ? (
    <Link href="/admin" className="bg-primary text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-xl shadow-primary/10 active:scale-95">
      <LayoutDashboard size={18} /> لوحة التحكم والإشراف
    </Link>
  ) : user?.role === 'visitor' ? (
    <button
      type="button"
      onClick={() => setShowWordModal(true)}
      className="bg-primary text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-xl shadow-primary/10 active:scale-95 cursor-pointer"
    >
      <Heart size={18} className="text-secondary" /> أخبرينا عن رأيكِ بالمنصة
    </button>
  ) : user?.role === 'seeker' ? (
    <Link href="/needs/register" className="bg-primary text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-xl shadow-primary/10 active:scale-95">
      <Plus size={18} /> سجلي احتياجكِ
    </Link>
  ) : (
    <Link href="/khatma/register" className="bg-primary text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-xl shadow-primary/10 active:scale-95">
      <Plus size={18} /> سجلي ختمتكِ
    </Link>
  );

  const secondaryAction = !isAuthenticated ? (
    <Link href="/auth/login" className="bg-white text-primary border border-secondary-light/30 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-background transition-all shadow-sm active:scale-95">
      <LogIn size={18} /> تسجيل الدخول
    </Link>
  ) : user?.role === 'admin' ? (
    <Link href="/admin" className="bg-white text-primary border border-secondary-light/30 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-background transition-all shadow-sm active:scale-95">
      <Info size={18} /> إحصائيات المنصة
    </Link>
  ) : user?.role === 'visitor' ? (
    <Link href="/dashboard" className="bg-white text-primary border border-secondary-light/30 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-background transition-all shadow-sm active:scale-95">
      <Sparkles size={18} /> لوحة الزائرة
    </Link>
  ) : user?.role === 'seeker' ? (
    <Link href="/needs" className="bg-white text-primary border border-secondary-light/30 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-background transition-all shadow-sm active:scale-95">
      <Info size={18} /> طلباتي
    </Link>
  ) : (
    <Link href="/needs/browse" className="bg-white text-primary border border-secondary-light/30 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-background transition-all shadow-sm active:scale-95">
      <Info size={18} /> تصفح الطلبات
    </Link>
  );

  const isSeeker = user?.role === 'seeker';
  const isVisitor = user?.role === 'visitor';

  const welcomeMessage = user?.role === 'admin' ? (
    <span className="flex items-center gap-1.5">
      <span>🛡️</span>
      <span>مرحباً بكِ في لوحة التحكم والإشراف الإداري</span>
    </span>
  ) : isVisitor ? (
    <span className="flex items-center gap-1.5">
      <span>💐</span>
      <span>أهلاً وسهلاً بكِ ضيفتنا الكريمة</span>
    </span>
  ) : isSeeker ? (
    <span className="flex items-center gap-1.5">
      <span>🌸</span>
      <span>رسالة لكل صاحبة احتياج حددي احتياجك و نحن نلبيه</span>
    </span>
  ) : (
    <span className="flex items-center gap-1.5">
      <span>مرحبًا أهلاً و سعدًا بالمسجلات الجدد</span>
      <span>💐</span>
    </span>
  );

  const landingHero = (
    <Hero
      badge={welcomeMessage}
      title={<>كل ختمة .. <span className="text-accent">تثمر أثراً</span></>}
      subtitle="حولي ختمة القُرآن إلى عطاء مبارك للمجتمع وكوني جزءاً من صناعة الأثر."
      variant="primary"
      centered={true}
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
      <div className="space-y-8 sm:space-y-12">
        {/* Service Grid */}
        <section className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3 sm:gap-4 py-2 sm:py-4">
          {[
            { label: 'إهداء مصحف', icon: BookOpen, color: 'bg-background text-secondary' },
            { label: 'تحفيظ الأطفال', icon: Users, color: 'bg-background text-primary' },
            { label: 'تحفيظ الكبار', icon: UserIcon, color: 'bg-background text-secondary' },
            { label: 'تعليم الدين للخادمات', icon: Heart, color: 'bg-background text-accent' },
            { label: 'القاعدة النورانية', icon: GraduationCap, color: 'bg-background text-primary' },
            { label: 'تقديم غرفة زوم', icon: Video, color: 'bg-background text-secondary-dark' },
            { label: 'تصميم إعلان', icon: PenTool, color: 'bg-background text-secondary-muted' },
            { label: 'كتابة محتوى', icon: FileText, color: 'bg-background text-primary-muted' },
            { label: 'المزيد', icon: LayoutGrid, color: 'bg-background text-primary-muted' },
          ].map(({ label, icon: Icon, color }) => (
            <Link
              key={label}
              href="/needs/giftbrowser"
              className="group flex flex-col items-center gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-2xl sm:rounded-[32px] bg-white border border-secondary-light/10 shadow-sm transition-all hover:shadow-md active:scale-95"
            >
              <div className={`w-11 h-11 sm:w-12 sm:h-12 ${color} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                <Icon size={20} />
              </div>
              <span className="text-xs sm:text-sm font-black text-primary text-center leading-tight">{label}</span>
            </Link>
          ))}
        </section>

        {/* Row 1: 1) كيف تعمل المنصة + 2) ابدئي بأول عطاء */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* 1) Journey Card: كيف تعمل المنصة */}
          <div className="bg-white p-5 sm:p-6 md:p-8 rounded-3xl md:rounded-[40px] border border-secondary-light/30 shadow-sm h-full flex flex-col justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-black text-primary mb-6 sm:mb-8">كيف تعمل المنصة</h3>
              <div className="space-y-6 sm:space-y-8 relative flex-1">
                <div className="absolute right-[15px] sm:right-[17px] top-2 bottom-2 w-0.5 bg-secondary-light/60"></div>
                {[
                  { step: 1, title: 'ختم القرآن', desc: 'سجلي ختمتكِ بسهولة', status: 'completed' },
                  { step: 2, title: 'اختاري هديتكِ', desc: 'حددي الهدية التي تودين تقديمها', status: 'completed' },
                  { step: 3, title: 'قدمي الأثر', desc: 'نفذي الهدية وشاركي الأثر', status: 'completed' },
                  { step: 4, title: 'يظهر أثركِ', desc: 'تضاف هديتكِ على خريطة الأثر', status: 'completed' }
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-3 sm:gap-4 relative z-10">
                    <div className="flex flex-col items-center shrink-0">
                      {s.status === 'completed' ? (
                        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary rounded-full flex items-center justify-center text-white shadow-sm border-2 sm:border-4 border-white">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                      ) : (
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-background bg-white shadow-sm"></div>
                      )}
                    </div>
                    <div className="bg-white pr-1.5 sm:pr-2 py-0.5 text-right">
                      <h4 className="text-sm sm:text-base font-black text-primary">{s.title}</h4>
                      <p className="text-xs sm:text-sm text-primary-muted mt-0.5 sm:mt-1 font-bold leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2) Start Gift Card: ابدئي بأول عطاء */}
          <div className="bg-primary rounded-3xl md:rounded-[40px] p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between shadow-xl min-h-[240px] border border-white/10 h-full">
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl font-black mb-2 sm:mb-3 text-secondary">ابدئي بأول عطاء</h3>
              <p className="text-secondary-light text-xs sm:text-sm font-bold leading-relaxed opacity-90">واجعلي ختمتكِ بداية لأثر مبارك يمتد في المجتمع</p>
            </div>
            <div className="absolute -left-10 -bottom-10 opacity-10 pointer-events-none">
              <Gift size={200} color="var(--color-secondary)" />
            </div>
            <Link href="/khatma/register" className="bg-secondary text-white py-3.5 sm:py-4 rounded-2xl font-black text-xs sm:text-sm z-10 w-full hover:bg-secondary-dark transition-all mt-6 sm:mt-8 active:scale-95 shadow-lg shadow-secondary/20 text-center">
              سجلي ختمتكِ وعطائكِ ✨
            </Link>
          </div>
        </section>

        {/* Row 2: 3) إحصائيات الأثر + 4) الخريطة */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* 3) Stats Card: إحصائيات الأثر */}
          <div className="lg:col-span-4">
            <div className="bg-white p-5 sm:p-6 md:p-8 rounded-3xl md:rounded-[40px] border border-secondary-light/30 shadow-sm h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-5 sm:mb-8">
                  <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                    <Sparkles size={18} />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-primary">إحصائيات الأثر</h3>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 md:gap-5">
                  {[
                    { name: 'عدد الختمات', val: stats?.total_khatmas || 0, icon: BookOpen, color: 'bg-primary/10 text-primary' },
                    { name: 'مبادرات العطاء', val: stats?.active_initiatives || 0, icon: Gift, color: 'bg-secondary/10 text-secondary' },
                    { name: 'صانعات الأثر', val: stats?.total_volunteers || 0, icon: Users, color: 'bg-accent/10 text-accent' },
                    { name: 'ساعات الأثر', val: stats?.impact_hours || 0, icon: Clock, color: 'bg-secondary-light/30 text-primary-muted' }
                  ].map((stat, i) => {
                    const IconComponent = stat.icon;
                    return (
                      <div key={i} className="flex items-center gap-3 sm:gap-4 p-2 sm:p-2.5 rounded-2xl hover:bg-background/40 transition-colors">
                        <div className={`w-9 h-9 sm:w-11 sm:h-11 ${stat.color} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xs shrink-0`}>
                          <IconComponent size={18} className="sm:w-5 sm:h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] sm:text-xs text-primary-muted font-bold truncate">{stat.name}</p>
                          {loading ? (
                            <div className="h-5 w-14 bg-background rounded-lg animate-pulse mt-1"></div>
                          ) : (
                            <h4 className="text-sm sm:text-base md:text-lg font-black text-primary mt-0.5">
                              {mounted ? (stat.val || 0).toLocaleString() : stat.val}
                            </h4>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {user?.role === 'admin' && (
                <Link href="/admin" className="block w-full mt-6 sm:mt-8 py-2.5 sm:py-3 bg-background text-primary-muted rounded-2xl text-xs sm:text-sm font-black hover:bg-secondary-light/20 transition-colors text-center active:scale-95">
                  عرض التقارير التفصيلية
                </Link>
              )}
            </div>
          </div>

          {/* 4) Map Area: خريطة الأثر */}
          <div className="lg:col-span-8">
            <ImpactMap />
          </div>
        </section>

        {/* Row 3: Feeds (العطايا والطلبات) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pb-4">
          {/* Recent Gifts */}
          <div className="bg-white p-5 sm:p-7 md:p-8 rounded-3xl md:rounded-[40px] border border-secondary-light/30 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-black text-primary mb-4 sm:mb-6 border-b border-background pb-3 sm:pb-4 text-center">أحدث العطايا</h3>
              {feedsLoading ? (
                <div className="space-y-4 sm:space-y-6">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="h-10 rounded-xl bg-background animate-pulse"></div>
                  ))}
                </div>
              ) : giftsFeed.length > 0 ? (
                <div className="space-y-4 sm:space-y-5">
                  {giftsFeed.map((gift, i) => (
                    <Link key={i} href="/needs/giftbrowser">
                      <div className="flex justify-between items-center group cursor-pointer p-2 rounded-2xl hover:bg-background/50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-background text-secondary rounded-lg sm:rounded-xl flex items-center justify-center shadow-xs border border-secondary-light/10 shrink-0">
                            <Gift size={15} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-black text-primary group-hover:text-secondary transition-colors truncate">{gift.name}</h4>
                            <p className="text-[10px] sm:text-xs text-primary-muted font-bold mt-0.5 truncate">بواسطة {gift.by}{gift.meta ? ` • ${gift.meta}` : ''}</p>
                          </div>
                        </div>
                        <ChevronLeft size={16} className="text-secondary-light group-hover:translate-x-1 transition-all shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-primary-muted font-bold text-center py-6 sm:py-8">لا توجد عطايا مسجلة بعد.</p>
              )}
            </div>
            <Link href="/needs/giftbrowser" className="block w-full mt-6 sm:mt-8 py-3 sm:py-3.5 text-xs font-black text-primary-muted hover:text-primary bg-background rounded-2xl transition-colors text-center active:scale-95">
              استكشاف جميع العطايا
            </Link>
          </div>

          {/* Community Needs */}
          <div className="bg-white p-5 sm:p-7 md:p-8 rounded-3xl md:rounded-[40px] border border-secondary-light/30 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-black text-primary mb-4 sm:mb-6 border-b border-background pb-3 sm:pb-4 text-center">طلبات المحتاجين</h3>
              {feedsLoading ? (
                <div className="space-y-4 sm:space-y-6">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="h-10 rounded-xl bg-background animate-pulse"></div>
                  ))}
                </div>
              ) : needs.length > 0 ? (
                <div className="space-y-4 sm:space-y-5">
                  {needs.slice(0, 3).map((need) => (
                    <Link key={need.id} href="/needs/browse">
                      <div className="flex items-center justify-between group cursor-pointer p-2 rounded-2xl hover:bg-background/50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-background text-accent rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 shadow-xs border border-secondary-light/10">
                            <MapIcon size={15} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-black text-primary group-hover:text-accent transition-colors truncate">{need.gift?.name || 'طلب مساعدة'}</h4>
                            <p className="text-[10px] sm:text-xs text-primary-muted mt-0.5 font-bold truncate">{[need.city, need.neighborhood].filter(Boolean).join(' - ')}</p>
                          </div>
                        </div>
                        <ChevronLeft size={16} className="text-secondary-light group-hover:translate-x-1 transition-all shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-primary-muted font-bold text-center py-6 sm:py-8">لا توجد طلبات احتياج حالياً.</p>
              )}
            </div>
            <Link href="/needs/browse" className="block w-full mt-6 sm:mt-8 py-3 sm:py-3.5 text-xs font-black text-primary-muted hover:text-accent bg-background rounded-2xl transition-colors text-center active:scale-95">
              عرض جميع الطلبات
            </Link>
          </div>
        </section>

        {/* Visitor Guestbook Wall / سجل كلمات وانطباعات الزائرات الكريمات */}
        <section id="guestbook" className="bg-white rounded-3xl md:rounded-[40px] p-6 sm:p-8 md:p-10 border border-secondary-light/30 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-background pb-5">
            <div>
              <div className="flex items-center gap-2.5 text-primary font-black text-lg sm:text-xl md:text-2xl">
                <div className="w-10 h-10 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
                  <Heart size={22} className="fill-secondary/20" />
                </div>
                <span>سجل كلمات وانطباعات الزائرات الكريمات</span>
              </div>
              <p className="text-xs sm:text-sm text-primary-muted font-bold mt-1.5">
                سجل تشريفي لكلمات مسؤولي وضيوف المنصة وشركاء الأثر
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              {isVisitor ? (
                <button
                  type="button"
                  onClick={() => setShowWordModal(true)}
                  className="px-5 py-2.5 bg-primary text-white text-xs sm:text-sm font-black rounded-xl hover:bg-primary-dark transition-all flex items-center gap-2 shadow-sm cursor-pointer active:scale-95"
                >
                  <Plus size={16} /> أخبرينا عن رأيكِ بالمنصة
                </button>
              ) : !isAuthenticated ? (
                <Link
                  href="/auth/register"
                  className="px-5 py-2.5 bg-secondary text-white text-xs sm:text-sm font-black rounded-xl hover:bg-secondary-dark transition-all flex items-center gap-2 shadow-sm active:scale-95"
                >
                  <Heart size={16} /> سجلي كزائرة وشاركينا رأيكِ
                </Link>
              ) : null}
            </div>
          </div>

          {visitorLoading ? (
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-40 rounded-2xl bg-background animate-pulse"></div>
              ))}
            </div>
          ) : visitorMessages.length === 0 ? (
            <div className="text-center py-12 text-primary-muted space-y-3 bg-background/30 rounded-2xl sm:rounded-3xl border border-dashed border-secondary-light/40">
              <Heart size={40} className="mx-auto text-secondary/40 animate-pulse" />
              <p className="font-bold text-sm">شاركينا أول كلمة مباركة في سجل الزائرات الكريمات.</p>
              {!isAuthenticated && (
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-1.5 text-xs font-black text-secondary hover:underline"
                >
                  انضمي كزائرة وسجلي رأيكِ الآن <ChevronLeft size={14} />
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visitorMessages.slice(0, 6).map((msg) => (
                <div
                  key={msg.id}
                  className="bg-background/40 hover:bg-background/80 transition-all border border-secondary-light/30 p-5 rounded-2xl sm:rounded-3xl flex flex-col justify-between space-y-4 shadow-xs hover:shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                          {msg.user_name ? msg.user_name.charAt(0) : 'ز'}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-xs sm:text-sm text-primary truncate">
                            {msg.user_name || 'زائرة كريمة'}
                          </h4>
                          {msg.organization && (
                            <span className="inline-block text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full mt-0.5 truncate max-w-[190px]">
                              {msg.organization}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-primary/90 font-medium leading-relaxed bg-white p-3.5 rounded-xl border border-secondary-light/20">
                      &ldquo;{msg.message}&rdquo;
                    </p>
                  </div>
                  <div className="text-[10px] text-primary-muted font-bold text-left pt-2 border-t border-secondary-light/20">
                    {new Date(msg.created_at).toLocaleDateString('ar-SA', { dateStyle: 'medium' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Inspiring Initiatives Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 pb-10">
          {topContributor && (
            <div className="lg:col-span-8 bg-white p-5 sm:p-7 md:p-8 rounded-3xl md:rounded-[40px] border border-secondary-light/30 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
              <div className="space-y-4 sm:space-y-6 max-w-md w-full text-center md:text-right">
                <h3 className="text-base sm:text-lg font-black text-primary">مبادرات ملهمة</h3>
                <div className="flex items-center justify-center md:justify-start gap-3 sm:gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-background border-2 border-secondary-light/50 shadow-sm flex items-center justify-center text-secondary shrink-0">
                    <UserIcon size={26} className="sm:w-7 sm:h-7" />
                  </div>
                  <div className="text-right">
                    <h4 className="text-sm sm:text-base font-black text-primary">{topContributor.user_name}</h4>
                    <div className="bg-primary text-white text-[9px] sm:text-[10px] font-black px-3 py-1 rounded-full mt-1 inline-block">صانعة أثر</div>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-primary-muted font-bold leading-relaxed">
                  من الخاتمات المؤثرات في مجتمعنا <br />
                  قدمت {(topContributor.gifts || []).length} {(topContributor.gifts || []).length === 1 ? 'مبادرة' : 'مبادرات'}{(topContributor.total_impact || 0) > 0 ? ` • ${topContributor.total_impact} نقطة أثر` : ''}
                </p>
              </div>
              <div className="h-40 sm:h-48 md:h-full flex items-center justify-center">
                <img src="/holy-quran.png" alt="القرآن الكريم" className="h-full max-h-48 object-contain transform scale-105" />
              </div>
            </div>
          )}

          {!isAuthenticated ? (
            <div className={`${topContributor ? 'lg:col-span-4' : 'lg:col-span-12'} bg-primary rounded-3xl md:rounded-[40px] p-6 sm:p-8 flex flex-col items-center justify-center text-center text-white relative overflow-hidden group min-h-[240px] shadow-xl border border-white/10`}>
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform pointer-events-none">
                <UserPlus size={120} color="var(--color-secondary)" />
              </div>
              <h3 className="text-lg sm:text-xl font-black mb-2 sm:mb-4 relative z-10">انضمي إلينا</h3>
              <p className="text-xs sm:text-sm text-secondary-light mb-5 sm:mb-6 opacity-80 relative z-10 font-bold">أنشئي حسابكِ وابدئي صناعة الأثر اليوم</p>
              <Link href="/auth/register" className="bg-white text-primary py-3 px-6 sm:px-8 rounded-2xl text-xs sm:text-sm font-black transition-colors relative z-10 border border-white/20 active:scale-95 shadow-sm">
                إنشاء حساب جديد
              </Link>
            </div>
          ) : (
            <div className={`${topContributor ? 'lg:col-span-4' : 'lg:col-span-12'} bg-primary rounded-3xl md:rounded-[40px] p-6 sm:p-8 flex flex-col items-center justify-center text-center text-white relative overflow-hidden group min-h-[240px] shadow-xl border border-white/10`}>
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform pointer-events-none">
                <BookOpen size={120} color="var(--color-secondary)" />
              </div>
              <h3 className="text-lg sm:text-xl font-black mb-2 sm:mb-4 relative z-10">الملف الشخصي</h3>
              <p className="text-xs sm:text-sm text-secondary-light mb-5 sm:mb-6 opacity-80 relative z-10 font-bold">تابعي إنجازاتكِ وتفضيلات حسابكِ</p>
              <Link href="/profile" className="bg-white text-primary py-3 px-6 sm:px-8 rounded-2xl text-xs sm:text-sm font-black transition-colors relative z-10 border border-white/20 active:scale-95 shadow-sm">
                عرض الملف الشخصي
              </Link>
            </div>
          )}
        </div>

        {/* New Word Modal for Visitors */}
        {showWordModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl border border-secondary-light/40 animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center border-b border-background pb-3">
                <div className="flex items-center gap-2">
                  <Heart className="text-secondary" size={20} />
                  <h3 className="font-black text-base sm:text-lg text-primary">أخبرينا عن رأيكِ بالمنصة</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWordModal(false)}
                  className="w-8 h-8 rounded-full bg-background hover:bg-secondary-light/40 flex items-center justify-center text-primary-muted hover:text-primary transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {wordSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-black text-center">
                  {wordSuccess}
                </div>
              )}

              <form onSubmit={handleWordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-primary mb-1.5">
                    الجهة أو المسمى الوظيفي (اختياري)
                  </label>
                  <input
                    type="text"
                    value={newOrganization}
                    onChange={(e) => setNewOrganization(e.target.value)}
                    placeholder="مثال: وزارة التعليم، مشرفة تربوية، زائرة مهتمة"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-secondary-light/40 text-xs sm:text-sm font-bold text-primary focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-primary mb-1.5">
                    أخبرينا عن رأيكِ بالمنصة <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="اكتبي مشاعركِ الكريمة أو مقترحاتكِ أو رأيكِ بالمنصة..."
                    className="w-full px-4 py-3 rounded-xl bg-background border border-secondary-light/40 text-xs sm:text-sm font-bold text-primary focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowWordModal(false)}
                    className="px-4 py-2 text-xs font-bold text-primary-muted hover:text-primary transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={sendingWord || !newMessage.trim()}
                    className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-black hover:bg-primary-dark transition-all disabled:opacity-50 cursor-pointer shadow-md active:scale-95"
                  >
                    {sendingWord ? 'جاري التسجيل...' : 'تسجيل الكلمة'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
