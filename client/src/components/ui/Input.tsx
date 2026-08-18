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
  const { label, icon: Icon, error, containerClassName = '', as = 'input', className = '', ...rest } = props;

  const baseClasses = `w-full px-5 py-3.5 rounded-2xl border outline-none transition-all duration-200 text-primary font-semibold placeholder:text-primary-muted placeholder:font-normal bg-background/50 hover:bg-background focus:bg-white ${
    Icon ? 'pr-12' : ''
  } ${
    (rest as any).disabled
      ? 'bg-background text-primary-muted cursor-not-allowed border-secondary-light/30'
      : error
      ? 'border-red-500 focus:ring-4 focus:ring-red-500/10'
      : 'border-secondary-light/30 focus:ring-4 focus:ring-primary/5 focus:border-primary'
  } ${className}`;

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
      <label className="block text-sm font-black text-primary mr-1">{label}</label>
      <div className="relative group">
        {Icon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-muted group-focus-within:text-primary transition-colors duration-200">
            <Icon size={20} />
          </div>
        )}
        {renderField()}
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
