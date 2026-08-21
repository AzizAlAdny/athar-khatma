import React, { useEffect, useState, useCallback } from 'react';
import AppShell from '@/components/ui/AppShell';
import Hero from '@/components/ui/Hero';
import {
  BarChart3,
  AlertCircle,
  Loader2,
  Users,
  FileText,
  Shield,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  HeartHandshake,
  Star,
  PhoneCall,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import {
  getAdminStats,
  getAdminUsers,
  type AdminStats,
  type User,
  type PaginatedUsers,
} from '@/services/api';
import KhatmaManagement from '@/components/admin/KhatmaManagement';
import NeedManagement from '@/components/admin/NeedManagement';
import ReviewManagement from '@/components/admin/ReviewManagement';
import CreateUserModal from '@/components/admin/CreateUserModal';

type AdminTab = 'overview' | 'users' | 'khatmas' | 'needs' | 'reviews';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOverviewStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Admin stats fetch error:', err);
      }
      setError('تعذر تحميل إحصائيات لوحة الإدارة.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'overview') {
      loadOverviewStats();
    }
  }, [activeTab, loadOverviewStats]);

  const adminHero = (
    <Hero
      title="لوحة التحكم والإشراف الإداري"
      subtitle="تابعي مؤشرات المنصة، وافحصي المبادرات والاحتياجات، واديري مجتمع أثر بكل سهولة واحترافية."
      variant="simple"
      graphic={
        <div className="w-44 h-44 rounded-full bg-primary/5 flex items-center justify-center text-primary/15 border border-secondary-light/30">
          <Shield size={100} className="text-secondary" />
        </div>
      }
    />
  );

  const tabs = [
    { id: 'overview' as AdminTab, label: 'نظرة عامة', icon: BarChart3 },
    { id: 'users' as AdminTab, label: 'إدارة المستخدمين', icon: Users },
    { id: 'khatmas' as AdminTab, label: 'إدارة الختمات', icon: FileText },
    { id: 'needs' as AdminTab, label: 'إدارة الاحتياجات', icon: HeartHandshake },
    { id: 'reviews' as AdminTab, label: 'مراجعة التقييمات', icon: Star },
  ];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AppShell hero={adminHero}>
        <div className="space-y-8 pb-20">
          {/* Navigation Tab Bar */}
          <div className="flex flex-wrap gap-2 bg-white rounded-[2rem] p-2 shadow-sm border border-secondary-light/30">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 px-5 py-3 rounded-[1.5rem] text-sm font-black transition-all cursor-pointer ${activeTab === tab.id
                    ? 'bg-primary text-white shadow-md'
                    : 'text-primary-muted hover:bg-background'
                  }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-primary-muted font-bold">جاري تحميل إحصائيات المنصة...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-100 text-red-600 p-8 rounded-[2.5rem] text-center flex flex-col items-center">
                <AlertCircle size={48} className="mb-4" />
                <h3 className="text-xl font-black text-primary mb-2">عذراً، حدث خطأ</h3>
                <p className="text-primary-muted font-medium">{error}</p>
              </div>
            ) : stats ? (
              <OverviewTab stats={stats} />
            ) : null
          )}

          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'khatmas' && <KhatmaManagement />}
          {activeTab === 'needs' && <NeedManagement />}
          {activeTab === 'reviews' && <ReviewManagement />}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

function OverviewTab({ stats }: { stats: AdminStats }) {
  return (
    <div className="space-y-8">
      {/* Top 4 KPI Metrics */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'إجمالي الأعضاء',
            value: stats.total_users.toLocaleString(),
            color: 'text-primary',
            bg: 'bg-primary/5',
            icon: Users,
          },
          {
            label: 'الختمات المنشورة',
            value: stats.total_khatmas.toLocaleString(),
            color: 'text-accent',
            bg: 'bg-accent/5',
            icon: FileText,
          },
          {
            label: 'طلبات الاحتياج',
            value: stats.total_needs.toLocaleString(),
            color: 'text-secondary',
            bg: 'bg-secondary/10',
            icon: HeartHandshake,
          },
          {
            label: 'نقاط الأثر التراكمية',
            value: stats.total_impact_points.toLocaleString(),
            color: 'text-primary',
            bg: 'bg-primary/5',
            icon: Sparkles,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-[2rem] bg-white p-7 shadow-sm border border-secondary-light/30 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black text-primary-muted">{item.label}</span>
              <div className={`p-3 rounded-2xl ${item.bg}`}>
                <item.icon size={22} className={item.color} />
              </div>
            </div>
            <p className={`text-3xl font-black ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Deep Dive Breakdown Cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Roles Distribution */}
        <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-secondary-light/30">
          <h3 className="text-lg font-black text-primary mb-6 flex items-center gap-2">
            <Users size={20} className="text-secondary" />
            توزيع الأعضاء
          </h3>
          <div className="space-y-5">
            {[
              { label: 'الخاتمات', value: stats.khatma_users, color: 'bg-primary' },
              { label: 'طالبات الاحتياج', value: stats.seeker_users, color: 'bg-accent' },
              { label: 'المشرفات الإداريات', value: stats.admin_users, color: 'bg-secondary' },
            ].map((item) => {
              const pct = stats.total_users > 0 ? Math.round((item.value / stats.total_users) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-primary">{item.label}</span>
                    <span className="text-primary-muted font-black">
                      {item.value} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 bg-background rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Needs Resolution State */}
        <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-secondary-light/30">
          <h3 className="text-lg font-black text-primary mb-6 flex items-center gap-2">
            <HeartHandshake size={20} className="text-secondary" />
            حالة طلبات الاحتياج
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3.5 bg-background/60 rounded-2xl">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-primary" />
                <span className="font-bold text-xs text-primary">طلبات مفتوحة</span>
              </div>
              <span className="text-lg font-black text-primary">{stats.pending_needs}</span>
            </div>
            <div className="flex justify-between items-center p-3.5 bg-background/60 rounded-2xl">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-accent" />
                <span className="font-bold text-xs text-primary">تم الإيفاء بها</span>
              </div>
              <span className="text-lg font-black text-accent">{stats.fulfilled_needs ?? 0}</span>
            </div>
            <div className="flex justify-between items-center p-3.5 bg-background/60 rounded-2xl">
              <div className="flex items-center gap-2">
                <HeartHandshake size={18} className="text-secondary" />
                <span className="font-bold text-xs text-primary">قيد التنفيذ والمتابعة</span>
              </div>
              <span className="text-lg font-black text-secondary">{stats.in_progress_needs ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Platform Live Quality Indicators */}
        <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-secondary-light/30">
          <h3 className="text-lg font-black text-primary mb-6 flex items-center gap-2">
            <Shield size={20} className="text-secondary" />
            جودة النشاط المباشر
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3.5 bg-background/60 rounded-2xl">
              <div className="flex items-center gap-2">
                <Star size={18} className="text-secondary fill-secondary" />
                <span className="font-bold text-xs text-primary">متوسط تقييم المجتمع</span>
              </div>
              <span className="text-lg font-black text-primary">{stats.average_platform_rating ?? 5.0} / 5.0</span>
            </div>
            <div className="flex justify-between items-center p-3.5 bg-background/60 rounded-2xl">
              <div className="flex items-center gap-2">
                <PhoneCall size={18} className="text-accent" />
                <span className="font-bold text-xs text-primary">مكالمات صوتية جارية</span>
              </div>
              <span className="text-lg font-black text-accent">{stats.active_calls ?? 0}</span>
            </div>
            <div className="flex justify-between items-center p-3.5 bg-background/60 rounded-2xl">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                <span className="font-bold text-xs text-primary">ختمات نشطة حالياً</span>
              </div>
              <span className="text-lg font-black text-primary">{stats.active_khatmas}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  const [data, setData] = useState<PaginatedUsers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminUsers({
        page,
        search: search.trim() || undefined,
        role: role || undefined,
        per_page: 10,
      });
      setData(response);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Users fetch error:', err);
      }
      setError('تعذر تحميل قائمة المستخدمين.');
    } finally {
      setLoading(false);
    }
  }, [page, search, role]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'admin':
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-secondary-light text-primary">مشرفة إدارية</span>;
      case 'khatma':
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-primary/10 text-primary">خاتمة</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-accent/10 text-accent">طالبة احتياج</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-secondary-light/30 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-muted" size={18} />
          <input
            type="text"
            placeholder="بحث بالاسم، البريد، أو المدينة..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-4 pr-11 py-2.5 rounded-full border border-secondary-light/40 bg-background/50 text-sm font-medium text-primary focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-primary-muted" />
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 rounded-full border border-secondary-light/40 bg-background/50 text-sm font-bold text-primary focus:outline-none focus:border-primary"
            >
              <option value="">جميع الأدوار</option>
              <option value="khatma">الخاتمات</option>
              <option value="seeker">طالبات الاحتياج</option>
              <option value="admin">المشرفات</option>
            </select>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-xs font-black hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            إضافة مستخدم جديد
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-secondary-light/30">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-primary">سجل مستخدمي المنصة</h2>
          {data && (
            <span className="text-xs font-black text-primary-muted bg-background px-3 py-1.5 rounded-full">
              إجمالي المستخدمين: {data.total}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-primary-muted font-bold text-sm">جاري تحميل المستخدمين...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 text-red-600 p-8 rounded-[2rem] text-center flex flex-col items-center">
            <AlertCircle size={40} className="mb-2" />
            <p className="font-bold text-sm">{error}</p>
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="text-center py-16 text-primary-muted font-bold">
            لا يوجد مستخدمين مطابقين للبحث.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-background text-primary-muted text-xs font-black">
                  <th className="pb-4 pr-4">المعرف</th>
                  <th className="pb-4">الاسم</th>
                  <th className="pb-4">البريد الإلكتروني</th>
                  <th className="pb-4">الدور</th>
                  <th className="pb-4">المدينة</th>
                  <th className="pb-4">النشاط</th>
                  <th className="pb-4 pl-4 text-left">تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-background">
                {data.data.map((u) => (
                  <tr key={u.id} className="group hover:bg-background/30 transition-colors">
                    <td className="py-5 font-black text-primary pr-4">#{u.id}</td>
                    <td className="py-5 font-bold text-primary">
                      {u.display_name || u.name}
                      {u.display_name && u.display_name !== u.name && (
                        <div className="text-xs text-primary-muted font-normal">({u.name})</div>
                      )}
                    </td>
                    <td className="py-5 text-primary-muted font-medium">{u.email}</td>
                    <td className="py-5">{getRoleBadge(u.role)}</td>
                    <td className="py-5 text-primary-muted font-medium">
                      <div>{u.city || 'الرياض'}</div>
                      {(u as any).neighborhood && (
                        <div className="text-[11px] text-primary-muted/70">{(u as any).neighborhood}</div>
                      )}
                    </td>
                    <td className="py-5">
                      <div className="flex gap-2 text-xs font-bold text-primary-muted">
                        {u.role === 'khatma' && (
                          <span className="px-2 py-0.5 rounded-md bg-background">
                            {(u as any).khatmas_count || 0} ختمة
                          </span>
                        )}
                        {u.role === 'seeker' && (
                          <span className="px-2 py-0.5 rounded-md bg-background">
                            {(u as any).seeker_needs_count || 0} طلب
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-5 pl-4 text-left text-primary-muted font-medium text-xs">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('ar-SA') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {data.last_page > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-background">
                <p className="text-xs font-bold text-primary-muted">
                  صفحة {data.current_page} من {data.last_page}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={data.current_page <= 1}
                    className="p-2 rounded-xl border border-secondary-light/40 disabled:opacity-40 hover:bg-background transition-colors cursor-pointer"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(data.last_page, p + 1))}
                    disabled={data.current_page >= data.last_page}
                    className="p-2 rounded-xl border border-secondary-light/40 disabled:opacity-40 hover:bg-background transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadUsers();
          }}
        />
      )}
    </div>
  );
}

