import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Button from '@/components/ui/Button';
import AuthLayout from '@/components/ui/AuthLayout';
import Input from '@/components/ui/Input';
import { User, Mail, Lock, MapPin, Briefcase, Gift, ArrowLeft, Sparkles } from 'lucide-react';
import { register, getGifts, Gift as GiftType } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

import { CITY_DATA, Neighborhood } from '@/constants/locations';

export default function Register() {
  const router = useRouter();
  const { login } = useAuth();
    const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole] = useState('khatma');
  const [city, setCity] = useState('الرياض');
  const [neighborhood, setNeighborhood] = useState('');
  const [pledge, setPledge] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    passwordConfirm?: string;
    city?: string;
    neighborhood?: string;
    pledge?: string;
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
    if (!pledge) newErrors.pledge = 'يجب الموافقة على التعهد للمتابعة';

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
        display_name: displayName || undefined,
        email,
        password,
        password_confirmation: passwordConfirm,
        role,
        city,
        neighborhood,
        lat: selectedNeighborhood?.lat,
        lng: selectedNeighborhood?.lng,
        pledge_accepted: pledge
      };

      const data = await register(payload as any);
      // Store email for verification page (user not fully authenticated yet)
      if (typeof window !== 'undefined') {
        localStorage.setItem('pending_verification_email', data.email || data.user.email);
      }
      // Redirect to verification page with email verification required
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
          <Link href="/auth/login" className="text-primary font-black hover:opacity-70 transition-opacity inline-flex items-center gap-1">
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
            placeholder="ادخلي اسمكِ الكامل"
            error={errors.name}
            required
          />

          <Input
            containerClassName="md:col-span-2"
            label="اسم العرض (اختياري)"
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            icon={User}
            placeholder="الاسم الذي سيظهر للآخرين"
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

          <div className="md:col-span-2 space-y-4 bg-primary/5 p-5 rounded-[1.25rem] border border-primary/10">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Sparkles className="text-primary" size={18} />
              </div>
              <p className="text-xs font-bold text-primary-muted leading-relaxed whitespace-pre-line">
                عزيزتي :
                الإخلاص ومراقبة الله عزوجل قبل كل شيء وسلامة النطق وخلو التلاوة من اللحون الجلية والمحافظة على خصوصية المستفيدين وكرامتهم
                وتقديم الأثر النافع لهم
                واستخدام المنصة فيما خُصصت له فقط
              </p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={pledge}
                  onChange={e => setPledge(e.target.checked)}
                  className="peer appearance-none w-6 h-6 rounded-lg border-2 border-primary/20 checked:bg-primary checked:border-primary transition-all cursor-pointer"
                />
                <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              </div>
              <span className="text-sm font-black text-primary group-hover:opacity-80 transition-opacity select-none">
                أتعهد بالالتزام بذلك
              </span>
            </label>
            {errors.pledge && <p className="text-[11px] text-red-500 font-black pr-1">{errors.pledge}</p>}
          </div>
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
            variant="primary"
            size="lg"
            fullWidth
            className="shadow-xl shadow-primary/10"
          >
            {isSubmitting ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب الآن'}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
