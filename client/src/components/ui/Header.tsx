'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, MessageSquare, Search, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const userName = user?.name || 'زائرة';

  return (
    <header className="bg-white px-4 md:px-10 py-4 flex justify-between items-center sticky top-0 z-[60] border-b border-gray-50 w-full shadow-sm">
      {/* Right Side: Logo and Title */}
      <div className="flex items-center gap-2 md:gap-4 order-1">
        {/* Mobile Menu Toggle */}
        <button
          className="xl:hidden p-2 text-[#2D243F] hover:bg-gray-50 rounded-xl ml-1"
          onClick={onMenuClick}
        >
          <Menu size={24} />
        </button>

         <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white p-1 shadow-sm overflow-hidden flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
         </div>
         <div className="text-right">
           <h1 className="text-sm md:text-xl font-black text-primary tracking-tight">ختمة و أثر</h1>
           <p className="text-[8px] md:text-[9px] text-secondary font-bold">كل ختمة.. تثمر أثراً</p>
         </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-xl mx-4 md:mx-8 hidden lg:block order-2">
        <div className="relative group">
          <input
            type="text"
            placeholder="ابحثي عن خدمة ..."
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-12 py-2.5 text-xs text-right focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all shadow-inner group-hover:bg-white"
          />
          <Search className="absolute left-4 top-3 text-gray-300" size={14} />
        </div>
      </div>

      {/* Left Side: Profile and Notifications */}
      <div className="flex items-center gap-3 md:gap-6 order-3">
        <Link href="/profile" className="flex items-center gap-3 group cursor-pointer hover:bg-gray-50 p-1 rounded-2xl transition-colors">
          <div className="relative">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`}
              alt="User"
              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-secondary/10 p-0.5 border-2 border-accent"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 md:w-3.5 md:h-3.5 bg-accent rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-gray-400 font-bold leading-tight">مرحباً بكِ</p>
            <div className="flex items-center gap-1">
              <h3 className="text-xs font-black text-primary">{userName}</h3>
              <span className="text-[8px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full font-bold">ختماتي</span>
            </div>
          </div>
        </Link>

        <div className="flex gap-2 md:gap-3 pr-2 md:pr-4 border-r border-gray-100">
           <div className="relative text-gray-400 hover:text-primary cursor-pointer p-2 rounded-xl bg-gray-50/50">
             <Bell size={18} />
             <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
           </div>
           <div className="text-gray-400 hover:text-primary cursor-pointer p-2 rounded-xl bg-gray-50/50 hidden md:block">
              <MessageSquare size={18} />
           </div>
        </div>
      </div>
    </header>
  );
}
