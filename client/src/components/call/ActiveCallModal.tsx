import React, { useState } from 'react';
import { useCall } from '../../context/CallContext';

export const ActiveCallModal: React.FC = () => {
  const { call, status, isMuted, durationSeconds, audioVolume, endCall, toggleMute, audioBlocked, networkFailed, unlockRemoteAudio } = useCall();
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  if (!call || ['IDLE', 'INCOMING_RINGING'].includes(status)) {
    return null;
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'OUTGOING_RINGING':
        return 'جاري الاتصال...';
      case 'CONNECTING':
        return 'جاري الربط...';
      case 'CONNECTED':
        return formatTimer(durationSeconds);
      case 'ENDED':
        return 'انتهت المكالمة';
      case 'BUSY':
        return 'المستخدم مشغول';
      default:
        return '';
    }
  };

  // Minimized Widget
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 left-6 z-50 bg-emerald-900 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-4 border border-emerald-700 animate-bounce-short">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold text-sm">{call.other_user_name}</span>
          <span className="text-xs text-emerald-200 font-mono">{formatTimer(durationSeconds)}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            className={`p-2 rounded-xl text-xs transition-colors ${
              isMuted ? 'bg-rose-500 text-white' : 'bg-emerald-800 hover:bg-emerald-700'
            }`}
          >
            {isMuted ? 'كتم مفعل' : 'كتم'}
          </button>
          <button
            type="button"
            onClick={endCall}
            className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
          >
            إنهاء
          </button>
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="p-2 text-emerald-300 hover:text-white"
            title="توسيع"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Full Overlay Modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative bg-slate-900 text-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center border border-slate-800 flex flex-col items-center">
        {/* Minimize Button */}
        <button
          type="button"
          onClick={() => setIsMinimized(true)}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white transition-colors"
          title="تصغير المكالمة"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Big Avatar with Speaking Visualizer */}
        <div className="relative mb-6 mt-4">
          <div
            className="absolute -inset-4 rounded-full bg-emerald-500/20 transition-all duration-150"
            style={{ transform: `scale(${1 + (audioVolume / 200)})` }}
          />
          <div className="relative w-28 h-28 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-slate-800">
            {call.other_user_name.charAt(0)}
          </div>
        </div>

        {/* Diagnostics: autoplay block / NAT-traversal failure banners */}
        {(audioBlocked || networkFailed) && (
          <div className="w-full mb-4 space-y-2">
            {audioBlocked && (
              <button
                type="button"
                onClick={unlockRemoteAudio}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-300 text-sm font-bold hover:bg-amber-500/25 transition-colors"
              >
                الصوت لم يبدأ تلقائيًا — اضغط هنا للتشغيل 🔊
              </button>
            )}
            {networkFailed && (
              <div className="w-full py-2.5 px-4 rounded-xl bg-rose-500/15 border border-rose-400/40 text-rose-300 text-xs font-semibold leading-relaxed">
                تعذّر تأسيس اتصال صوتي بين الجهازين — شبكتك تمنع الاتصال المباشر. جرّب شبكة أخرى، أو فعّل خادم TURN من إعدادات النشر.
              </div>
            )}
          </div>
        )}

        {/* Name & Status */}
        <h3 className="text-2xl font-bold text-white mb-2">{call.other_user_name}</h3>
        <p className="text-lg font-mono text-emerald-400 font-medium mb-8">
          {getStatusLabel()}
        </p>

        {/* Audio Visualizer Wave */}
        {status === 'CONNECTED' && (
          <div className="flex items-center gap-1.5 h-8 mb-8">
            {[40, 70, 30, 90, 50, 80, 40].map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-emerald-400 rounded-full transition-all duration-150"
                style={{
                  height: `${Math.max(15, (audioVolume * (h / 100)))}%`
                }}
              />
            ))}
          </div>
        )}

        {/* Call Control Bar */}
        <div className="flex items-center justify-center gap-6 w-full mt-2">
          {/* Mute Toggle Button */}
          <button
            type="button"
            onClick={toggleMute}
            disabled={status !== 'CONNECTED'}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
              isMuted
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
            } ${status !== 'CONNECTED' ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
            title={isMuted ? 'إلغاء الكتم' : 'كتم الميكروفون'}
          >
            {isMuted ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>

          {/* Hangup Red Button */}
          <button
            type="button"
            onClick={endCall}
            className="w-16 h-16 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-full flex items-center justify-center shadow-lg transition-all"
            title="إنهاء المكالمة"
          >
            <svg className="w-7 h-7 transform rotate-135" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
