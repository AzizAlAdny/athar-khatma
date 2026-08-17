'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/ui/AppShell';
import Hero from '@/components/ui/Hero';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getChatThreads } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  MessageCircle,
  User,
  ChevronLeft,
  Clock,
  HelpCircle,
  Sparkles,
  Loader2
} from 'lucide-react';

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

  const days = Math.floor(hours / 24);
  if (days === 1) return 'منذ يوم';
  if (days === 2) return 'منذ يومين';
  if (days < 11) return `منذ ${days} أيام`;

  return date.toLocaleDateString('ar-SA');
};

export default function ChatInbox() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'need' | 'gift'>('all');

  useEffect(() => {
    getChatThreads()
      .then(data => {
        setThreads(data || []);
      })
      .catch(err => console.error('Threads fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredThreads = threads.filter(t => activeTab === 'all' || t.type === activeTab);

  const hero = (
    <Hero
      title="بريد المحادثات"
      subtitle="تابعي جميع مراسلاتكِ المتعلقة بالطلبات والعطايا في مكان واحد."
      variant="primary"
      graphic={
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary/30">
          <MessageCircle size={32} />
        </div>
      }
    />
  );

  return (
    <ProtectedRoute>
      <AppShell hero={hero}>
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
          {/* Tabs */}
          <div className="flex bg-white p-2 rounded-[2rem] border border-secondary-light/20 shadow-sm overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-6 py-3 rounded-[1.5rem] text-sm font-black transition-all ${activeTab === 'all' ? 'bg-primary text-white shadow-md' : 'text-primary-muted hover:bg-background'
                }`}
            >
              الكل
            </button>
            <button
              onClick={() => setActiveTab('need')}
              className={`flex-1 px-6 py-3 rounded-[1.5rem] text-sm font-black transition-all ${activeTab === 'need' ? 'bg-accent text-white shadow-md' : 'text-primary-muted hover:bg-background'
                }`}
            >
              الطلبات
            </button>
            <button
              onClick={() => setActiveTab('gift')}
              className={`flex-1 px-6 py-3 rounded-[1.5rem] text-sm font-black transition-all ${activeTab === 'gift' ? 'bg-secondary text-white shadow-md' : 'text-primary-muted hover:bg-background'
                }`}
            >
              العطايا
            </button>
          </div>

          {/* Threads List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 size={40} className="animate-spin text-primary/20" />
              <p className="text-primary-muted font-bold">جاري تحميل المحادثات...</p>
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="bg-white rounded-[3rem] p-16 text-center border-2 border-dashed border-secondary-light/30">
              <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6 text-secondary-light">
                <MessageCircle size={40} />
              </div>
              <p className="text-primary-muted font-bold text-lg">لا توجد محادثات نشطة حالياً</p>
              <p className="text-secondary-muted text-sm mt-1">ابدئي التواصل من خلال تصفح الطلبات أو العطايا.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredThreads.map((thread, idx) => (
                <Link
                  key={idx}
                  href={`/chat/${thread.type}/${thread.item_id}${thread.participant_id !== user?.id ? `?participant=${thread.participant_id}` : ''}`}
                >
                  <div className="group bg-white rounded-[2.5rem] p-5 md:p-6 border border-secondary-light/20 shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex items-center justify-between gap-4">
                    <div className="flex items-center gap-5 flex-1 min-w-0">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${thread.type === 'gift' ? 'bg-secondary/10 text-secondary' : 'bg-accent/10 text-accent'
                        }`}>
                        {thread.type === 'gift' ? <Sparkles size={24} /> : <HelpCircle size={24} />}
                      </div>

                      <div className="text-right flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-black text-primary truncate">{thread.item_title}</h3>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${thread.type === 'gift' ? 'bg-secondary/10 text-secondary' : 'bg-accent/10 text-accent'
                            }`}>
                            {thread.type === 'gift' ? 'عطاء' : 'طلب'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-primary-muted font-bold mb-2">
                          <User size={12} className="text-secondary" />
                          <span>{thread.other_name}</span>
                        </div>

                        <p className="text-xs text-primary-muted/70 truncate leading-relaxed">
                          {thread.last_message}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary-muted opacity-60">
                        <Clock size={12} />
                        <span>{timeAgo(thread.updated_at)}</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-primary-muted group-hover:bg-primary group-hover:text-white transition-all">
                        <ChevronLeft size={18} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
