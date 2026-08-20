import React, { useEffect, useState, useCallback } from 'react';
import { Loader2, AlertCircle, Trash2, Eye, Search, Filter, ChevronLeft, ChevronRight, Gift, UserCheck } from 'lucide-react';
import { getAdminNeeds, deleteAdminNeed, type AdminNeed, type PaginatedResponse } from '@/services/api';

export default function NeedManagement() {
  const [data, setData] = useState<PaginatedResponse<AdminNeed> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [selectedNeed, setSelectedNeed] = useState<AdminNeed | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadNeeds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminNeeds({
        page,
        search: search.trim() || undefined,
        status: status || undefined,
        per_page: 10,
      });
      setData(response);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Needs fetch error:', err);
      }
      setError('تعذر تحميل قائمة طلبات الاحتياج.');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadNeeds();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadNeeds]);

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنتِ متأكدة من رغبتك في حذف هذا الطلب نهائياً؟')) return;

    setDeletingId(id);
    try {
      await deleteAdminNeed(id);
      if (selectedNeed?.id === id) {
        setSelectedNeed(null);
      }
      loadNeeds();
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Delete error:', err);
      }
      alert('فشل حذف الطلب.');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'fulfilled':
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-accent/10 text-accent">تم الإيفاء</span>;
      case 'in_progress':
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-secondary-light text-primary">قيد التنفيذ</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-primary/10 text-primary">مفتوح</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-secondary-light/30 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-muted" size={18} />
          <input
            type="text"
            placeholder="بحث بالوصف، الطالبة، أو المدينة..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-4 pr-11 py-2.5 rounded-full border border-secondary-light/40 bg-background/50 text-sm font-medium text-primary focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter size={18} className="text-primary-muted" />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-auto px-4 py-2.5 rounded-full border border-secondary-light/40 bg-background/50 text-sm font-bold text-primary focus:outline-none focus:border-primary"
          >
            <option value="">جميع الحالات</option>
            <option value="open">مفتوحة</option>
            <option value="in_progress">قيد التنفيذ</option>
            <option value="fulfilled">تم الإيفاء</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-secondary-light/30">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-primary">إدارة طلبات الاحتياج</h2>
          {data && (
            <span className="text-xs font-black text-primary-muted bg-background px-3 py-1.5 rounded-full">
              إجمالي الطلبات: {data.total}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-primary-muted font-bold text-sm">جاري تحميل الطلبات...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 text-red-600 p-8 rounded-[2rem] text-center flex flex-col items-center">
            <AlertCircle size={40} className="mb-2" />
            <p className="font-bold text-sm">{error}</p>
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="text-center py-16 text-primary-muted font-bold">
            لا توجد طلبات مطابقة لمعايير البحث.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-background text-primary-muted text-xs font-black">
                  <th className="pb-4 pr-4">المعرف</th>
                  <th className="pb-4">العطاء المطلوب</th>
                  <th className="pb-4">الطالبة</th>
                  <th className="pb-4">المدينة</th>
                  <th className="pb-4">الوصف</th>
                  <th className="pb-4">المنفذة</th>
                  <th className="pb-4">الحالة</th>
                  <th className="pb-4 pl-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-background">
                {data.data.map((need) => (
                  <tr key={need.id} className="group hover:bg-background/30 transition-colors">
                    <td className="py-5 font-black text-primary pr-4">#{need.id}</td>
                    <td className="py-5">
                      <span className="inline-flex items-center gap-1.5 font-bold text-primary">
                        <Gift size={14} className="text-secondary" />
                        {need.gift?.name || 'احتياج'}
                      </span>
                    </td>
                    <td className="py-5 font-bold text-primary">
                      {need.user?.display_name || need.user?.name || `مستخدم #${need.user_id}`}
                      <div className="text-xs text-primary-muted font-normal">{need.user?.email}</div>
                    </td>
                    <td className="py-5 text-primary-muted font-medium">{need.city || 'الرياض'}</td>
                    <td className="py-5 text-primary-muted font-medium max-w-xs truncate">
                      {need.description || '-'}
                    </td>
                    <td className="py-5">
                      {need.helper ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-accent">
                          <UserCheck size={14} />
                          {need.helper.display_name || need.helper.name}
                        </span>
                      ) : (
                        <span className="text-xs text-primary-muted font-normal">بانتظار مبادرة</span>
                      )}
                    </td>
                    <td className="py-5">{getStatusBadge(need.status)}</td>
                    <td className="py-5 pl-4 text-left">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedNeed(need)}
                          className="p-2 text-secondary hover:bg-secondary-light/30 rounded-xl transition-colors cursor-pointer"
                          title="عرض التفاصيل"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(need.id)}
                          disabled={deletingId === need.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                          title="حذف الطلب"
                        >
                          {deletingId === need.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        </button>
                      </div>
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

      {/* Details Modal */}
      {selectedNeed && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full space-y-6 shadow-2xl border border-secondary-light/40">
            <div className="flex justify-between items-center border-b border-background pb-4">
              <h3 className="text-xl font-black text-primary">تفاصيل طلب الاحتياج #{selectedNeed.id}</h3>
              <button
                onClick={() => setSelectedNeed(null)}
                className="text-primary-muted hover:text-primary font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between py-2 border-b border-background">
                <span className="text-primary-muted font-bold">العطاء المطلوب:</span>
                <span className="font-black text-primary">{selectedNeed.gift?.name || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-background">
                <span className="text-primary-muted font-bold">الطالبة:</span>
                <span className="font-black text-primary">{selectedNeed.user?.name || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-background">
                <span className="text-primary-muted font-bold">البريد الإلكتروني:</span>
                <span className="font-medium text-primary">{selectedNeed.user?.email || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-background">
                <span className="text-primary-muted font-bold">المدينة:</span>
                <span className="font-bold text-primary">{selectedNeed.city || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-background">
                <span className="text-primary-muted font-bold">الحالة:</span>
                <div>{getStatusBadge(selectedNeed.status)}</div>
              </div>
              {selectedNeed.helper && (
                <div className="flex justify-between py-2 border-b border-background">
                  <span className="text-primary-muted font-bold">الخاتمة المتكفلة:</span>
                  <span className="font-bold text-accent">{selectedNeed.helper.name}</span>
                </div>
              )}
              <div className="py-2">
                <p className="text-primary-muted font-bold mb-1">نص الطلب والاحتياج:</p>
                <p className="p-4 rounded-2xl bg-background/60 text-primary font-medium text-xs leading-relaxed">
                  {selectedNeed.description || 'لا يوجد وصف تفصيلي.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedNeed(null)}
              className="w-full py-3 rounded-full bg-primary text-white font-black text-sm cursor-pointer hover:bg-primary/90 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
