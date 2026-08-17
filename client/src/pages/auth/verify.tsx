import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Button from '@/components/ui/Button';
import AuthLayout from '@/components/ui/AuthLayout';
import Input from '@/components/ui/Input';
import { Mail, CheckCircle2, LogOut, RefreshCw, Key } from 'lucide-react';
import { resendEmailVerification, verifyWithCode, fetchUser, saveAuthToken, resendVerificationCodePublic } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function VerifyEmail() {
  const router = useRouter();
  const { user, login, logout } = useAuth();
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds

  useEffect(() => {
    // Get email from localStorage if user is not authenticated
    if (!user && typeof window !== 'undefined') {
      const pendingEmail = localStorage.getItem('pending_verification_email');
      if (pendingEmail) {
        setEmail(pendingEmail);
      }
    } else if (user) {
      setEmail(user.email);
    }

    if (router.query.verified === '1') {
      setMessage('تم التحقق من بريدكِ الإلكتروني بنجاح!');
      (async () => {
        try {
          const freshUser = await fetchUser();
          login(freshUser);
          if (freshUser.email_verified) {
            router.push('/dashboard');
          }
        } catch {
          // stay on the page; user can click "confirm" manually
        }
      })();
    }
  }, [router.query.verified, user]);

  // Countdown timer for code expiration
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setError('يرجى إدخال رمز التحقق المكون من 6 أرقام');
      return;
    }

    if (!email) {
      setError('عنوان البريد الإلكتروني غير متوفر');
      return;
    }

    setError(null);
    setMessage(null);
    setVerifying(true);

    try {
      const data = await verifyWithCode(email, code);
      setMessage('تم التحقق من بريدكِ الإلكتروني بنجاح!');
      
      // Save the token and user data from the response
      if (data.token) {
        saveAuthToken(data.token);
      }
      if (data.user) {
        login(data.user, data.token);
        // Clear the pending email from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('pending_verification_email');
        }
        
        // Redirect to dashboard after successful verification
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'رمز التحقق غير صحيح أو منتهي الصلاحية');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('عنوان البريد الإلكتروني غير متوفر');
      return;
    }

    setError(null);
    setMessage(null);
    setResending(true);
    setTimeLeft(15 * 60); // Reset timer
    try {
      let data;
      if (user) {
        // User is authenticated, use the protected endpoint
        data = await resendEmailVerification();
      } else {
        // User is not authenticated, use the public endpoint
        data = await resendVerificationCodePublic(email);
      }
      setMessage(data.message || 'تم إرسال رمز التحقق الجديد إلى بريدكِ الإلكتروني.');
    } catch (err: any) {
      setError(err.message || 'تعذر إرسال رمز التحقق، يرجى المحاولة لاحقاً.');
    } finally {
      setResending(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  return (
    <AuthLayout
      title="تحققي من بريدكِ الإلكتروني"
      subtitle="أرسلنا رمز تحقق مكون من 6 أرقام إلى بريدكِ الإلكتروني"
      footer={
        <button
          onClick={() => { logout(); }}
          className="text-primary-muted font-medium hover:text-primary transition-colors inline-flex items-center gap-1"
        >
          <LogOut size={14} /> تسجيل الخروج
        </button>
      }
    >
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center text-primary">
            <Key size={36} />
          </div>
        </div>

        <p className="text-sm text-primary-muted font-medium leading-relaxed">
          تم إنشاء حسابكِ بنجاح. لإكمال التسجيل والبدء في صناعة الأثر، يرجى إدخال رمز التحقق المكون من 6 أرقام الذي أرسلناه إلى:
        </p>

        <p className="text-base font-black text-primary break-all" dir="ltr">
          {user?.email}
        </p>

        <div className="max-w-xs mx-auto">
          <Input
            label="رمز التحقق"
            type="text"
            value={code}
            onChange={handleCodeChange}
            placeholder="123456"
            maxLength={6}
            className="text-center text-2xl tracking-widest"
            error={error}
          />
        </div>

        {timeLeft > 0 && (
          <p className="text-xs text-primary-muted font-medium">
            ينتهي الرمز خلال: <span className="font-bold">{formatTime(timeLeft)}</span>
          </p>
        )}

        {timeLeft <= 0 && (
          <p className="text-xs text-red-600 font-medium">
            رمز التحقق منتهي الصلاحية. يرجى طلب رمز جديد.
          </p>
        )}

        {message && (
          <div className="bg-green-50 border border-green-100 text-green-700 text-xs font-bold p-4 rounded-2xl flex items-center justify-center gap-2">
            <CheckCircle2 size={16} /> {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold p-4 rounded-2xl">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <Button
            type="button"
            disabled={verifying || timeLeft <= 0}
            onClick={handleVerify}
            className="w-full py-3 rounded-[1.25rem] text-lg font-black bg-primary hover:bg-[#4a1a2f] shadow-xl shadow-primary/10 transition-all active:scale-95"
          >
            {verifying ? (
              <span className="inline-flex items-center justify-center gap-2">
                <RefreshCw size={18} className="animate-spin" /> جاري التحقق...
              </span>
            ) : (
              'تحقق من الرمز'
            )}
          </Button>

          <button
            type="button"
            disabled={resending}
            onClick={handleResend}
            className="w-full py-3 rounded-[1.25rem] text-sm font-black text-primary bg-white border border-primary/20 hover:bg-primary/5 transition-all active:scale-95 disabled:opacity-60"
          >
            {resending ? 'جاري الإرسال...' : 'إرسال رمز جديد'}
          </button>
        </div>

        <p className="text-xs text-primary-muted font-medium pt-2">
          لم تصلي الرسالة؟ تحققي من مجلد الرسائل غير المرغوب فيها (Spam).
        </p>
      </div>
    </AuthLayout>
  );
}
