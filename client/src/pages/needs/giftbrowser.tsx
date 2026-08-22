'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/ui/AppShell';
import Hero from '@/components/ui/Hero';
import Button from '@/components/ui/Button';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getRecentGifts, KhatmaGift, orderGift, markGiftDelivered } from '@/services/api';
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
  Sparkles,
  Clock,
  CheckCircle2,
  HandHeart,
  Loader2,
  Star
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

const timeAgo = (iso?: string) => {
  if (!iso) return 'منذ قليل';
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  return new Date(iso).toLocaleDateString('ar-SA');
};

const isNew = (iso?: string) => {
  if (!iso) return false;
  const hours = (Date.now() - new Date(iso).getTime()) / 3600000;
  return hours < 24;
};

export default function GiftBrowser() {
  const [gifts, setGifts] = useState<KhatmaGift[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderingId, setOrderingId] = useState<number | null>(null);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadGifts = () => {
    setLoading(true);
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
  };

  useEffect(() => {
    loadGifts();
  }, []);

  const handleOrder = async (id: number) => {
    setOrderingId(id);
    setError(null);
    try {
      await orderGift(id);
      loadGifts();
    } catch (err: any) {
      alert(err.message || 'تعذر طلب العطاء حالياً');
    } finally {
      setOrderingId(null);
    }
  };

  const handleComplete = async (id: number) => {
    if (!confirm('هل تأكدين استلام هذا العطاء واكتماله بنجاح؟')) return;
    setCompletingId(id);
    setError(null);
    try {
      await markGiftDelivered(id, user?.id);
      loadGifts();
    } catch (err: any) {
      alert(err.message || 'تعذر تأكيد استلام العطاء');
    } finally {
      setCompletingId(null);
    }
  };

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

  // Available gifts are strictly pending and not claimed
  const availableGifts = gifts.filter(g => g.status === 'pending' && g.delivered_to_id !== user?.id);

  // My Ordered Gifts (either in_progress or delivered to the current user)
  const myOrderedGifts = gifts.filter(g => g.delivered_to_id === user?.id);
  const myInProgress = myOrderedGifts.filter(g => g.status === 'in_progress');
  const myCompleted = myOrderedGifts.filter(g => g.status === 'delivered');

  return (
    <ProtectedRoute allowedRoles={['seeker', 'admin']}>
      <AppShell hero={hero}>
        <div className="space-y-8 sm:space-y-12 pb-20">
          <div className="px-2">
            <h2 className="text-xl sm:text-2xl font-black text-primary">استكشاف العطايا</h2>
            <p className="text-xs sm:text-sm text-primary-muted font-bold mt-0.5">اختاري الخدمة التي تحتاجينها واطلبيها مباشرة للبدء في التنسيق.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs sm:text-sm font-bold p-4 sm:p-5 rounded-2xl md:rounded-3xl flex items-center gap-3">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          {loading && gifts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 space-y-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
              <p className="text-primary-muted font-bold text-xs sm:text-sm">جاري تحميل العطايا...</p>
            </div>
          ) : (
            <div className="space-y-12 sm:space-y-16">
              {/* 1. Available Gifts Section (Pending Only - Order button only, hide chat & call) */}
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2.5 sm:gap-3 px-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-primary">العطايا المتاحة</h3>
                    <p className="text-[11px] sm:text-xs text-primary-muted font-medium">عطايا بانتظار من يستفيد منها، اضغطي "طلب العطاء" للبدء.</p>
                  </div>
                </div>

                {availableGifts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {availableGifts.map(gift => (
                      <div key={gift.id} className="group rounded-2xl md:rounded-[2.5rem] border border-secondary-light/30 bg-white p-4 sm:p-6 shadow-sm transition-all hover:shadow-md hover:border-accent/30 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-4 sm:mb-6">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-accent/5 flex items-center justify-center text-accent shadow-sm group-hover:scale-105 transition-transform relative shrink-0">
                              {renderGiftIcon(gift.gift_icon || 'gift')}
                              {isNew(gift.created_at) && (
                                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-accent"></span>
                                </span>
                              )}
                            </div>
                            <div className="text-left">
                              <span className="text-[9px] sm:text-[10px] font-black bg-background px-2.5 sm:px-3 py-1 rounded-full text-primary-muted border border-secondary-light/10 whitespace-nowrap">
                                {timeAgo(gift.created_at)}
                              </span>
                            </div>
                          </div>

                          <div className="text-right mb-5 sm:mb-6">
                            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                              <h3 className="text-base sm:text-lg font-black text-primary leading-tight truncate">{gift.gift_name}</h3>
                            </div>
                            <div className="flex flex-col gap-1 sm:gap-1.5">
                              <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-primary-muted">
                                <UserRound size={12} className="text-secondary shrink-0" />
                                <span className="truncate">بواسطة: {gift.user_name}</span>
                              </div>
                              <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-primary-muted">
                                <MapPin size={12} className="text-secondary shrink-0" />
                                <span className="truncate">{gift.city || 'المملكة'}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Order button for pending gifts */}
                        <div className="pt-2">
                          <Button
                            onClick={() => handleOrder(gift.id)}
                            disabled={orderingId === gift.id}
                            className="w-full bg-accent hover:bg-accent-dark text-white rounded-xl sm:rounded-2xl py-3 text-xs font-black shadow-lg shadow-accent/10 transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            {orderingId === gift.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <>
                                <HandHeart size={16} /> طلب العطاء
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 sm:py-10 px-4 text-center bg-background/30 rounded-2xl md:rounded-[2.5rem] border border-dashed border-secondary-light/30">
                    <p className="text-primary-muted font-bold text-xs sm:text-sm">لا توجد عطايا متاحة حالياً.</p>
                  </div>
                )}
              </div>

              {/* 2. My Ordered Gifts Section (In Progress / Completed) */}
              {(myInProgress.length > 0 || myCompleted.length > 0) && (
                <div className="space-y-8 border-t border-background pt-10 sm:pt-14">
                  <div className="flex items-center gap-2.5 sm:gap-3 px-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                      <Gift size={18} />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-primary">عطاياي المطلوبة (My Ordered Gifts)</h3>
                      <p className="text-[11px] sm:text-xs text-primary-muted font-medium">العطايا التي قمتِ بطلبها لمتابعة التنسيق وتأكيد الاستلام.</p>
                    </div>
                  </div>

                  {/* Active In-Progress Orders */}
                  {myInProgress.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-xs font-black text-secondary px-2">
                        <Clock size={14} />
                        <span>قيد التنسيق والتنفيذ ({myInProgress.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {myInProgress.map(gift => (
                          <div key={gift.id} className="group rounded-2xl md:rounded-[2.5rem] border border-secondary/30 bg-white p-4 sm:p-6 shadow-sm transition-all hover:shadow-md flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between mb-4 sm:mb-6">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shadow-sm shrink-0">
                                  {renderGiftIcon(gift.gift_icon || 'gift')}
                                </div>
                                <span className="bg-secondary/10 text-secondary text-[10px] font-black px-2.5 py-1 rounded-full border border-secondary/20 flex items-center gap-1">
                                  <Clock size={10} /> قيد التنفيذ
                                </span>
                              </div>

                              <div className="text-right mb-5 sm:mb-6">
                                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                                  <h3 className="text-base sm:text-lg font-black text-primary leading-tight truncate">{gift.gift_name}</h3>
                                  {(gift.messages_count ?? 0) > 0 && (
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-secondary/10 flex items-center justify-center text-secondary animate-pulse shrink-0">
                                      <MessageCircle size={10} />
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col gap-1 sm:gap-1.5">
                                  <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-primary-muted">
                                    <UserRound size={12} className="text-secondary shrink-0" />
                                    <span className="truncate">الخاتمة: {gift.user_name}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-primary-muted">
                                    <MapPin size={12} className="text-secondary shrink-0" />
                                    <span className="truncate">{gift.city || 'المملكة'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Chat, Call, and Complete buttons for in-progress gifts */}
                            <div className="space-y-2 pt-2 border-t border-secondary-light/10">
                              <div className="grid grid-cols-2 gap-2">
                                <Link
                                  href={`/chat/gift/${gift.id}`}
                                  className="bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 rounded-xl py-2.5 text-[11px] font-black transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                >
                                  <MessageCircle size={13} /> محادثة
                                </Link>
                                <Link
                                  href={`/chat/gift/${gift.id}`}
                                  className="bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/20 rounded-xl py-2.5 text-[11px] font-black transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                >
                                  <Phone size={13} /> مكالمة
                                </Link>
                              </div>
                              <Button
                                onClick={() => handleComplete(gift.id)}
                                disabled={completingId === gift.id}
                                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-2.5 text-xs font-black shadow-md shadow-green-600/10 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                              >
                                {completingId === gift.id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle2 size={14} /> تأكيد الاستلام واكتمال العطاء
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Completed Orders */}
                  {myCompleted.length > 0 && (
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center gap-2 text-xs font-black text-green-600 px-2">
                        <CheckCircle2 size={14} />
                        <span>عطايا استلمتها بنجاح ({myCompleted.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {myCompleted.map(gift => (
                          <div key={gift.id} className="group rounded-2xl md:rounded-[2.5rem] border border-green-100 bg-white p-4 sm:p-6 shadow-sm flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between mb-4 sm:mb-6">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-green-50 flex items-center justify-center text-green-600 shadow-sm shrink-0">
                                  {renderGiftIcon(gift.gift_icon || 'gift')}
                                </div>
                                <span className="bg-green-50 text-green-600 text-[10px] font-black px-2.5 py-1 rounded-full border border-green-200 flex items-center gap-1">
                                  <CheckCircle2 size={10} /> مكتمل
                                </span>
                              </div>

                              <div className="text-right mb-5 sm:mb-6">
                                <h3 className="text-base sm:text-lg font-black text-primary leading-tight truncate mb-1.5">{gift.gift_name}</h3>
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary-muted">
                                  <UserRound size={12} className="text-secondary shrink-0" />
                                  <span className="truncate">الخاتمة: {gift.user_name}</span>
                                </div>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-secondary-light/10 flex items-center gap-2">
                              <Link
                                href={`/chat/gift/${gift.id}`}
                                className="flex-1 bg-background hover:bg-secondary-light/20 text-primary rounded-xl py-2.5 text-[11px] font-black transition-all flex items-center justify-center gap-1.5"
                              >
                                <MessageCircle size={13} /> سجل المحادثة
                              </Link>
                              <Link
                                href={`/chat/gift/${gift.id}`}
                                className="bg-yellow-400 hover:bg-yellow-500 text-primary-dark rounded-xl px-3 py-2.5 text-[11px] font-black transition-all flex items-center justify-center gap-1 shadow-xs"
                              >
                                <Star size={12} /> تقييم
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
