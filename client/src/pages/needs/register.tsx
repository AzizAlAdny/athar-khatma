'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AppShell from '@/components/ui/AppShell';
import Button from '@/components/ui/Button';
import Hero from '@/components/ui/Hero';
import Input from '@/components/ui/Input';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getGifts, createNeed, Gift as GiftType } from '@/services/api';
import {
  HelpCircle,
  MapPin,
  Gift as GiftIcon,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  AlertCircle
} from 'lucide-react';

export default function RegisterNeed() {
  const router = useRouter();
  const [gifts, setGifts] = useState<GiftType[]>([]);
  const [selectedGiftId, setSelectedGiftId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('الرياض');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGifts()
      .then(data => setGifts(data))
      .catch(err => console.error('Failed to fetch gifts:', err));
  }, []);

  const handleSubmit = async () => {
    if (!selectedGiftId) {
      setError('الرجاء اختيار نوع الخدمة المطلوبة.');
      return;
    }

    if (!description.trim() || description.length < 10) {
      setError('الرجاء كتابة وصف واضح لا يقل عن 10 أحرف.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await createNeed({
        gift_id: selectedGiftId,
        description: description,
        city: city
      });
      router.push('/needs');
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الطلب، يرجى المحاولة لاحقاً.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const registerHero = (
    <Hero
      title="أضيفي احتياجاً مجتمعياً"
      subtitle="حددي نوع الخدمة التي يحتاجها مجتمعكِ وسنعمل معاً على توفيرها من خلال بركة القرآن."
      variant="accent"
      actions={
        <Link href="/needs">
          <Button variant="secondary" className="bg-white border border-secondary-light/30 text-primary px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-background transition-all shadow-sm active:scale-95">
            <ChevronRight size={18} /> عودة للطلبات
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
      <AppShell hero={registerHero}>
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
          {/* Section 1: Need Category */}
          <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-secondary-light/20">
            <div className="flex items-center gap-5 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-accent/5 flex items-center justify-center text-accent shadow-sm">
                <GiftIcon size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-primary">نوع الاحتياج</h2>
                <p className="text-sm text-primary-muted font-bold mt-1">اختاري الخدمة التي ترغبين في طلبها للمجتمع.</p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {gifts.map((gift) => {
                const isSelected = selectedGiftId === gift.id;
                return (
                  <button
                    key={gift.id}
                    type="button"
                    onClick={() => setSelectedGiftId(gift.id)}
                    className={`group relative flex flex-col p-6 rounded-[2rem] border-2 transition-all duration-300 text-right ${isSelected
                        ? 'border-accent bg-accent/5 shadow-[0_0_20px_rgba(21,74,50,0.05)]'
                        : 'border-background bg-background/30 hover:border-accent/20 hover:bg-background'
                      }`}
                  >
                    {isSelected && (
                      <div className="absolute top-4 left-4 text-accent animate-in zoom-in-50 duration-300">
                        <CheckCircle2 size={20} fill="currentColor" className="text-white" />
                      </div>
                    )}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5 transition-transform group-hover:scale-110 ${isSelected ? 'bg-accent text-white shadow-lg' : 'bg-white text-primary-muted shadow-sm'
                      }`}>
                      {gift.icon === 'book-open' ? '📖' : '✨'}
                    </div>
                    <h3 className={`text-lg font-black transition-colors ${isSelected ? 'text-accent' : 'text-primary'}`}>
                      {gift.name}
                    </h3>
                    <p className="mt-2 text-xs text-primary-muted font-medium leading-relaxed">
                      {gift.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 2: Details & Location */}
          <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-secondary-light/20">
            <div className="flex items-center gap-5 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shadow-sm">
                <ClipboardList size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-primary">تفاصيل الطلب</h2>
                <p className="text-sm text-primary-muted font-bold mt-1">اشرحي الاحتياج بوضوح وحددي الموقع.</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className="block text-sm font-black text-primary mr-2">وصف الاحتياج</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="مثال: نحتاج إلى متطوعة لتحفيظ مجموعة من الأطفال في حي السلام..."
                  className="w-full min-h-[150px] p-5 rounded-[1.5rem] bg-background border-none focus:ring-2 focus:ring-accent/20 transition-all text-sm font-medium resize-none"
                />
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <Input
                  as="select"
                  label="المدينة"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  icon={MapPin}
                  required
                >
                  <option value="الرياض">الرياض</option>
                  <option value="جدة">جدة</option>
                  <option value="الدمام">الدمام</option>
                  <option value="مكة المكرمة">مكة المكرمة</option>
                  <option value="المدينة المنورة">المدينة المنورة</option>
                </Input>
              </div>
            </div>
          </section>

          {/* Error and Submit */}
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-bold p-5 rounded-3xl flex items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-secondary-light/30 text-center">
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="w-full md:w-auto px-16 py-5 rounded-2xl text-lg font-black bg-accent hover:bg-[#0e3522] shadow-xl shadow-accent/10 transition-all active:scale-95 text-white"
              >
                {isSubmitting ? 'جاري الإرسال...' : 'نشر طلب الاحتياج الآن ✨'}
              </Button>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
