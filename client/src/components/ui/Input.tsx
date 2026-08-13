'use client';

import React, { InputHTMLAttributes, SelectHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

interface BaseProps {
  label: string;
  icon?: LucideIcon;
  error?: string | null;
  containerClassName?: string;
  disabled?: boolean;
}

type InputProps = BaseProps & InputHTMLAttributes<HTMLInputElement> & { as?: 'input' };
type SelectProps = BaseProps & SelectHTMLAttributes<HTMLSelectElement> & { as: 'select' };

type ComponentProps = InputProps | SelectProps;

export default function Input(props: ComponentProps) {
  const { label, icon: Icon, error, containerClassName = '', as = 'input', ...rest } = props;

  const baseClasses = `w-full px-5 py-3.5 rounded-2xl border outline-none transition-all duration-200 text-primary font-semibold placeholder:text-slate-400 placeholder:font-normal bg-slate-50/50 hover:bg-slate-50 focus:bg-white ${
    Icon ? 'pr-12' : ''
  } ${
    (rest as any).disabled
      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
      : error
      ? 'border-red-500 focus:ring-4 focus:ring-red-500/10'
      : 'border-slate-100 focus:ring-4 focus:ring-primary/5 focus:border-primary'
  }`;

  const renderField = () => {
    if (as === 'select') {
      const { ...selectRest } = rest as SelectHTMLAttributes<HTMLSelectElement>;
      return (
        <select className={baseClasses} {...selectRest}>
          {props.children}
        </select>
      );
    }
    const { ...inputRest } = rest as InputHTMLAttributes<HTMLInputElement>;
    return <input className={baseClasses} {...inputRest} />;
  };

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      <label className="block text-sm font-black text-slate-700 mr-1">{label}</label>
      <div className="relative group">
        {Icon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors duration-200">
            <Icon size={20} />
          </div>
        )}
        {renderField()}
      </div>
      {error && (
        <div className="flex items-center gap-1.5 px-1 animate-in fade-in slide-in-from-top-1">
          <div className="w-1 h-1 bg-red-500 rounded-full"></div>
          <p className="text-[11px] text-red-500 font-bold">{error}</p>
        </div>
      )}
    </div>
  );
}
