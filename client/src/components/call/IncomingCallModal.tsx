import React from 'react';
import { useCall } from '../../context/CallContext';

export const IncomingCallModal: React.FC = () => {
  const { call, status, acceptCall, rejectCall } = useCall();

  if (status !== 'INCOMING_RINGING' || !call) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center border border-emerald-100 flex flex-col items-center">
        {/* Animated Avatar Ring */}
        <div className="relative mb-6">
          <div className="absolute -inset-3 rounded-full bg-emerald-400/20 animate-ping" />
          <div className="relative w-20 h-20 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {call.other_user_name.charAt(0)}
          </div>
        </div>

        {/* Caller Info */}
        <h3 className="text-xl font-bold text-gray-900 mb-1">{call.other_user_name}</h3>
        <p className="text-sm text-emerald-600 font-medium mb-6 animate-pulse">
          مكالمة صوتية واردة...
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-6 w-full mt-2">
          {/* Decline Button */}
          <button
            type="button"
            onClick={rejectCall}
            className="flex-1 py-3 px-4 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-semibold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5 transform rotate-135" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>رفض</span>
          </button>

          {/* Accept Button */}
          <button
            type="button"
            onClick={acceptCall}
            className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>قبول</span>
          </button>
        </div>
      </div>
    </div>
  );
};
