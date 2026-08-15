import React, { useEffect, useState } from 'react';
import AppShell from '@/components/ui/AppShell';
import Hero from '@/components/ui/Hero';
import { BarChart3, AlertCircle, Loader2, Users, FileText, Trash2, Shield, Edit, Plus } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getAdminStats, getAdminUsers, updateUserRole, deleteKhatma, deleteNeed, getNeeds, getUserKhatmas, type AdminStats, type User } from '@/services/api';
import KhatmaManagement from '@/components/admin/KhatmaManagement';
import NeedManagement from '@/components/admin/NeedManagement';

type AdminTab = 'overview' | 'users' | 'content';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'overview') {
        const data = await getAdminStats();
        setStats(data);
      } else if (activeTab === 'users') {
        const data = await getAdminUsers();
        setUsers(data.data);
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Admin data fetch error:', err);
      }
      setError('تعذر تحميل البيانات.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      loadData();
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Role update error:', err);
      }
      alert('فشل تحديث الدور');
    }
  };

  const adminHero = (
    <Hero
      title="لوحة التحكم الإدارية"
      subtitle="تابعي الأداء، وافحصي المبادرات، واديري الأثر المجتمعي بسهولة."
      variant="simple"
      graphic={
        <div className="w-48 h-48 rounded-full bg-primary/5 flex items-center justify-center text-primary/10">
          <BarChart3 size={120} />
        </div>
      }
    />
  );

  const tabs = [
    { id: 'overview' as AdminTab, label: 'نظرة عامة', icon: BarChart3 },
    { id: 'users' as AdminTab, label: 'إدارة المستخدمين', icon: Users },
    { id: 'content' as AdminTab, label: 'المحتوى', icon: FileText },
  ];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AppShell hero={adminHero}>
        <div className="space-y-8 pb-20">
          {/* Navigation Tabs */}
          <div className="flex gap-2 bg-white rounded-[2rem] p-2 shadow-sm border border-secondary-light/30">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-[1.5rem] text-sm font-black transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-md'
                    : 'text-primary-muted hover:bg-background'
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-primary-muted font-bold">جاري تحميل البيانات...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-100 text-red-600 p-8 rounded-[2.5rem] text-center flex flex-col items-center">
              <AlertCircle size={48} className="mb-4" />
              <h3 className="text-xl font-black text-primary mb-2">عذراً، حدث خطأ</h3>
              <p className="text-primary-muted font-medium">{error}</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && stats && (
                <OverviewTab stats={stats} />
              )}
              {activeTab === 'users' && (
                <UsersTab users={users} onRoleChange={handleRoleChange} />
              )}
              {activeTab === 'content' && (
                <ContentTab />
              )}
            </>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

function OverviewTab({ stats }: { stats: AdminStats }) {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-4">
        {[
          { label: 'إجمالي المستخدمين', value: stats.total_users, color: 'text-primary', icon: Users },
          { label: 'إجمالي الختمات', value: stats.total_khatmas, color: 'text-accent', icon: FileText },
          { label: 'طلبات بانتظار المراجعة', value: stats.pending_needs, color: 'text-secondary', icon: AlertCircle },
          { label: 'نقاط الأثر الكلية', value: stats.total_impact_points.toLocaleString(), color: 'text-primary', icon: Shield },
        ].map((item) => (
          <div key={item.label} className="rounded-[2rem] bg-white p-8 shadow-sm border border-secondary-light/30 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <item.icon size={24} className={item.color} />
              <p className="text-sm font-bold text-primary-muted">{item.label}</p>
            </div>
            <p className={`text-4xl font-black ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-secondary-light/30">
          <h3 className="text-xl font-black text-primary mb-6">توزيع المستخدمين</h3>
          <div className="space-y-4">
            {[
              { label: 'الخاتمات', value: stats.khatma_users, color: 'bg-primary' },
              { label: 'الطالبات', value: stats.seeker_users, color: 'bg-accent' },
              { label: 'المشرفات', value: stats.admin_users, color: 'bg-secondary' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-primary">{item.label}</span>
                  <span className="font-black text-primary">{item.value}</span>
                </div>
                <div className="h-3 bg-background rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} transition-all duration-500`}
                    style={{ width: `${(item.value / stats.total_users) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-secondary-light/30">
          <h3 className="text-xl font-black text-primary mb-6">إحصائيات المحتوى</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-background rounded-xl">
              <span className="font-bold text-primary">الختمات النشطة</span>
              <span className="text-2xl font-black text-accent">{stats.active_khatmas}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-background rounded-xl">
              <span className="font-bold text-primary">إجمالي الطلبات</span>
              <span className="text-2xl font-black text-secondary">{stats.total_needs}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-background rounded-xl">
              <span className="font-bold text-primary">الأنواع المتاحة</span>
              <span className="text-2xl font-black text-primary">{stats.total_gifts}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersTab({ users, onRoleChange }: { users: User[]; onRoleChange: (id: number, role: string) => void }) {
  return (
    <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-secondary-light/30">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-primary">إدارة المستخدمين</h2>
        <button className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-[1.5rem] text-sm font-black hover:bg-primary/90 transition-colors">
          <Plus size={20} />
          إضافة مستخدم
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="border-b border-background text-primary-muted text-sm">
              <th className="pb-5 font-black pr-4 text-right">الاسم</th>
              <th className="pb-5 font-black text-right">البريد الإلكتروني</th>
              <th className="pb-5 font-black text-right">الدور</th>
              <th className="pb-5 font-black text-right">المدينة</th>
              <th className="pb-5 font-black text-right pr-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-background">
            {users.length > 0 ? users.map((user) => (
              <tr key={user.id} className="group hover:bg-background/30 transition-colors">
                <td className="py-6 font-black text-primary pr-4">{user.name}</td>
                <td className="py-6 text-primary-muted font-semibold">{user.email}</td>
                <td className="py-6">
                  <select
                    value={user.role}
                    onChange={(e) => onRoleChange(user.id, e.target.value)}
                    className="px-4 py-2 rounded-full text-xs font-black bg-background border border-secondary-light/30 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="khatma">خاتمة</option>
                    <option value="seeker">طالبة</option>
                    <option value="admin">مشرفة</option>
                  </select>
                </td>
                <td className="py-6 text-primary-muted font-semibold">{user.city || '-'}</td>
                <td className="py-6 pr-4">
                  <button className="text-secondary font-black hover:underline cursor-pointer flex items-center gap-1">
                    <Edit size={16} />
                    تعديل
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="py-20 text-center text-primary-muted font-bold">لا يوجد مستخدمين حالياً.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ContentTab() {
  const [contentType, setContentType] = useState<'khatmas' | 'needs'>('khatmas');

  return (
    <div className="space-y-8">
      <div className="flex gap-2 bg-white rounded-[2rem] p-2 shadow-sm border border-secondary-light/30 w-fit">
        <button
          onClick={() => setContentType('khatmas')}
          className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-sm font-black transition-all ${
            contentType === 'khatmas'
              ? 'bg-primary text-white shadow-md'
              : 'text-primary-muted hover:bg-background'
          }`}
        >
          <FileText size={20} />
          الختمات
        </button>
        <button
          onClick={() => setContentType('needs')}
          className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-sm font-black transition-all ${
            contentType === 'needs'
              ? 'bg-accent text-white shadow-md'
              : 'text-primary-muted hover:bg-background'
          }`}
        >
          <FileText size={20} />
          الطلبات
        </button>
      </div>

      {contentType === 'khatmas' && <KhatmaManagement />}
      {contentType === 'needs' && <NeedManagement />}
    </div>
  );
}
