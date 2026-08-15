import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Button from '@/components/ui/Button';
import AuthLayout from '@/components/ui/AuthLayout';
import { Mail, CheckCircle2, LogOut, RefreshCw } from 'lucide-react';
import { resendEmailVerification, verifyEmailLink, fetchUser } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function VerifyEmail() {
  const router = useRouter();
  const { user, login, logout } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [verifyingLink, setVerifyingLink] = useState(false);

  // When the user clicks the email link, the API verifies and redirects here
  // with ?verified=1 — auto-refresh the user and proceed to the dashboard.
  useEffect(() => {
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
  }, [router.query.verified]);

  // Email links land here with the API's signed params
  // (?id=..&hash=..&expires=..&signature=..). Forward them to the API to
  // actually mark the email verified, then refresh the user.
  useEffect(() => {
    const { id, hash, expires, signature } = router.query;
    if (!id || !hash || !expires || !signature || typeof id !== 'string') return;
    if (verifyingLink) return;
    setVerifyingLink(true);
    setError(null);

    (async () => {
      try {
        await verifyEmailLink(id as string, hash as string, expires as string, signature as string);
        setMessage('تم التحقق من بريدكِ الإلكتروني بنجاح!');
        try {
          const freshUser = await fetchUser();
          login(freshUser);
          router.push('/dashboard');
        } catch {
          // Verification succeeded, but this browser isn't signed in —
          // keep the success message; the user can log in afterwards.
        }
      } catch (err: any) {
        setError(
          err.message ||
            'رابط التحقق غير صالح أو منتهي الصلاحية. يرجى إعادة إرسال رابط التحقق.'
        );
      } finally {
        setVerifyingLink(false);
      }
    })();
  }, [router.query]);

  const handleResend = async () => {
    setError(null);
    setMessage(null);
    setResending(true);
    try {
      const data = await resendEmailVerification();
      setMessage(data.message || 'تم إرسال رابط التحقق إلى بريدكِ الإلكتروني.');
    } catch (err: any) {
      setError(err.message || 'تعذر إرسال رابط التحقق، يرجى المحاولة لاحقاً.');
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerified = async () => {
    setError(null);
    setChecking(true);
    try {
      const freshUser = await fetchUser();
      login(freshUser);
      if (freshUser.email_verified) {
        router.push('/dashboard');
      } else {
        setError('لم يتم التحقق من البريد الإلكتروني بعد. يرجى الضغط على الرابط المرسل إلى بريدكِ.');
      }
    } catch (err: any) {
      setError(err.message || 'تعذر التحقق من حالة البريد الإلكتروني.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <AuthLayout
      title="تحققي من بريدكِ الإلكتروني"
      subtitle="أرسلنا رابط تحقق إلى بريدكِ لإتمام إنشاء الحساب"
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
            <Mail size={36} />
          </div>
        </div>

        <p className="text-sm text-primary-muted font-medium leading-relaxed">
          تم إنشاء حسابكِ بنجاح. لإكمال التسجيل والبدء في صناعة الأثر، يرجى الضغط على رابط التحقق الذي أرسلناه إلى:
        </p>

        <p className="text-base font-black text-primary break-all" dir="ltr">
          {user?.email}
        </p>

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
            disabled={checking}
            onClick={handleCheckVerified}
            className="w-full py-3 rounded-[1.25rem] text-lg font-black bg-primary hover:bg-[#4a1a2f] shadow-xl shadow-primary/10 transition-all active:scale-95"
          >
            {checking ? (
              <span className="inline-flex items-center justify-center gap-2">
                <RefreshCw size={18} className="animate-spin" /> جاري التحقق...
              </span>
            ) : (
              'تأكيد التحقق والمتابعة'
            )}
          </Button>

          <button
            type="button"
            disabled={resending}
            onClick={handleResend}
            className="w-full py-3 rounded-[1.25rem] text-sm font-black text-primary bg-white border border-primary/20 hover:bg-primary/5 transition-all active:scale-95 disabled:opacity-60"
          >
            {resending ? 'جاري الإرسال...' : 'إعادة إرسال رابط التحقق'}
          </button>
        </div>

        <p className="text-xs text-primary-muted font-medium pt-2">
          لم تصلي الرسالة؟ تحققي من مجلد الرسائل غير المرغوب فيها (Spam).
        </p>
      </div>
    </AuthLayout>
  );
}
