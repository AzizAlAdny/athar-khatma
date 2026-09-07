'use client';

import { useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import { LuInstagram } from 'react-icons/lu';
import Sidebar from '@/components/ui/Sidebar';
import Header from '@/components/ui/Header';

interface AppShellProps {
  hero?: React.ReactNode;
  children: React.ReactNode;
}

export default function AppShell({ hero, children }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-right w-full overflow-x-hidden" dir="rtl">
      <Header onMenuClick={() => setIsSidebarOpen(true)} />

      <div className="flex flex-1 relative w-full min-w-0 max-w-full overflow-x-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 min-w-0 w-full max-w-full p-4 md:p-8 lg:p-10 mr-0 xl:mr-24 pt-6">
          {hero}

          <div className="max-w-7xl mx-auto w-full min-w-0">
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
          <div className="flex flex-row flex-wrap items-center justify-center md:justify-end gap-2.5 sm:gap-3 text-xs font-bold text-primary-muted">
            <span className="hidden sm:inline text-primary-muted">للتواصل والاستفسار:</span>
            <a
              href="mailto:katmaweb@outlook.com"
              className="inline-flex items-center gap-1.5 text-primary hover:text-secondary transition-colors"
            >
              <Mail size={14} className="text-secondary shrink-0" />
              <span dir="ltr">katmaweb@outlook.com</span>
            </a>
            <span className="opacity-40">•</span>
            <a
              href="tel:+966500060229"
              className="inline-flex items-center gap-1.5 text-primary hover:text-secondary transition-colors"
            >
              <Phone size={14} className="text-secondary shrink-0" />
              <span dir="ltr">+966 50 006 0229</span>
            </a>
            <span className="opacity-40">•</span>
            <a
              href="https://instagram.com/Khatmaweb"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary hover:text-secondary transition-colors"
            >
              <LuInstagram size={14} className="text-secondary shrink-0" />
              <span dir="ltr">@Khatmaweb</span>
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
