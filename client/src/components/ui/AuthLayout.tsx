'use client';

import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  footer?: React.ReactNode;
  maxWidth?: 'md' | 'xl';
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  footer,
  maxWidth = 'md'
}: AuthLayoutProps) {
  const maxWidthClass = maxWidth === 'xl' ? 'max-w-xl' : 'max-w-md';

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-6 md:p-12 overflow-hidden" dir="rtl">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full -ml-48 -mb-48 blur-3xl -z-10"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-secondary/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl -z-10"></div>

      <div className={`${maxWidthClass} w-full relative z-10`}>
        {/* Card Container */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(94,32,59,0.04)] p-8 md:p-10 border border-secondary-light/30">
          {/* Header Section */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white mb-6 shadow-sm overflow-hidden">
               <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#2D243F] tracking-tight mb-3">
              {title}
            </h1>
            <p className="text-slate-500 text-base md:text-lg font-medium max-w-sm mx-auto leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Main Content */}
          <div className="relative">
            {children}
          </div>

          {/* Footer Section */}
          {footer && (
            <div className="mt-5 pt-4 border-t border-slate-50 text-center text-slate-500 font-medium">
              {footer}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
