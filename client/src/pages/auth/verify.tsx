import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Button from '@/components/ui/Button';
import AuthLayout from '@/components/ui/AuthLayout';
import Input from '@/components/ui/Input';
import { Mail, CheckCircle2, LogOut, RefreshCw, ShieldCheck, MailWarning, ArrowRight } from 'lucide-react';
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
      setMessage(data.message || 'تم إرسال رمز التحقق الجديد من support@athar-khatma.online');
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
      title="تأكيد الهوية"
      subtitle="خطوة أخيرة للبدء في صناعة الأثر"
      footer={
        <div className="flex flex-col gap-4">
          <button
            onClick={() => { logout(); }}
            className="text-primary-muted font-bold hover:text-primary transition-colors inline-flex items-center justify-center gap-1 text-sm"
          >
            <LogOut size={16} /> تسجيل الخروج والعودة
          </button>
        </div>
      }
    >
      <div className="space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 animate-pulse">
            <ShieldCheck size={32} />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-bold text-primary-muted">لقد أرسلنا رمز التحقق من support@athar-khatma.online إلى:</p>
            <div className="bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 inline-block">
              <span className="text-lg font-black text-primary select-all break-all" dir="ltr">
                {email || user?.email || '...'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="max-w-[280px] mx-auto">
            <Input
              label="رمز التحقق (6 أرقام)"
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder="0 0 0 0 0 0"
              maxLength={6}
              autoFocus
              autoComplete="one-time-code"
              containerClassName="text-center"
              className="text-center text-3xl font-black tracking-[0.5em] h-16 rounded-[1.25rem] border-2 focus:border-primary transition-all duration-300 placeholder:opacity-30"
              error={error}
            />
          </div>

          <div className="flex flex-col items-center gap-2">
            {timeLeft > 0 ? (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-light/20 text-primary text-xs font-black border border-secondary-light/10">
                <RefreshCw size={12} className="animate-spin" />
                صلاحية الرمز تنتهي خلال: {formatTime(timeLeft)}
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-black border border-red-100">
                <MailWarning size={12} />
                انتهت صلاحية الرمز
              </div>
            )}
          </div>

          {message && (
            <div className="bg-green-50 border border-green-100 text-green-700 text-xs font-bold p-4 rounded-2xl flex items-center justify-center gap-2 animate-in fade-in zoom-in-95">
              <CheckCircle2 size={16} /> {message}
            </div>
          )}

          <div className="space-y-4">
            <Button
              type="button"
              disabled={verifying || timeLeft <= 0}
              onClick={handleVerify}
              className="w-full py-5 rounded-[1.25rem] text-lg font-black shadow-xl shadow-primary/10 active:scale-[0.98]"
            >
              {verifying ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw size={20} className="animate-spin" /> جاري التحقق...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  تأكيد الرمز وبدء الأثر <ArrowRight size={20} />
                </span>
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                disabled={resending}
                onClick={handleResend}
                className="text-sm font-black text-primary-muted hover:text-primary transition-colors disabled:opacity-50 underline underline-offset-4 decoration-primary/30"
              >
                {resending ? 'جاري إرسال رمز جديد...' : 'لم يصلكِ الرمز؟ أرسلي مرة أخرى'}
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-secondary-light/10 rounded-2xl border border-secondary-light/10">
          <p className="text-[11px] text-primary-muted font-bold leading-relaxed text-center">
            تأكدي من مراجعة مجلد الرسائل غير المرغوب فيها (Spam) إذا لم تجدي الرسالة في صندوق الوارد الرئيسي.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
