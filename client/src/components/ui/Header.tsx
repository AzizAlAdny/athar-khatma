'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, MessageSquare, Search, Menu, LogIn, UserPlus, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  ApiNotification,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/services/api';
import { getEcho } from '@/services/echo';

interface HeaderProps {
  onMenuClick: () => void;
}

/** Short relative label for notification timestamps (Arabic, fuzzy). */
const timeAgo = (value?: string): string => {
  if (!value) return '';
  const mins = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
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

  return new Date(value).toLocaleDateString('ar-SA');
};

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, isAuthenticated } = useAuth();
  const userName = user?.name || 'زائرة';
  const roleLabel = user?.role === 'seeker' ? 'طالبة عون' : user?.role === 'admin' ? 'مشرفة' : 'ختماتي';

  const router = useRouter();
  const [bellOpen, setBellOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Real-time WebSocket listener for immediate notifications
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const echo = getEcho();
    if (!echo) return;

    const channelName = `App.Models.User.${user.id}`;
    const channel = echo.private(channelName);

    channel.notification((notification: any) => {
      setUnread((count) => count + 1);
      setNotifications((prev) => [
        {
          id: notification.id || String(Date.now()),
          kind: notification.kind || 'new_message',
          sender_name: notification.sender_name,
          type: notification.type,
          item_id: notification.item_id,
          item_title: notification.item_title,
          excerpt: notification.excerpt,
          read_at: null,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    });

    return () => {
      echo.leave(channelName);
    };
  }, [isAuthenticated, user?.id]);

  // Fallback poll for the unread badge
  useEffect(() => {
    if (!isAuthenticated) return;
    let mounted = true;
    const load = () =>
      getUnreadNotificationCount()
        .then((r) => {
          if (mounted) setUnread(r.unread);
        })
        .catch(() => {});
    load();
    const timer = setInterval(load, 30000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [isAuthenticated]);

  const toggleBell = async () => {
    const next = !bellOpen;
    setBellOpen(next);
    if (!next) return;
    setLoadingNotifications(true);
    try {
      setNotifications(await getNotifications());
    } catch {
      /* keep the previous list on failure */
    } finally {
      setLoadingNotifications(false);
    }
  };

  const openNotification = async (n: ApiNotification) => {
    setBellOpen(false);
    if (!n.read_at) {
      try {
        await markNotificationRead(n.id);
        setUnread(count => Math.max(0, count - 1));
      } catch { /* the badge resyncs on the next poll */ }
    }
    if (n.type && n.item_id) {
      router.push(`/chat/${n.type}/${n.item_id}`);
    } else if (n.need_id) {
      // Compatibility for older notifications
      router.push(`/chat/need/${n.need_id}`);
    }
  };

  const readAll = async () => {
    try {
      await markAllNotificationsRead();
      setUnread(0);
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() }))
      );
    } catch { /* silent: the list resyncs on next open */ }
  };

  return (
    <header className="bg-white px-3 md:px-10 py-3 md:py-4 flex justify-between items-center sticky top-0 z-[60] border-b border-secondary-light/30 w-full shadow-sm">
      {/* Right Side: Logo and Title */}
      <div className="flex items-center gap-2 md:gap-4 order-1 shrink-0">
        {/* Mobile Menu Toggle */}
        <button
          className="xl:hidden p-1.5 text-primary hover:bg-background rounded-xl ml-0.5"
          onClick={onMenuClick}
        >
          <Menu size={20} className="md:h-6 md:w-6" />
        </button>

        <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white p-0.5 md:p-1 shadow-sm overflow-hidden flex items-center justify-center">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div className="text-right">
          <h1 className="text-xs md:text-xl font-black text-primary tracking-tight">ختمة و أثر</h1>
          <p className="text-[7px] md:text-[9px] text-secondary font-bold">كل ختمة.. <span className="text-accent">تثمر أثراً</span></p>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-xl mx-4 md:mx-8 hidden lg:block order-2">
        <div className="relative group">
          <input
            type="text"
            placeholder="ابحثي عن خدمة ..."
            className="w-full bg-background border border-secondary-light/30 rounded-2xl px-12 py-2.5 text-xs text-right focus:outline-none focus:ring-2 focus:ring-secondary-light transition-all shadow-inner group-hover:bg-white"
          />
          <Search className="absolute left-4 top-3 text-primary-muted" size={14} />
        </div>
      </div>

      {/* Left Side: Profile / Auth and Notifications */}
      <div className="flex items-center gap-2 md:gap-6 order-3">
        {isAuthenticated ? (
          <Link href="/profile" className="flex items-center gap-2 md:gap-3 group cursor-pointer hover:bg-background p-1 rounded-2xl transition-colors">
            <div className="relative">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-secondary/10 border-2 border-accent flex items-center justify-center text-accent">
                <User className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 md:w-3.5 md:h-3.5 bg-accent rounded-full border-2 border-white shadow-sm"></div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-[10px] md:text-xs text-primary-muted font-bold leading-tight">مرحباً بكِ</p>
              <div className="flex items-center gap-1">
                <h3 className="text-[10px] md:text-xs font-black text-primary truncate max-w-[60px] md:max-w-none">{userName}</h3>
                <span className="text-[7px] md:text-[8px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap">{roleLabel}</span>
              </div>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-1.5 md:gap-3">
            <Link
              href="/auth/login"
              className="flex items-center gap-1 text-primary border border-secondary-light/40 px-2 md:px-5 py-1.5 md:py-2.5 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black hover:bg-background transition-colors active:scale-95"
            >
              <LogIn size={12} /> دخول
            </Link>
            <Link
              href="/auth/register"
              className="flex items-center gap-1 bg-primary text-white px-2 md:px-5 py-1.5 md:py-2.5 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black hover:bg-primary-dark transition-colors shadow-md shadow-primary/10 active:scale-95"
            >
              <UserPlus size={12} /> تسجيل
            </Link>
          </div>
        )}

        <div className="flex gap-1.5 md:gap-3 pr-1.5 md:pr-4 border-r border-secondary-light/30 items-center">
          {isAuthenticated && (
            <div className="flex items-center gap-1.5 md:gap-3">
              <Link
                href="/chat"
                aria-label="الرسائل"
                className="text-primary-muted hover:text-primary p-1.5 md:p-2 rounded-xl bg-background transition-colors"
              >
                <MessageSquare size={16} />
              </Link>

              <div className="relative">
                <button
                  type="button"
                  onClick={toggleBell}
                  aria-label="الإشعارات"
                  className="relative text-primary-muted hover:text-primary cursor-pointer p-1.5 md:p-2 rounded-xl bg-background transition-colors"
                >
                  <Bell size={16} />
                  {unread > 0 && (
                    <span className="absolute -top-1 -left-1 min-w-[16px] md:min-w-[18px] h-[16px] md:h-[18px] px-1 bg-red-500 text-white text-[8px] md:text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </button>

                {bellOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="إغلاق الإشعارات"
                      className="fixed inset-0 z-40 cursor-default bg-transparent"
                      onClick={() => setBellOpen(false)}
                    />
                    <div className="absolute left-0 top-full mt-2 w-80 max-w-[85vw] bg-white border border-secondary-light/30 rounded-2xl shadow-xl z-50 overflow-hidden text-right">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-background">
                        <h4 className="text-xs font-black text-primary">الإشعارات</h4>
                        {notifications.some(n => !n.read_at) && (
                          <button
                            type="button"
                            onClick={readAll}
                            className="flex items-center gap-1 text-[10px] font-bold text-secondary hover:text-primary transition-colors"
                          >
                            <CheckCheck size={12} /> تعليم الكل كمقروء
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto no-scrollbar">
                        {loadingNotifications ? (
                          <div className="flex items-center justify-center gap-2 py-8 text-primary-muted text-xs font-bold">
                            <Loader2 size={14} className="animate-spin" /> جاري التحميل...
                          </div>
                        ) : notifications.length === 0 ? (
                          <p className="py-8 text-center text-[11px] font-bold text-primary-muted">
                            لا توجد إشعارات بعد
                          </p>
                        ) : (
                          notifications.map(n => (
                            <button
                              key={n.id}
                              type="button"
                              onClick={() => openNotification(n)}
                              className={`w-full text-right px-4 py-3 border-b border-background last:border-0 transition-colors hover:bg-background ${n.read_at ? 'bg-white' : 'bg-secondary/5'}`}
                            >
                              <div className="flex items-center gap-2">
                                {!n.read_at && <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />}
                                <p className="text-[11px] font-black text-primary flex-1">
                                  {n.kind === 'new_participant' ? 'خاتمة جديدة مهتمة بطلبك' : 'رسالة جديدة'}
                                  {(n.item_title || n.need_title) ? ` • ${n.item_title || n.need_title}` : ''}
                                </p>
                                <span className="text-[9px] text-primary-muted shrink-0">{timeAgo(n.created_at)}</span>
                              </div>
                              <p className="text-[10px] font-bold text-primary-muted mt-1 leading-relaxed">
                                {n.sender_name ? `${n.sender_name}: ` : ''}{n.excerpt || ''}
                              </p>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="text-primary-muted hover:text-primary cursor-pointer p-2 rounded-xl bg-background hidden">
            <MessageSquare size={18} />
          </div>
          <img
            src="/gaith.jpeg"
            alt="غيث"
            className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl object-cover shadow-sm shrink-0"
          />
        </div>
      </div>
    </header>
  );
}

