import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Button from '@/components/ui/Button';
import AuthLayout from '@/components/ui/AuthLayout';
import Input from '@/components/ui/Input';
import { Lock, ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react';
import { resetPassword } from '@/services/api';

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token, email } = router.query;

  useEffect(() => {
    if (!token || !email) {
      setError('رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية');
    }
  }, [token, email]);

  const validate = () => {
    if (!password) {
      setError('الرجاء إدخال كلمة المرور الجديدة');
      return false;
    }
    if (password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return false;
    }
    if (password !== passwordConfirmation) {
      setError('كلمة المرور وتأكيدها غير متطابقين');
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
      await resetPassword(
        email as string,
        token as string,
        password,
        passwordConfirmation
      );
      setMessage('تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="إعادة تعيين كلمة المرور"
      subtitle="أدخلي كلمة المرور الجديدة لحسابك"
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
            label="كلمة المرور الجديدة"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={Lock}
            error={error}
            required
          />

          <Input
            label="تأكيد كلمة المرور"
            type="password"
            value={passwordConfirmation}
            onChange={e => setPasswordConfirmation(e.target.value)}
            placeholder="••••••••"
            icon={Lock}
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
          disabled={isSubmitting || !token || !email}
          className="w-full py-3 rounded-[1.25rem] text-lg font-black bg-primary hover:bg-[#4a1a2f] shadow-xl shadow-primary/10 transition-all active:scale-95"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <RefreshCw size={20} className="animate-spin" /> جاري التحديث...
            </span>
          ) : 'تحديث كلمة المرور'}
        </Button>
      </form>
    </AuthLayout>
  );
}