import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Button from '@/components/ui/Button';
import AuthLayout from '@/components/ui/AuthLayout';
import Input from '@/components/ui/Input';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { requestPasswordReset } from '@/services/api';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    if (!email) {
      setError('الرجاء إدخال البريد الإلكتروني');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('صيغة البريد الإلكتروني غير صحيحة');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const data = await requestPasswordReset(email);
      setMessage(data.message || 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="نسيت كلمة المرور"
      subtitle="أدخلي بريدكِ الإلكتروني وسنرسل لكِ رابطاً لإعادة تعيين كلمة المرور"
      footer={
        <>
          <Link href="/auth/login" className="text-primary font-black hover:opacity-70 transition-opacity inline-flex items-center gap-1">
            <ArrowLeft size={14} /> العودة لتسجيل الدخول
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
            error={error}
            required
          />
        </div>

        {message && (
          <div className="bg-green-50 border border-green-100 text-green-700 text-xs font-bold p-4 rounded-2xl flex items-center justify-center gap-2">
            <CheckCircle2 size={16} /> {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold p-4 rounded-2xl text-center">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-[1.25rem] text-lg font-black bg-primary hover:bg-[#4a1a2f] shadow-xl shadow-primary/10 transition-all active:scale-95"
        >
          {isSubmitting ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
        </Button>
      </form>
    </AuthLayout>
  );
}