'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface HeroAction {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'gold' | 'ghost';
  icon?: LucideIcon;
}

interface HeroProps {
  title: React.ReactNode;
  subtitle: string;
  variant?: 'primary' | 'accent' | 'secondary' | 'simple';
  actions?: React.ReactNode;
  graphic?: React.ReactNode;
}

export default function Hero({
  title,
  subtitle,
  variant = 'primary',
  actions,
  graphic
}: HeroProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'accent':
        return {
          container: 'from-accent/5 via-white to-secondary/10',
          blurPrimary: 'bg-accent/10',
          blurSecondary: 'bg-secondary/10',
          title: 'text-primary',
          subtitle: 'text-primary-muted'
        };
      case 'secondary':
        return {
          container: 'from-secondary/10 via-white to-primary/5',
          blurPrimary: 'bg-secondary/15',
          blurSecondary: 'bg-primary/5',
          title: 'text-primary',
          subtitle: 'text-primary-muted'
        };
      case 'simple':
        return {
          container: 'bg-white',
          blurPrimary: 'hidden',
          blurSecondary: 'hidden',
          title: 'text-primary',
          subtitle: 'text-primary-muted'
        };
      default:
        return {
          container: 'from-primary/5 via-white to-secondary/10',
          blurPrimary: 'bg-primary/10',
          blurSecondary: 'bg-secondary/15',
          title: 'text-primary',
          subtitle: 'text-primary-muted'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`mb-8 rounded-[32px] md:rounded-[40px] bg-gradient-to-br ${styles.container} shadow-sm border border-secondary-light/20 px-6 py-8 md:px-12 md:py-16 relative overflow-hidden`}>
      {/* Decorative Blurs */}
      <div className={`absolute top-0 right-0 w-80 h-80 ${styles.blurPrimary} rounded-full -mr-40 -mt-40 blur-3xl -z-10 opacity-60`}></div>
      <div className={`absolute bottom-0 left-0 w-64 h-64 ${styles.blurSecondary} rounded-full -ml-32 -mb-32 blur-3xl -z-10 opacity-40`}></div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        <div className="space-y-4 md:space-y-6 text-right flex-1">
          <h1 className={`text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-2xl ${styles.title}`}>
            {title}
          </h1>
          <p className={`max-w-xl text-sm md:text-lg font-bold leading-relaxed ${styles.subtitle}`}>
            {subtitle}
          </p>

          {actions && (
            <div className="flex flex-wrap gap-4 mt-8 md:mt-12">
              {actions}
            </div>
          )}
        </div>

        {graphic && (
          <div className="hidden lg:block">
            {graphic}
          </div>
        )}
      </div>
    </div>
  );
}
