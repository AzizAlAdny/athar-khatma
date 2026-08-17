'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Gift,
  HelpCircle,
  Plus,
  LogIn,
  UserPlus,
  BarChart3,
  Settings,
  LogOut,
  X,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

type NavItem = {
  label: string;
  href: string;
  activePath: string;
  Icon: any;
};

// Nav items per role. Guests only see the landing + auth entry points.
const guestNav: NavItem[] = [
  { label: 'الرئيسية', href: '/', activePath: '/', Icon: Home },
  { label: 'تسجيل الدخول', href: '/auth/login', activePath: '/auth/login', Icon: LogIn },
  { label: 'إنشاء حساب', href: '/auth/register', activePath: '/auth/register', Icon: UserPlus },
];

const seekerNav: NavItem[] = [
  { label: 'الرئيسية', href: '/', activePath: '/', Icon: Home },
  { label: 'الرسائل', href: '/chat', activePath: '/chat', Icon: MessageCircle },
  { label: 'طلباتي', href: '/needs', activePath: '/needs', Icon: HelpCircle },
  { label: 'طلب احتياج', href: '/needs/register', activePath: '/needs/register', Icon: Plus },
  { label: 'تصفح العطايا', href: '/needs/giftbrowser', activePath: '/needs/giftbrowser', Icon: Gift },
];

const khatmaNav: NavItem[] = [
  { label: 'الرئيسية', href: '/', activePath: '/', Icon: Home },
  { label: 'الرسائل', href: '/chat', activePath: '/chat', Icon: MessageCircle },
  { label: 'تسجيل ختمة', href: '/khatma/register', activePath: '/khatma/register', Icon: Plus },
  { label: 'طلبات المحتاجين', href: '/needs/browse', activePath: '/needs/browse', Icon: HelpCircle },
  { label: 'هداياي', href: '/my-gifts', activePath: '/my-gifts', Icon: Gift },
];

const adminNav: NavItem[] = [
  { label: 'الرئيسية', href: '/', activePath: '/', Icon: Home },
  { label: 'الرسائل', href: '/chat', activePath: '/chat', Icon: MessageCircle },
  { label: 'تسجيل ختمة', href: '/khatma/register', activePath: '/khatma/register', Icon: Plus },
  { label: 'طلبات المحتاجين', href: '/needs/browse', activePath: '/needs/browse', Icon: HelpCircle },
  { label: 'هداياي', href: '/my-gifts', activePath: '/my-gifts', Icon: Gift },
  { label: 'التقارير', href: '/admin', activePath: '/admin', Icon: BarChart3 },
];

function getNavItems(role?: string, isAuthenticated = false): NavItem[] {
  if (!isAuthenticated) return guestNav;
  switch (role) {
    case 'seeker':
      return seekerNav;
    case 'khatma':
      return khatmaNav;
    case 'admin':
      return adminNav;
    default:
      return guestNav;
  }
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const navItems = getNavItems(user?.role, isAuthenticated);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[70] xl:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-[88px] bottom-0 right-0 z-[80] w-24 bg-white border-l border-secondary-light/30 flex flex-col items-center py-6 shadow-[10px_0_40px_rgba(94,32,59,0.03)] transition-transform duration-300 xl:translate-x-0 ${isOpen ? 'translate-x-0' : 'translate-x-full'
          } overflow-y-auto no-scrollbar`}
      >
        <div className="flex h-full flex-col items-center w-full">
          {/* Mobile Close Button */}
          <button
            className="xl:hidden mb-4 p-2 text-primary/50 hover:text-primary"
            onClick={onClose}
          >
            <X size={24} />
          </button>

          <nav className="flex flex-col items-center space-y-4 w-full px-2 flex-1">
            {navItems.map(({ label, href, activePath, Icon }) => {
              const isActive = activePath ? pathname === activePath : false;
              return (
                <Link
                  key={label}
                  href={href}
                  className={`group relative flex flex-col items-center gap-1 rounded-2xl py-3 w-full transition-all duration-300 ${isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-primary-muted hover:bg-background hover:text-primary'
                    }`}
                  onClick={() => onClose && onClose()}
                >
                  <div className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                    <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={`text-[10px] font-black transition-all ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {label}
                  </span>
                  {isActive && (
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-secondary rounded-l-full shadow-[0_0_8px_var(--color-secondary)]"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {isAuthenticated && (
            <div className="mt-auto pb-6 w-full px-2 space-y-4">
              <Link
                href="/settings"
                className="hidden flex-col items-center gap-1 text-primary-muted hover:text-primary hover:bg-background rounded-xl py-2 transition group w-full"
                onClick={() => onClose && onClose()}
              >
                <Settings className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold opacity-80 group-hover:opacity-100">الإعدادات</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex flex-col items-center gap-1 text-primary-muted hover:text-red-600 hover:bg-red-50 rounded-xl py-2 transition group w-full"
              >
                <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold opacity-80 group-hover:opacity-100">خروج</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
