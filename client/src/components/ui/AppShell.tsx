'use client';

import { useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Header from '@/components/ui/Header';

interface AppShellProps {
  hero?: React.ReactNode;
  children: React.ReactNode;
}

export default function AppShell({ hero, children }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-right" dir="rtl">
      <Header onMenuClick={() => setIsSidebarOpen(true)} />

      <div className="flex flex-1 relative">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 p-4 md:p-8 lg:p-10 mr-0 xl:mr-24 pt-6">
          {hero}

          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
