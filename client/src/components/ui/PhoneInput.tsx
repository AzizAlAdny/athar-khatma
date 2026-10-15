'use client';

import React from 'react';
import { PhoneInput as ReactIntlPhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { Phone, LucideIcon, Globe } from 'lucide-react';
import Input from './Input';

export interface PhoneInputFieldProps {
  label?: string;
  value: string;
  onChange: (phone: string) => void;
  isMultiCountry?: boolean;
  error?: string | null;
  containerClassName?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  icon?: LucideIcon;
}

// Preferred Arab countries to show at the top of the international selector
const PREFERRED_COUNTRIES = [
  'sa', // السعودية
  'eg', // مصر
  'ae', // الإمارات
  'kw', // الكويت
  'qa', // قطر
  'bh', // البحرين
  'om', // عُمان
  'jo', // الأردن
  'ps', // فلسطين
  'iq', // العراق
  'ye', // اليمن
  'sy', // سوريا
  'lb', // لبنان
  'sd', // السودان
  'ma', // المغرب
  'dz', // الجزائر
  'tn', // تونس
  'ly', // ليبيا
];

export default function PhoneInput({
  label = 'رقم الجوال (واتساب)',
  value,
  onChange,
  isMultiCountry = true,
  error,
  containerClassName = '',
  disabled = false,
  required = false,
  placeholder,
  icon: Icon = Phone,
}: PhoneInputFieldProps) {
  // If not multi-country (e.g. Khatma or Visitor), render standard Saudi input with 05xxxxxxxx format
  if (!isMultiCountry) {
    return (
      <Input
        containerClassName={containerClassName}
        label={label}
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        icon={Icon}
        placeholder={placeholder || '05xxxxxxxx'}
        error={error}
        dir="ltr"
        className="text-right"
        disabled={disabled}
        required={required}
      />
    );
  }

  // Multi-country mode (for seeker / صاحب احتياج): full international phone selector
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      <div className="flex items-center justify-between mr-1">
        <label className="block text-sm font-black text-primary flex items-center gap-1.5">
          {label}
          {required && <span className="text-red-500 font-bold">*</span>}
        </label>
        <span className="text-[11px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Globe size={11} />
          متاح لجميع الدول
        </span>
      </div>

      <div className="relative group phone-input-wrapper" dir="ltr">
        <ReactIntlPhoneInput
          defaultCountry="sa"
          preferredCountries={PREFERRED_COUNTRIES}
          value={value}
          onChange={(phone) => onChange(phone)}
          disabled={disabled}
          placeholder={placeholder || '5x xxx xxxx'}
          className="w-full flex items-center"
          inputClassName={`!w-full !h-auto !px-4 !py-3.5 !rounded-r-2xl !border !outline-none !transition-all !duration-200 !text-primary !font-semibold !placeholder:text-primary-muted !placeholder:font-normal !bg-background/50 hover:!bg-background focus:!bg-white !text-left !text-sm ${
            disabled
              ? '!bg-background !text-primary-muted !cursor-not-allowed !border-secondary-light/30'
              : error
              ? '!border-red-500 focus:!ring-4 focus:!ring-red-500/10'
              : '!border-secondary-light/30 focus:!ring-4 focus:!ring-primary/5 focus:!border-primary'
          }`}
          countrySelectorStyleProps={{
            buttonClassName: `!h-auto !px-3 !py-3.5 !rounded-l-2xl !border !border-r-0 !bg-background/60 hover:!bg-background/90 !transition-colors !duration-200 ${
              error ? '!border-red-500' : '!border-secondary-light/30'
            }`,
            dropdownStyleProps: {
              className: '!z-50 !rounded-2xl !shadow-2xl !border !border-secondary-light/30 !max-h-72 !overflow-y-auto !bg-white !p-1.5',
            },
          }}
        />
      </div>

      {error && (
        <div className="flex items-center gap-1.5 px-1 animate-in fade-in slide-in-from-top-1">
          <div className="w-1 h-1 bg-red-500 rounded-full"></div>
          <p className="text-xs text-red-500 font-bold">{error}</p>
        </div>
      )}
    </div>
  );
}
