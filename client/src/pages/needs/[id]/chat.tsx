'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AppShell from '@/components/ui/AppShell';
import Hero from '@/components/ui/Hero';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { getNeeds, getMessages, sendMessage, Need, ChatMessage } from '@/services/api';
import { ChevronRight, AlertCircle, Send, Loader2, MessageCircle } from 'lucide-react';

const POLL_INTERVAL_MS = 4000;

const timeLabel = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
};

export default function NeedChat() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const needId = Number(id);

  const [need, setNeed] = useState<Need | null>(null);
  const [needsReady, setNeedsReady] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<{ id: number; name: string }[]>([]);
  const [activeParticipant, setActiveParticipant] = useState<number | null>(null);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!needId) return;
    getNeeds()
      .then(all => {
        const found = (all || []).find(n => Number(n.id) === needId) || null;
        setNeed(found);
      })
      .catch(() => setNeed(null))
      .finally(() => setNeedsReady(true));
  }, [needId]);

  const isOwner = !!(user && need && need.user_id === user.id);

  const loadMessages = () => {
    if (!needId || !user?.id) return;
    getMessages(needId)
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
    if (!needId || !user?.id || !need) return;
    loadMessages();
    const timer = setInterval(loadMessages, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needId, user?.id, need]);

  // Owner: derive the conversation list and auto-select the latest participant.
  useEffect(() => {
    if (!isOwner || messages.length === 0) return;
    const map = new Map<number, string>();
    messages.forEach(m => {
      if (!map.has(m.participant_id)) {
        map.set(
          m.participant_id,
          m.sender_name || (m.participant_id === user?.id ? 'أنت' : `محادثة #${m.participant_id}`)
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
  }, [messages]);

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
        needId,
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
        need
          ? `${need.gift?.name || 'طلب مساعدة'} • ${need.city || 'الرياض'}`
          : 'جاري التحميل...'
      }
      variant={isOwner ? 'secondary' : 'accent'}
      actions={
        <Link href={isOwner ? '/needs' : '/needs/browse'}>
          <button className="bg-white text-primary px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-background transition-all shadow-sm active:scale-95">
            <ChevronRight size={16} /> عودة
          </button>
        </Link>
      }
      graphic={
        <div className="w-14 h-14 rounded-2xl bg-accent/5 flex items-center justify-center text-accent/20">
          <MessageCircle size={24} />
        </div>
      }
    />
  );

  return (
    <ProtectedRoute>
      <AppShell hero={hero}>
        {!need ? (
          <div className="py-12 text-center text-primary-muted font-bold">
            {needsReady ? 'الطلب غير موجود.' : 'جاري تحميل المحادثة...'}
          </div>
        ) : (
          <div
            className="bg-white rounded-[2rem] md:rounded-[3rem] border border-secondary-light/20 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col"
            style={{ height: '60vh', maxHeight: '640px' }}
          >
            {isOwner && participants.length > 1 ? (
              <div className="flex gap-2 px-4 py-3 border-b border-background overflow-x-auto no-scrollbar">
                {participants.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setActiveParticipant(p.id)}
                    className={`shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all ${activeParticipant === p.id
                        ? 'bg-primary text-white'
                        : 'bg-background text-primary-muted hover:text-primary hover:bg-secondary-light/20'
                      }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-background/40 no-scrollbar">
              {visible.length === 0 ? (
                <p className="text-center text-xs text-primary-muted font-bold pt-12">
                  {isOwner ? 'أرسلي رسالتكِ لبدء المحادثة.' : 'اسألي صاحب الطلب وقت توفّقه.'}
                </p>
              ) : (
                visible.map(m => {
                  const own = m.sender_id === user?.id;
                  return (
                    <div key={m.id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm font-bold leading-relaxed shadow-sm ${own
                            ? 'bg-primary text-white rounded-br-md'
                            : 'bg-white border border-secondary-light/20 text-primary rounded-bl-md'
                          }`}
                      >
                        {!own && m.sender_name ? (
                          <p className="text-[10px] text-primary-muted/70 mb-1">{m.sender_name}</p>
                        ) : null}
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        <p
                          className={`text-[10px] mt-1 ${own ? 'text-white/50' : 'text-primary-muted/50'
                            }`}
                        >
                          {timeLabel(m.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={handleSend}
              className="border-t border-background p-4 flex items-end gap-3 bg-white"
            >
              {error ? (
                <div className="flex-1 bg-red-50 border border-red-100 text-red-600 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle size={14} />
                  {error}
                </div>
              ) : null}
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
                  }
                }}
                rows={2}
                placeholder="... اكتبي رسالتك"
                className="flex-1 w-full min-w-0 resize-none bg-background rounded-2xl px-4 py-3 text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <button
                type="submit"
                disabled={sending || !body.trim()}
                className="shrink-0 bg-accent hover:bg-[#0e3522] text-white rounded-2xl px-4 py-3 flex items-center justify-center shadow-lg shadow-accent/10 active:scale-95 transition-all disabled:opacity-60"
                aria-label="إرسال"
              >
                {sending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </form>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
