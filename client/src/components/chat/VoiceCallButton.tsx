import React from 'react';
import { useCall } from '../../context/CallContext';

interface VoiceCallButtonProps {
  receiverId: number;
  receiverName: string;
  contextType: 'need' | 'gift';
  contextId: number;
  disabled?: boolean;
}

export const VoiceCallButton: React.FC<VoiceCallButtonProps> = ({
  receiverId,
  receiverName,
  contextType,
  contextId,
  disabled = false,
}) => {
  const { status, startCall } = useCall();

  const isCallInProgress = status !== 'IDLE';

  const handleClick = () => {
    if (isCallInProgress || disabled) return;
    startCall(receiverId, receiverName, contextType, contextId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isCallInProgress}
      title="إجراء مكالمة صوتية"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all shadow-sm ${
        isCallInProgress || disabled
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border border-emerald-200 active:scale-95'
      }`}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
      <span>مكالمة صوتية</span>
    </button>
  );
};
