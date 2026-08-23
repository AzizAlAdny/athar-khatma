'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, HelpCircle, Trash2, Loader2, X } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'success' | 'warning' | 'primary';
  isLoading?: boolean;
  loadingText?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText = 'إلغاء',
  variant = 'primary',
  isLoading = false,
  loadingText = 'جاري التحديث...',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-red-50 text-red-600 border border-red-100',
          icon: <Trash2 size={26} />,
          btnColor: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20',
          defaultConfirmText: 'نعم، تأكيد الحذف',
        };
      case 'success':
        return {
          iconBg: 'bg-green-50 text-green-600 border border-green-100',
          icon: <CheckCircle2 size={26} />,
          btnColor: 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20',
          defaultConfirmText: 'نعم، تأكيد الاكتمال',
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
          icon: <AlertTriangle size={26} />,
          btnColor: 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20',
          defaultConfirmText: 'تأكيد',
        };
      case 'primary':
      default:
        return {
          iconBg: 'bg-primary/10 text-primary border border-primary/20',
          icon: <HelpCircle size={26} />,
          btnColor: 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20',
          defaultConfirmText: 'تأكيد',
        };
    }
  };

  const { iconBg, icon, btnColor, defaultConfirmText } = getVariantStyles();

  return (
    <div className="fixed inset-0 z-[110] w-screen h-screen bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      <div className="bg-white rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-secondary-light/40 my-auto animate-in fade-in zoom-in-95 duration-200 text-right relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute left-4 top-4 w-8 h-8 rounded-full bg-background hover:bg-secondary-light/30 flex items-center justify-center text-primary-muted hover:text-primary transition-colors cursor-pointer disabled:opacity-40"
        >
          <X size={16} />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center space-y-3 mb-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${iconBg}`}>
            {icon}
          </div>
          <h3 className="text-lg sm:text-xl font-black text-primary leading-snug">
            {title}
          </h3>
          <p className="text-xs sm:text-sm font-medium text-primary-muted leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 ${btnColor}`}
          >
            {isLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>{loadingText}</span>
              </>
            ) : (
              <span>{confirmText || defaultConfirmText}</span>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-primary-muted hover:text-primary bg-background hover:bg-secondary-light/20 border border-secondary-light/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
