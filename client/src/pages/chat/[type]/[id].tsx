'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AppShell from '@/components/ui/AppShell';
import Hero from '@/components/ui/Hero';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { getNeed, getGiftService, getMessages, sendMessage, ChatMessage } from '@/services/api';
import { ChevronRight, AlertCircle, Send, Loader2, MessageCircle, User } from 'lucide-react';

const POLL_INTERVAL_MS = 4000;

const timeAgo = (value?: string): string => {
  if (!value) return '';
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);

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

  return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
};

export default function UnifiedChat() {
  const router = useRouter();
  const { type, id } = router.query;
  const { user } = useAuth();
  const itemId = Number(id);
  const chatType = type as 'need' | 'gift';

  const [item, setItem] = useState<any | null>(null);
  const [loadingItem, setLoadingItem] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<{ id: number; name: string }[]>([]);
  const [activeParticipant, setActiveParticipant] = useState<number | null>(null);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!itemId || !chatType) return;

    const fetchItem = chatType === 'need' ? getNeed(itemId) : getGiftService(itemId);

    fetchItem
      .then(data => {
        setItem(data);
      })
      .catch(() => setItem(null))
      .finally(() => setLoadingItem(false));
  }, [itemId, chatType]);

  useEffect(() => {
    const { participant } = router.query;
    if (participant) {
      setActiveParticipant(Number(participant));
    }
  }, [router.query]);

  const isOwner = !!(user && item && item.user_id === user.id);

  const loadMessages = () => {
    if (!itemId || !user?.id || !chatType) return;
    getMessages(chatType, itemId)
      .then(data => {
        setMessages(prev =>
          prev.length === data.length &&
            prev[prev.length - 1]?.id === data[data.length - 1]?.id
            ? prev
            : data
        );
      })
      .catch(err => {
        console.error('Messages fetch error:', err);
        setError(err.message || 'تعذر تحميل المحادثة، يرجى المحاولة لاحقاً.');
      });
  };

  useEffect(() => {
    if (!itemId || !user?.id || !item || !chatType) return;
    loadMessages();
    const timer = setInterval(loadMessages, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, user?.id, item, chatType]);

  // Owner: derive the conversation list and auto-select the latest participant.
  useEffect(() => {
    if (!isOwner || messages.length === 0) return;
    const map = new Map<number, string>();
    messages.forEach(m => {
      if (!map.has(m.participant_id)) {
        map.set(
          m.participant_id,
          m.sender_name || (m.participant_id === user?.id ? 'أنتِ' : `محادثة #${m.participant_id}`)
        );
      }
    });
    const list = Array.from(map, ([id, name]) => ({ id, name }));
    setParticipants(list);
    if (list.length && !list.some(t => t.id === activeParticipant)) {
      setActiveParticipant(list[list.length - 1].id);
    }
  }, [messages, isOwner, activeParticipant, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeParticipant]);

  const visible = isOwner
    ? messages.filter(m => m.participant_id === activeParticipant)
    : messages;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (!text || sending) return;
    if (isOwner && !activeParticipant) {
      setError('اختاري المحادثة أولاً من القائمة.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      const msg = await sendMessage(
        chatType,
        itemId,
        text,
        isOwner ? activeParticipant ?? undefined : undefined
      );
      setMessages(prev => [...prev, msg]);
      setBody('');
    } catch (err: any) {
      setError(err.message || 'تعذر إرسال الرسالة، يرجى المحاولة لاحقاً.');
    } finally {
      setSending(false);
    }
  };

  const hero = (
    <Hero
      title="المحادثة"
      subtitle={
        item
          ? `${chatType === 'need' ? (item.gift?.name || 'طلب مساعدة') : (item.gift_name || 'خدمة')} • ${item.city || 'الرياض'}`
          : loadingItem ? 'جاري التحميل...' : 'الطلب غير موجود'
      }
      variant={chatType === 'need' ? 'accent' : 'secondary'}
      actions={
        <button
          onClick={() => router.back()}
          className="bg-white text-primary px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-background transition-all shadow-sm active:scale-95 border border-secondary-light/30"
        >
          <ChevronRight size={16} /> العودة
        </button>
      }
      graphic={
        <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${chatType === 'gift' ? 'bg-secondary/10 text-secondary' : 'bg-accent/10 text-accent'}`}>
          <MessageCircle size={32} />
        </div>
      }
    />
  );

  return (
    <ProtectedRoute>
      <AppShell hero={hero}>
        {!item && !loadingItem ? (
          <div className="py-12 text-center text-primary-muted font-bold">
            المورد المطلوب غير موجود.
          </div>
        ) : (
          <div
            className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] border border-secondary-light/20 shadow-[0_30px_60px_rgba(94,32,59,0.05)] overflow-hidden flex flex-col mx-auto max-w-4xl"
            style={{ height: '70vh', minHeight: '500px', maxHeight: '720px' }}
          >
            {/* Header / Participant Switcher for Owners */}
            {isOwner && participants.length > 0 ? (
              <div className="bg-background/30 px-6 py-4 border-b border-secondary-light/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                    <User size={16} />
                  </div>
                  <h3 className="text-sm font-black text-primary">المحادثات النشطة</h3>
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {participants.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setActiveParticipant(p.id)}
                      className={`shrink-0 px-5 py-2.5 rounded-2xl text-xs font-black transition-all duration-200 border-2 ${activeParticipant === p.id
                          ? 'bg-primary text-white border-primary shadow-md scale-105'
                          : 'bg-white text-primary-muted border-secondary-light/20 hover:border-primary/30 hover:text-primary'
                        }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : !isOwner ? (
               <div className="bg-background/30 px-8 py-5 border-b border-secondary-light/10 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${chatType === 'gift' ? 'bg-secondary/10 text-secondary' : 'bg-accent/10 text-accent'}`}>
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-primary">
                      {chatType === 'need' ? 'مراسلة صاحبة الطلب' : 'مراسلة مقدمة العطاء'}
                    </h3>
                    <p className="text-[10px] text-primary-muted font-bold mt-0.5">استفسري عن تفاصيل تقديم الخدمة</p>
                  </div>
               </div>
            ) : null}

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 bg-gradient-to-b from-transparent to-background/20 no-scrollbar">
              {loadingItem ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 size={32} className="animate-spin text-primary-muted/20" />
                </div>
              ) : visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                  <div className="w-16 h-16 rounded-3xl bg-secondary-light/20 flex items-center justify-center text-secondary">
                    <MessageCircle size={32} />
                  </div>
                  <p className="text-sm font-bold text-primary-muted max-w-[200px]">
                    {isOwner ? 'ابدئي بالتواصل مع المهتمات بطلبكِ.' : 'اسألي عن التفاصيل للبدء في الأثر.'}
                  </p>
                </div>
              ) : (
                visible.map((m, idx) => {
                  const own = m.sender_id === user?.id;
                  const showName = !own && m.sender_name && (idx === 0 || visible[idx-1].sender_id !== m.sender_id);

                  return (
                    <div key={m.id} className={`flex flex-col ${own ? 'items-end' : 'items-start'}`}>
                      {showName && (
                        <span className="text-[10px] font-black text-primary-muted/60 mb-1.5 mr-2 ml-2">
                          {m.sender_name}
                        </span>
                      )}
                      <div
                        className={`group relative max-w-[85%] md:max-w-[70%] px-5 py-3.5 rounded-[1.5rem] text-sm font-semibold leading-relaxed shadow-sm transition-all hover:shadow-md ${own
                            ? 'bg-primary text-white rounded-br-none'
                            : 'bg-white border border-secondary-light/30 text-primary rounded-bl-none'
                          }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        <p
                          className={`text-[9px] mt-2 font-bold flex items-center gap-1 ${own ? 'text-white/60 justify-end' : 'text-primary-muted/60'
                            }`}
                        >
                          {timeAgo(m.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-secondary-light/10">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-100 text-red-600 text-[10px] font-black p-3 rounded-2xl flex items-center gap-2 animate-in slide-in-from-top-2">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <form
                onSubmit={handleSend}
                className="relative flex items-end gap-3"
              >
                <div className="flex-1 relative group">
                  <textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
                      }
                    }}
                    rows={1}
                    placeholder="اكتبي رسالتكِ هنا..."
                    className="w-full min-h-[56px] max-h-[120px] resize-none bg-background/50 border border-secondary-light/30 rounded-[1.5rem] pr-6 pl-14 py-4 text-sm font-semibold text-primary placeholder:text-primary-muted/50 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white transition-all"
                  />
                  <div className="absolute left-3 bottom-3">
                    <button
                      type="submit"
                      disabled={sending || !body.trim()}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        body.trim()
                        ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-100 hover:scale-105 active:scale-95'
                        : 'bg-background text-primary-muted scale-90 opacity-50'
                      }`}
                      aria-label="إرسال"
                    >
                      {sending ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Send size={18} className="mr-0.5" />
                      )}
                    </button>
                  </div>
                </div>
              </form>
              <p className="mt-3 text-[9px] text-center text-primary-muted font-bold opacity-60">
                اضغطي Enter للإرسال، و Shift + Enter للسطر الجديد
              </p>
            </div>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
