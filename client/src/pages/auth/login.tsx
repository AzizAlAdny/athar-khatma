import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Button from '@/components/ui/Button';
import AuthLayout from '@/components/ui/AuthLayout';
import Input from '@/components/ui/Input';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { login as apiLogin } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = 'الرجاء إدخال البريد الإلكتروني';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'صيغة البريد الإلكتروني غير صحيحة';

    if (!password) newErrors.password = 'الرجاء إدخال كلمة المرور';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setErrors({});
    setIsSubmitting(true);

    try {
      const data = await apiLogin(email, password);
      login(data.user, data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setErrors({ general: err.message || 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="مرحباً بكِ من جديد"
      subtitle="سجلي دخولكِ لتواصلي رحلة الأثر والعطاء"
      footer={
        <>
          ليس لديكِ حساب حتى الآن؟{' '}
          <Link href="/auth/register" className="text-[#5E203B] font-black hover:opacity-70 transition-opacity inline-flex items-center gap-1">
            انضمي إلينا الآن <ArrowLeft size={14} />
          </Link>
        </>
      }
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-5">
          <Input
            label="البريد الإلكتروني"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="example@mail.com"
            icon={Mail}
            error={errors.email}
            required
          />

          <div className="space-y-2">
            <Input
              label="كلمة المرور"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={Lock}
              error={errors.password}
              required
            />
            <div className="text-left px-1">
              <span className="text-[11px] font-bold text-slate-400">نسيتي كلمة المرور؟ تواصلي مع الدعم الفني</span>
            </div>
          </div>
        </div>

        {errors.general && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold p-4 rounded-2xl text-center">
            {errors.general}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-[1.25rem] text-lg font-black bg-[#5E203B] hover:bg-[#4a1a2f] shadow-xl shadow-[#5E203B]/10 transition-all active:scale-95"
        >
          {isSubmitting ? 'جاري التحقق...' : 'تسجيل الدخول'}
        </Button>
      </form>
    </AuthLayout>
  );
}
