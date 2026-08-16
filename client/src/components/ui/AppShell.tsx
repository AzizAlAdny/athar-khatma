'use client';

import { useState } from 'react';
import { Mail, ExternalLink } from 'lucide-react';
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

      {/* Site-wide contact footer */}
      <footer className="border-t border-secondary-light/30 bg-white">
        <div className="max-w-7xl mx-auto px-5 py-7 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-black text-primary opacity-70">
            ختمة وأثر — منصة صناعة الأثر المجتمعي
          </p>
          <div className="flex flex-row items-center gap-2 text-xs font-bold text-primary-muted">
            <span className="flex items-center gap-2">
              <Mail size={14} className="text-secondary" />
              <span className="hidden sm:inline">للتواصل والاستفسار:</span>
            </span>
            <a
              href="mailto:katmaweb@outlook.com"
              className="text-primary hover:text-secondary transition-colors"
            >
              katmaweb@outlook.com
            </a>
            <span className="opacity-40">•</span>
            <a
              href="https://instagram.com/Khatmaweb"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:text-secondary transition-colors"
            >
              <ExternalLink size={14} className="text-secondary" />
              @Khatmaweb
            </a>
          </div>
        </div>
      </footer>

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
