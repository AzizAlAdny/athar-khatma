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

interface Neighborhood {
  name: string;
  lat: number;
  lng: number;
}

const CITY_DATA: Record<string, Neighborhood[]> = {
  'الرياض': [
    { name: 'حي الملقى', lat: 24.8142, lng: 46.6111 },
    { name: 'حي الصحافة', lat: 24.8055, lng: 46.6375 },
    { name: 'حي الياسمين', lat: 24.8217, lng: 46.6567 },
    { name: 'حي النرجس', lat: 24.8450, lng: 46.6800 },
    { name: 'حي الروضة', lat: 24.7300, lng: 46.7700 },
    { name: 'حي السليمانية', lat: 24.7000, lng: 46.7000 },
    { name: 'حي العليا', lat: 24.7136, lng: 46.6753 },
    { name: 'حي المروج', lat: 24.7600, lng: 46.6600 },
    { name: 'حي النفل', lat: 24.7800, lng: 46.6600 },
    { name: 'حي الغدير', lat: 24.7700, lng: 46.6500 },
  ],
  'جدة': [
    { name: 'حي البلد', lat: 21.4833, lng: 39.1833 },
    { name: 'حي الحمراء', lat: 21.5282, lng: 39.1626 },
    { name: 'حي الشاطئ', lat: 21.6033, lng: 39.1166 },
    { name: 'حي الروضة', lat: 21.5732, lng: 39.1483 },
    { name: 'حي العزيزية', lat: 21.5499, lng: 39.1776 },
    { name: 'حي السلامة', lat: 21.5833, lng: 39.1500 },
    { name: 'حي المحيمدية', lat: 21.6167, lng: 39.1333 },
    { name: 'حي الفيصلية', lat: 21.5667, lng: 39.1833 },
    { name: 'حي أبحر الشمالية', lat: 21.7333, lng: 39.1167 },
    { name: 'حي المروة', lat: 21.6333, lng: 39.2000 },
  ],
  'الدمام': [
    { name: 'حي الشاطئ الشرقي', lat: 26.4731, lng: 50.1288 },
    { name: 'حي الريان', lat: 26.4180, lng: 50.1130 },
    { name: 'حي الفيصلية', lat: 26.3985, lng: 50.0760 },
    { name: 'حي الروضة', lat: 26.4420, lng: 50.0880 },
    { name: 'حي المزروعية', lat: 26.4520, lng: 50.1220 },
    { name: 'حي النور', lat: 26.4000, lng: 50.0333 },
    { name: 'حي الاتصالات', lat: 26.4167, lng: 50.0833 },
    { name: 'حي الزهور', lat: 26.4333, lng: 50.1167 },
    { name: 'حي الحمراء', lat: 26.4667, lng: 50.1000 },
    { name: 'حي المباركية', lat: 26.4500, lng: 50.1333 },
  ],
  'مكة المكرمة': [
    { name: 'حي أجياد', lat: 21.4179, lng: 39.8292 },
    { name: 'حي العزيزية', lat: 21.4166, lng: 39.8650 },
    { name: 'حي منى', lat: 21.4150, lng: 39.8930 },
    { name: 'حي المسفلة', lat: 21.4110, lng: 39.8230 },
    { name: 'حي الشبيكة', lat: 21.4210, lng: 39.8180 },
    { name: 'حي بطحاء قريش', lat: 21.3667, lng: 39.8333 },
    { name: 'حي الشرائع', lat: 21.4500, lng: 39.9500 },
    { name: 'حي النوارية', lat: 21.5500, lng: 39.7833 },
    { name: 'حي الرصيفة', lat: 21.4000, lng: 39.7833 },
    { name: 'حي الزايدي', lat: 21.3833, lng: 39.7333 },
  ],
  'المدينة المنورة': [
    { name: 'حي المنطقة المركزية', lat: 24.4686, lng: 39.6142 },
    { name: 'حي قباء', lat: 24.4392, lng: 39.6172 },
    { name: 'حي قربان', lat: 24.4536, lng: 39.6231 },
    { name: 'حي بضاعة', lat: 24.4727, lng: 39.6092 },
    { name: 'حي العيون', lat: 24.5200, lng: 39.5950 },
    { name: 'حي سيد الشهداء', lat: 24.4917, lng: 39.6125 },
    { name: 'حي العزيزية', lat: 24.4667, lng: 39.5333 },
    { name: 'حي الهجرة', lat: 24.4000, lng: 39.6167 },
    { name: 'حي الدويخلة', lat: 24.4833, lng: 39.6500 },
    { name: 'حي الخالدية', lat: 24.4500, lng: 39.6500 },
  ],
};

export default function RegisterNeed() {
  const router = useRouter();
  const [gifts, setGifts] = useState<GiftType[]>([]);
  const [selectedGiftId, setSelectedGiftId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('الرياض');
  const [neighborhood, setNeighborhood] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    setNeighborhood(''); // Reset neighborhood when city changes
  };

  const getSelectedNeighborhood = () => {
    return CITY_DATA[city]?.find(n => n.name === neighborhood);
  };

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
      const selectedNeighborhood = getSelectedNeighborhood();
      
      const payload: any = {
        gift_id: selectedGiftId,
        description: description,
        city: city
      };
      
      if (neighborhood) {
        payload.neighborhood = neighborhood;
      }
      
      if (selectedNeighborhood) {
        payload.latitude = selectedNeighborhood.lat;
        payload.longitude = selectedNeighborhood.lng;
      }
      
      await createNeed(payload);
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
                  onChange={e => handleCityChange(e.target.value)}
                  icon={MapPin}
                  required
                >
                  <option value="الرياض">الرياض</option>
                  <option value="جدة">جدة</option>
                  <option value="الدمام">الدمام</option>
                  <option value="مكة المكرمة">مكة المكرمة</option>
                  <option value="المدينة المنورة">المدينة المنورة</option>
                </Input>
                <Input
                  as="select"
                  label="الحي (اختياري)"
                  value={neighborhood}
                  onChange={e => setNeighborhood(e.target.value)}
                  icon={MapPin}
                  disabled={!city}
                >
                  <option value="">{city ? 'اختر الحي' : 'اختر المدينة أولاً'}</option>
                  {CITY_DATA[city]?.map((hood) => (
                    <option key={hood.name} value={hood.name}>{hood.name}</option>
                  ))}
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
