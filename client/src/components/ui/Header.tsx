'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, MessageSquare, Search, Menu, LogIn, UserPlus, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, isAuthenticated } = useAuth();
  const userName = user?.name || 'زائرة';
  const roleLabel = user?.role === 'seeker' ? 'طالبة عون' : user?.role === 'admin' ? 'مشرفة' : 'ختماتي';

  return (
    <header className="bg-white px-4 md:px-10 py-4 flex justify-between items-center sticky top-0 z-[60] border-b border-secondary-light/30 w-full shadow-sm">
      {/* Right Side: Logo and Title */}
      <div className="flex items-center gap-2 md:gap-4 order-1">
        {/* Mobile Menu Toggle */}
        <button
          className="xl:hidden p-2 text-primary hover:bg-background rounded-xl ml-1"
          onClick={onMenuClick}
        >
          <Menu size={24} />
        </button>

         <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white p-1 shadow-sm overflow-hidden flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
         </div>
         <div className="text-right">
           <h1 className="text-sm md:text-xl font-black text-primary tracking-tight">ختمة و أثر</h1>
           <p className="text-[8px] md:text-[9px] text-secondary font-bold">كل ختمة.. <span className="text-accent">تثمر أثراً</span></p>
         </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-xl mx-4 md:mx-8 hidden lg:block order-2">
        <div className="relative group">
          <input
            type="text"
            placeholder="ابحثي عن خدمة ..."
            className="w-full bg-background border border-secondary-light/30 rounded-2xl px-12 py-2.5 text-xs text-right focus:outline-none focus:ring-2 focus:ring-secondary-light transition-all shadow-inner group-hover:bg-white"
          />
          <Search className="absolute left-4 top-3 text-primary-muted" size={14} />
        </div>
      </div>

      {/* Left Side: Profile / Auth and Notifications */}
      <div className="flex items-center gap-3 md:gap-6 order-3">
        {isAuthenticated ? (
          <Link href="/profile" className="flex items-center gap-3 group cursor-pointer hover:bg-background p-1 rounded-2xl transition-colors">
            <div className="relative">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-secondary/10 border-2 border-accent flex items-center justify-center text-accent">
                <User className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 md:w-3.5 md:h-3.5 bg-accent rounded-full border-2 border-white shadow-sm"></div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-primary-muted font-bold leading-tight">مرحباً بكِ</p>
              <div className="flex items-center gap-1">
                <h3 className="text-xs font-black text-primary">{userName}</h3>
                <span className="text-[8px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full font-bold">{roleLabel}</span>
              </div>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href="/auth/login"
              className="flex items-center gap-1.5 text-primary border border-secondary-light/40 px-3 md:px-5 py-2 md:py-2.5 rounded-2xl text-xs font-black hover:bg-background transition-colors active:scale-95"
            >
              <LogIn size={14} /> تسجيل الدخول
            </Link>
            <Link
              href="/auth/register"
              className="flex items-center gap-1.5 bg-primary text-white px-3 md:px-5 py-2 md:py-2.5 rounded-2xl text-xs font-black hover:bg-[#4a1a2f] transition-colors shadow-md shadow-primary/10 active:scale-95"
            >
              <UserPlus size={14} /> إنشاء حساب
            </Link>
          </div>
        )}

        <div className="flex gap-2 md:gap-3 pr-2 md:pr-4 border-r border-secondary-light/30">
           <div className="hidden relative text-primary-muted hover:text-primary cursor-pointer p-2 rounded-xl bg-background">
             <Bell size={18} />
             <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
           </div>
           <div className="text-primary-muted hover:text-primary cursor-pointer p-2 rounded-xl bg-background hidden">
              <MessageSquare size={18} />
           </div>
           <img
             src="/gaith.jpeg"
             alt="غيث"
             className="w-12 h-12 md:w-16 md:h-16 rounded-2xl object-cover shadow-sm"
           />
        </div>
      </div>
    </header>
  );
}

