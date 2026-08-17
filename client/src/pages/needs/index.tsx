'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/ui/AppShell';
import Button from '@/components/ui/Button';
import Hero from '@/components/ui/Hero';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { getNeeds, deleteMyNeed, Need } from '@/services/api';
import { Plus, MapPin, HelpCircle, Trash2, AlertCircle, Loader2, MessageCircle } from 'lucide-react';

export default function MyNeeds() {
  const { user } = useAuth();
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const loadNeeds = () => {
    setLoading(true);
    getNeeds()
      .then(data => {
        // The public endpoint returns all needs; keep only the signed-in seeker's own.
        const mine = (data || []).filter(n => n.user_id === user?.id);
        setNeeds(mine);
        setLoading(false);
      })
      .catch(err => {
        console.error('My needs fetch error:', err);
        setError('تعذر تحميل طلباتكِ، يرجى المحاولة لاحقاً.');
        setLoading(false);
      });
  };

  useEffect(() => {
    if (user?.id) {
      loadNeeds();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    setError(null);
    try {
      await deleteMyNeed(id);
      setNeeds(prev => prev.filter(n => n.id !== id));
      setConfirmDeleteId(null);
    } catch (err: any) {
      setError(err.message || 'فشل حذف الطلب، يرجى المحاولة لاحقاً.');
    } finally {
      setDeletingId(null);
    }
  };

  const needsHero = (
    <Hero
      title="طلباتي"
      subtitle="تابعي طلبات الاحتياج التي سجلتها وأديريها بسهولة."
      variant="accent"
      actions={
        <Link href="/needs/register">
          <Button className="bg-accent hover:bg-[#0e3522] text-white rounded-2xl px-8 py-4 text-sm font-black flex items-center justify-center gap-2 shadow-xl shadow-accent/10 active:scale-95 transition-all w-full md:w-auto">
            <Plus size={18} /> أضيفي احتياجاً
          </Button>
        </Link>
      }
      graphic={
        <div className="w-48 h-48 rounded-full bg-accent/5 flex items-center justify-center text-accent/20">
          <HelpCircle size={120} />
        </div>
      }
    />
  );

  return (
    <ProtectedRoute allowedRoles={['seeker', 'admin']}>
      <AppShell hero={needsHero}>
        <div className="space-y-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between px-2">
            <div className="text-right">
              <h2 className="text-2xl font-black text-primary">إدارة طلباتي</h2>
              <p className="text-sm text-primary-muted font-bold">
                {needs.length > 0 ? `لديكِ ${needs.length} ${needs.length === 1 ? 'طلب مسجل' : 'طلبات مسجلة'}.` : 'قائمة الطلبات التي سجلتها باسمكِ.'}
              </p>
            </div>
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
              <p className="text-primary-muted font-bold">جاري تحميل طلباتكِ...</p>
            </div>
          ) : needs.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {needs.map((need) => (
                <div key={need.id} className="group rounded-[32px] md:rounded-[40px] border border-secondary-light/30 bg-white p-6 md:p-8 shadow-sm transition-all hover:shadow-md">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between">
                    <div className="flex items-start gap-5">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-background text-accent shadow-sm text-2xl group-hover:scale-110 transition-transform">
                        {need.gift?.icon === 'book-open' ? '📖' : <MapPin size={24} />}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-primary">{need.gift?.name || 'طلب مساعدة'}</h3>
                          {(need.messages_count ?? 0) > 0 && (
                            <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center text-accent animate-pulse">
                              <MessageCircle size={10} />
                            </div>
                          )}
                        </div>
                        <p className="text-primary-muted text-sm font-medium mt-1 leading-relaxed line-clamp-2">{need.description}</p>
                        <div className="flex items-center gap-2 text-xs text-primary-muted font-bold mt-3">
                          <MapPin size={12} className="text-secondary" />
                          <span>{need.city || 'الرياض'}</span>
                          {need.neighborhood && (
                            <>
                              <span className="mx-1 opacity-50">•</span>
                              <span>{need.neighborhood}</span>
                            </>
                          )}
                          <span className="mx-1 opacity-50">•</span>
                          <span>منذ {need.created_at_human || 'قليل'}</span>
                        </div>
                      </div>
                    </div>
                                        <div className="flex items-center gap-3">
                      <Link href={`/chat/need/${need.id}`} className="flex-none">
                        <Button className="bg-secondary/5 hover:bg-secondary/10 text-primary rounded-2xl px-4 py-3 text-xs font-black transition-all active:scale-95 flex items-center justify-center gap-1.5">
                          <MessageCircle size={14} /> المحادثات
                        </Button>
                      </Link>

                      {confirmDeleteId === need.id ? (
                        <div className="flex items-center gap-2">
                          <Button
                            className="bg-red-600 hover:bg-red-700 text-white rounded-2xl px-5 py-3 text-xs font-black transition-all active:scale-95"
                            onClick={() => handleDelete(need.id)}
                            disabled={deletingId === need.id}
                          >
                            {deletingId === need.id ? (
                              <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> جاري الحذف...</span>
                            ) : 'تأكيد الحذف'}
                          </Button>
                          <Button
                            className="bg-background text-primary-muted rounded-2xl px-5 py-3 text-xs font-black hover:text-primary transition-all active:scale-95"
                            onClick={() => setConfirmDeleteId(null)}
                            disabled={deletingId === need.id}
                          >
                            إلغاء
                          </Button>
                        </div>
                      ) : (
                        <Button
                          className="flex-1 md:flex-none bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl px-6 py-3.5 text-xs font-black shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                          onClick={() => setConfirmDeleteId(need.id)}
                        >
                          <Trash2 size={14} /> حذف
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="col-span-full rounded-[40px] border border-dashed border-secondary-light bg-white p-16 text-center shadow-sm">
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus size={24} className="text-secondary-muted" />
              </div>
              <p className="text-primary-muted font-bold text-lg">لم تسجلي أي طلب بعد..</p>
              <p className="text-secondary-muted text-sm mt-1 mb-8">سجلي احتياجكِ الأول وسيصلكِ الدعم من صانعات الأثر.</p>
              <Link href="/needs/register">
                <Button className="bg-accent hover:bg-[#0e3522] text-white rounded-2xl px-10 py-4 text-sm font-black shadow-xl shadow-accent/10 active:scale-95 transition-all">
                  <span className="flex items-center justify-center gap-2"><Plus size={16} /> أضيفي احتياجاً</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
