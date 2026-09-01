import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AppShell from '@/components/ui/AppShell';
import Button from '@/components/ui/Button';
import Hero from '@/components/ui/Hero';
import Input from '@/components/ui/Input';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getGifts, recordKhatma, Gift as GiftType } from '@/services/api';
import {
  Calendar,
  Gift as GiftIcon,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  Users,
  Baby,
  Video,
  PenTool,
  Edit3,
  UserRound,
  Gift
} from 'lucide-react';

const renderGiftIcon = (iconName: string) => {
  switch (iconName) {
    case 'user-round': return <UserRound size={20} />;
    case 'baby': return <Baby size={20} />;
    case 'users': return <Users size={20} />;
    case 'video': return <Video size={20} />;
    case 'pen-tool': return <PenTool size={20} />;
    case 'edit-3': return <Edit3 size={20} />;
    case 'book-open': return <BookOpen size={20} />;
    default: return <Gift size={20} />;
  }
};

export default function RegisterKhatma() {
  const router = useRouter();
  const [gifts, setGifts] = useState<GiftType[]>([]);
  const [selectedGiftIds, setSelectedGiftIds] = useState<number[]>([]);
    const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);
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
    <ProtectedRoute allowedRoles={['khatma']}>
      <AppShell hero={registerHero}>
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
          {/* Section 1: Khatma Details */}
          <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-secondary-light/20">
            <div className="flex items-center gap-5 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shadow-sm">
                <Calendar size={28} />
              </div>
              <div>
                <h2 className="text-xl font-black text-primary">تاريخ إتمام الختمة</h2>
                <p className="text-xs text-primary-muted font-medium mt-1">حددي اليوم الذي أكرمكِ الله فيه بختم كتابه</p>
              </div>
            </div>

            <div className="max-w-md">
              <Input
                label="تاريخ الختمة"
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                icon={Calendar}
                required
              />
            </div>
          </section>

          {/* Section 2: Choose Your Gift */}
          <section className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-secondary-light/20">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shadow-sm">
                <GiftIcon size={28} />
              </div>
              <div>
                <h2 className="text-xl font-black text-primary">حددي هديتكِ للمجتمع</h2>
                <p className="text-xs text-primary-muted font-medium mt-1">اختاري مبادرة أو أكثر لتحويل ختمتكِ إلى أثر مبارك في حياة الآخرين</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gifts.map((gift) => {
                const isSelected = selectedGiftIds.includes(gift.id);
                return (
                  <button
                    key={gift.id}
                    type="button"
                    onClick={() => toggleGift(gift.id)}
                    className={`relative text-right p-6 rounded-[2rem] border-2 transition-all flex flex-col items-start gap-4 group cursor-pointer active:scale-98 ${isSelected
                      ? 'border-secondary bg-secondary/5 shadow-md shadow-secondary/10'
                      : 'border-secondary-light/20 hover:border-secondary/40 hover:bg-background/50'
                      }`}
                  >
                    {isSelected && (
                      <div className="absolute top-4 left-4 text-secondary animate-in zoom-in-50 duration-300">
                        <CheckCircle2 size={20} fill="currentColor" className="text-white" />
                      </div>
                    )}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${isSelected ? 'bg-secondary text-white shadow-lg' : 'bg-white text-primary-muted shadow-sm'
                      }`}>
                      {renderGiftIcon(gift.icon)}
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
                variant="primary"
                size="lg"
                className="w-full sm:w-auto px-12 text-base font-black shadow-xl shadow-primary/10"
              >
                {isSubmitting ? 'جاري الحفظ...' : 'تسجيل الختمة وإطلاق الأثر ✨'}
              </Button>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
