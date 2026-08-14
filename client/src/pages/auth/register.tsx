import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Button from '@/components/ui/Button';
import AuthLayout from '@/components/ui/AuthLayout';
import Input from '@/components/ui/Input';
import { User, Mail, Lock, MapPin, Briefcase, Gift, ArrowLeft } from 'lucide-react';
import { register, getGifts, Gift as GiftType } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

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

export default function Register() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole] = useState('khatma');
  const [city, setCity] = useState('الرياض');
  const [neighborhood, setNeighborhood] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    passwordConfirm?: string;
    city?: string;
    neighborhood?: string;
    general?: string
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset neighborhood when city changes
  useEffect(() => {
    setNeighborhood('');
  }, [city]);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name) newErrors.name = 'الاسم الكامل مطلوب';
    if (!email) newErrors.email = 'البريد الإلكتروني مطلوب';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'صيغة البريد الإلكتروني غير صحيحة';

    if (!password) newErrors.password = 'كلمة المرور مطلوبة';
    else if (password.length < 8) newErrors.password = 'يجب أن تكون كلمة المرور 8 أحرف على الأقل';
    else if (password !== passwordConfirm) newErrors.passwordConfirm = 'كلمتا المرور غير متطابقتين';

    if (!city) newErrors.city = 'الرجاء اختيار المدينة';
    if (!neighborhood) newErrors.neighborhood = 'الرجاء اختيار الحي السكني';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setErrors({});
    setIsSubmitting(true);

    const selectedNeighborhood = CITY_DATA[city]?.find(n => n.name === neighborhood);

    try {
      const payload = {
        name,
        email,
        password,
        password_confirmation: passwordConfirm,
        role,
        city,
        neighborhood,
        lat: selectedNeighborhood?.lat,
        lng: selectedNeighborhood?.lng
      };

      const data = await register(payload as any);
      login(data.user, data.token);
      router.push('/auth/verify');
    } catch (err: any) {
      setErrors({ general: err.message || 'فشل إنشاء الحساب، يرجى المحاولة لاحقاً.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="صناعة الأثر تبدأ هنا"
      subtitle="انضمي إلينا وشاركي في مجتمع العطاء"
      maxWidth="xl"
      footer={
        <>
          لديكِ حساب بالفعل؟{' '}
          <Link href="/auth/login" className="text-[#5E203B] font-black hover:opacity-70 transition-opacity inline-flex items-center gap-1">
            تسجيل الدخول <ArrowLeft size={14} />
          </Link>
        </>
      }
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            containerClassName="md:col-span-2"
            label="الاسم الكامل"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            icon={User}
            placeholder="اكتبي اسمكِ الثلاثي"
            error={errors.name}
            required
          />

          <Input
            containerClassName="md:col-span-2"
            label="البريد الإلكتروني"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            icon={Mail}
            placeholder="example@mail.com"
            error={errors.email}
            required
          />

          <Input
            as="select"
            label="نوع الحساب"
            value={role}
            onChange={e => setRole(e.target.value)}
            icon={Briefcase}
            required
          >
            <option value="khatma">خاتمة (مانحة للأثر)</option>
            <option value="seeker">صاحب احتياج (مستفيد)</option>
          </Input>

          <Input
            as="select"
            label="المدينة"
            value={city}
            onChange={e => setCity(e.target.value)}
            icon={MapPin}
            error={errors.city}
            required
          >
            {Object.keys(CITY_DATA).map(cityName => (
              <option key={cityName} value={cityName}>{cityName}</option>
            ))}
          </Input>

          <Input
            as="select"
            label="الحي السكني"
            value={neighborhood}
            onChange={e => setNeighborhood(e.target.value)}
            icon={MapPin}
            error={errors.neighborhood}
            required
          >
            <option value="">اختر الحي السكني</option>
            {CITY_DATA[city]?.map(n => (
              <option key={n.name} value={n.name}>{n.name}</option>
            ))}
          </Input>

          <Input
            containerClassName="md:col-span-2"
            label="كلمة المرور"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            icon={Lock}
            placeholder="••••••••"
            error={errors.password}
            required
          />

          <Input
            containerClassName="md:col-span-2"
            label="تأكيد كلمة المرور"
            type="password"
            value={passwordConfirm}
            onChange={e => setPasswordConfirm(e.target.value)}
            icon={Lock}
            placeholder="•••••••••"
            error={errors.passwordConfirm}
            required
          />
        </div>

        {errors.general && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold p-4 rounded-2xl text-center">
            {errors.general}
          </div>
        )}

        <div className="md:col-span-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 rounded-[1.25rem] text-lg font-black bg-[#5E203B] hover:bg-[#4a1a2f] shadow-xl shadow-[#5E203B]/10 transition-all active:scale-95"
          >
            {isSubmitting ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب الآن'}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
