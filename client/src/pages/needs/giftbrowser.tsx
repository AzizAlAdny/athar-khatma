'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/ui/AppShell';
import Hero from '@/components/ui/Hero';
import Button from '@/components/ui/Button';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getRecentGifts, RecentGift } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  MapPin,
  Gift,
  MessageCircle,
  Phone,
  AlertCircle,
  UserRound,
  Baby,
  Users,
  Video,
  PenTool,
  Edit3,
  BookOpen,
  Sparkles
} from 'lucide-react';

const renderGiftIcon = (iconName: string) => {
  switch (iconName) {
    case 'user-round': return <UserRound size={24} />;
    case 'baby': return <Baby size={24} />;
    case 'users': return <Users size={24} />;
    case 'video': return <Video size={24} />;
    case 'pen-tool': return <PenTool size={24} />;
    case 'edit-3': return <Edit3 size={24} />;
    case 'book-open': return <BookOpen size={24} />;
    default: return <Gift size={24} />;
  }
};

// Simplified Arabic relative time
const timeAgo = (iso?: string) => {
  if (!iso) return 'منذ قليل';
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  return new Date(iso).toLocaleDateString('ar-SA');
};

export default function GiftBrowser() {
  const [gifts, setGifts] = useState<RecentGift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    getRecentGifts()
      .then(data => {
        setGifts(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Gifts fetch error:', err);
        setError('تعذر تحميل قائمة العطايا، يرجى المحاولة لاحقاً.');
        setLoading(false);
      });
  }, []);

  const hero = (
    <Hero
      title="استكشفي عطايا المجتمع"
      subtitle="تصفحي الخدمات والمبادرات التي يقدمها مجتمع الختمات وشاركي في صناعة الأثر."
      variant="accent"
      graphic={
        <div className="w-48 h-48 rounded-full bg-accent/5 flex items-center justify-center text-accent/20">
          <Sparkles size={120} />
        </div>
      }
    />
  );

  return (
    <ProtectedRoute allowedRoles={['seeker', 'admin']}>
      <AppShell hero={hero}>
        <div className="space-y-8 pb-20">
          <div className="px-2">
            <h2 className="text-2xl font-black text-primary">قائمة العطايا المتاحة</h2>
            <p className="text-sm text-primary-muted font-bold mt-1">اختاري الخدمة التي تحتاجينها وتواصلي مع الخاتمة مباشرة.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-bold p-5 rounded-3xl flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
              <p className="text-primary-muted font-bold">جاري تحميل العطايا...</p>
            </div>
          ) : gifts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gifts.map((gift) => (
                <div key={gift.id} className="group rounded-[2.5rem] border border-secondary-light/30 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-accent/30">
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-accent/5 flex items-center justify-center text-accent shadow-sm group-hover:scale-110 transition-transform">
                        {/* Note: backend now provides gift_icon slug */}
                        {renderGiftIcon(gift.gift_icon || 'gift')}
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] font-black bg-background px-3 py-1 rounded-full text-primary-muted border border-secondary-light/10">
                          {timeAgo(gift.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 text-right mb-6">
                      <h3 className="text-lg font-black text-primary mb-2 leading-tight">{gift.gift_name}</h3>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-primary-muted">
                           <UserRound size={12} className="text-secondary" />
                           <span>بواسطة: {gift.user_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-primary-muted">
                           <MapPin size={12} className="text-secondary" />
                           <span>{gift.city || 'المملكة'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href={`/chat/gift/${gift.id}`}
                        className="bg-accent hover:bg-[#0e3522] text-white rounded-2xl py-3 text-xs font-black shadow-lg shadow-accent/10 transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <MessageCircle size={14} /> محادثة
                      </Link>
                      <button
                        onClick={() => alert('ميزة المكالمة الصوتية ستتوفر قريباً ✨')}
                        className="bg-white border border-secondary-light/40 text-primary hover:bg-background rounded-2xl py-3 text-xs font-black transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Phone size={14} className="text-secondary" /> مكالمة صوتية
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="col-span-full rounded-[40px] border-2 border-dashed border-secondary-light bg-white/50 p-20 text-center shadow-sm">
              <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6">
                <Gift size={32} className="text-secondary-light" />
              </div>
              <p className="text-primary-muted font-bold text-lg">لا توجد عطايا متاحة حالياً.</p>
              <p className="text-secondary-muted text-sm mt-1">سجل أولاً احتياجك ليتم توجيهك للخاتمة المناسبة.</p>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
