import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AppShell from '@/components/ui/AppShell';
import Button from '@/components/ui/Button';
import Hero from '@/components/ui/Hero';
import Input from '@/components/ui/Input';
import { getGifts, recordKhatma, Gift as GiftType } from '@/services/api';
import { Calendar, Layers, Gift as GiftIcon, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';

export default function RegisterKhatma() {
  const router = useRouter();
  const [gifts, setGifts] = useState<GiftType[]>([]);
  const [selectedGiftIds, setSelectedGiftIds] = useState<number[]>([]);
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);
  const [khatmaType, setKhatmaType] = useState('فردية');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGifts()
      .then(data => setGifts(data))
      .catch(err => console.error('Failed to fetch gifts:', err));
  }, []);

  const toggleGift = (id: number) => {
    setSelectedGiftIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (selectedGiftIds.length === 0) {
      setError('الرجاء اختيار هدية واحدة على الأقل لنشر الأثر.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await recordKhatma({
        completion_date: completionDate,
        type: khatmaType,
        gift_ids: selectedGiftIds
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الختمة، يرجى المحاولة لاحقاً.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const registerHero = (
    <Hero
      title="سجلي ختمتك.. واصنعي أثرك"
      subtitle="اختر تفاصيل ختمتك وأطلق مبادرةً جديدةً لتترك أثراً في مجتمعك اليوم."
      variant="secondary"
      actions={
        <Link href="/dashboard">
          <Button variant="secondary" className="bg-white border border-secondary-light/30 text-primary px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-background transition-all shadow-sm active:scale-95">
            <ChevronRight size={18} /> عودة للرئيسية
          </Button>
        </Link>
      }
      graphic={
        <div className="w-48 h-48 rounded-full bg-secondary/5 flex items-center justify-center text-secondary/20">
          <BookOpen size={120} />
        </div>
      }
    />
  );

  return (
    <AppShell hero={registerHero}>
      <div className="max-w-4xl mx-auto space-y-10 pb-20">
        {/* Section 1: Khatma Details */}
        <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-secondary-light/20">
          <div className="flex items-center gap-5 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shadow-sm">
              <Calendar size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-primary">تفاصيل الختمة</h2>
              <p className="text-sm text-primary-muted font-bold mt-1">حددي تاريخ الإكمال ونوع الختمة بدقة.</p>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Input
              label="تاريخ الإكمال"
              type="date"
              value={completionDate}
              onChange={e => setCompletionDate(e.target.value)}
              icon={Calendar}
              required
            />
            <Input
              as="select"
              label="نوع الختمة"
              value={khatmaType}
              onChange={e => setKhatmaType(e.target.value)}
              icon={Layers}
              required
            >
              <option value="فردية">فردية</option>
              <option value="جماعية">جماعية</option>
            </Input>
          </div>
        </section>

        {/* Section 2: Gift Selection */}
        <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-secondary-light/20">
          <div className="flex items-center gap-5 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-accent/5 flex items-center justify-center text-accent shadow-sm">
              <GiftIcon size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-primary">اختر هديتك للمجتمع</h2>
              <p className="text-sm text-primary-muted font-bold mt-1">شارك بعطاء يخدم المحتاجين ويجعل ختك أسمى.</p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {gifts.map((gift) => {
              const isSelected = selectedGiftIds.includes(gift.id);
              return (
                <button
                  key={gift.id}
                  type="button"
                  onClick={() => toggleGift(gift.id)}
                  className={`group relative flex flex-col p-6 rounded-[2rem] border-2 transition-all duration-300 text-right ${isSelected
                    ? 'border-secondary bg-secondary/5 shadow-[0_0_20px_rgba(208,164,95,0.1)]'
                    : 'border-background bg-background/30 hover:border-secondary-light hover:bg-background'
                    }`}
                >
                  {isSelected && (
                    <div className="absolute top-4 left-4 text-secondary animate-in zoom-in-50 duration-300">
                      <CheckCircle2 size={20} fill="currentColor" className="text-white" />
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5 transition-transform group-hover:scale-110 ${isSelected ? 'bg-secondary text-white shadow-lg' : 'bg-white text-primary-muted shadow-sm'
                    }`}>
                    🎁
                  </div>
                  <h3 className={`text-lg font-black transition-colors ${isSelected ? 'text-secondary' : 'text-primary'}`}>
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

        {/* Error and Submit */}
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-bold p-5 rounded-3xl text-center animate-in fade-in slide-in-from-bottom-2">
              {error}
            </div>
          )}

          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-secondary-light/30 text-center">
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="w-full md:w-auto px-16 py-5 rounded-2xl text-lg font-black bg-primary hover:bg-[#4a1a2f] shadow-xl shadow-primary/10 transition-all active:scale-95"
            >
              {isSubmitting ? 'جاري الحفظ...' : 'تسجيل الختمة وإطلاق الأثر ✨'}
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
