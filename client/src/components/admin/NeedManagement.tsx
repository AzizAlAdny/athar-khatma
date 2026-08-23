import React, { useEffect, useState, useCallback } from 'react';
import { Loader2, AlertCircle, Trash2, Eye, Search, Filter, ChevronLeft, ChevronRight, Gift, UserCheck, CheckCircle2, Clock } from 'lucide-react';
import { getAdminNeeds, deleteAdminNeed, updateAdminNeedStatus, type AdminNeed, type PaginatedResponse } from '@/services/api';

export default function NeedManagement() {
  const [data, setData] = useState<PaginatedResponse<AdminNeed> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [selectedNeed, setSelectedNeed] = useState<AdminNeed | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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

  const handleStatusChange = async (id: number, newStatus: 'open' | 'in_progress' | 'fulfilled') => {
    setUpdatingId(id);
    try {
      const res = await updateAdminNeedStatus(id, newStatus);
      if (selectedNeed?.id === id) {
        setSelectedNeed((prev) => prev ? { ...prev, status: newStatus } : null);
      }
      loadNeeds();
    } catch (err: any) {
      alert(err.message || 'فشل تحديث حالة الطلب');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'fulfilled':
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-accent/10 text-accent inline-flex items-center gap-1"><CheckCircle2 size={12} /> تم الإيفاء</span>;
      case 'in_progress':
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-secondary/15 text-secondary inline-flex items-center gap-1"><Clock size={12} /> قيد التنفيذ</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-black bg-primary/10 text-primary inline-flex items-center gap-1"><Clock size={12} /> مفتوح</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="rounded-2xl sm:rounded-[2rem] bg-white p-4 sm:p-6 shadow-sm border border-secondary-light/30 flex flex-col md:flex-row gap-3 sm:gap-4 justify-between items-stretch md:items-center">
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
            className="w-full pl-4 pr-11 py-2.5 rounded-full border border-secondary-light/40 bg-background/50 text-xs sm:text-sm font-medium text-primary focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          <Filter size={18} className="text-primary-muted shrink-0" />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-auto px-4 py-2.5 rounded-full border border-secondary-light/40 bg-background/50 text-xs sm:text-sm font-bold text-primary focus:outline-none focus:border-primary"
          >
            <option value="">جميع الحالات</option>
            <option value="open">مفتوحة</option>
            <option value="in_progress">قيد التنفيذ</option>
            <option value="fulfilled">تم الإيفاء</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl sm:rounded-[2.5rem] bg-white p-4 sm:p-8 shadow-sm border border-secondary-light/30">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-primary">إدارة طلبات الاحتياج</h2>
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
          <div className="bg-red-50 border border-red-100 text-red-600 p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] text-center flex flex-col items-center">
            <AlertCircle size={40} className="mb-2" />
            <p className="font-bold text-sm">{error}</p>
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="text-center py-16 text-primary-muted font-bold">
            لا توجد طلبات مطابقة لمعايير البحث.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full text-right text-sm min-w-[750px]">
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
                    <td className="py-4 sm:py-5 font-black text-primary pr-4">#{need.id}</td>
                    <td className="py-4 sm:py-5">
                      <span className="inline-flex items-center gap-1.5 font-bold text-primary">
                        <Gift size={14} className="text-secondary shrink-0" />
                        <span>{need.gift?.name || 'احتياج'}</span>
                      </span>
                    </td>
                    <td className="py-4 sm:py-5 font-bold text-primary">
                      {need.user?.display_name || need.user?.name || `مستخدم #${need.user_id}`}
                      <div className="text-xs text-primary-muted font-normal">{need.user?.email}</div>
                    </td>
                    <td className="py-4 sm:py-5 text-primary-muted font-medium">{need.city || 'الرياض'}</td>
                    <td className="py-4 sm:py-5 text-primary-muted font-medium max-w-xs truncate">
                      {need.description || '-'}
                    </td>
                    <td className="py-4 sm:py-5">
                      {need.helper ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-accent whitespace-nowrap">
                          <UserCheck size={14} />
                          {need.helper.display_name || need.helper.name}
                        </span>
                      ) : (
                        <span className="text-xs text-primary-muted font-normal">بانتظار مبادرة</span>
                      )}
                    </td>
                    <td className="py-4 sm:py-5">
                      {need.status === 'open' ? (
                        getStatusBadge(need.status)
                      ) : (
                        <select
                          value={need.status}
                          onChange={(e) => handleStatusChange(need.id, e.target.value as any)}
                          disabled={updatingId === need.id}
                          className={`text-xs font-black px-3 py-1.5 rounded-full border cursor-pointer transition-colors focus:outline-none ${
                            need.status === 'fulfilled'
                              ? 'bg-accent/10 text-accent border-accent/30'
                              : 'bg-secondary/15 text-secondary border-secondary/30'
                          }`}
                        >
                          <option value="in_progress">قيد التنفيذ</option>
                          <option value="fulfilled">تم الإيفاء (مكتمل) ✨</option>
                        </select>
                      )}
                    </td>
                    <td className="py-4 sm:py-5 pl-4 text-left">
                      <div className="flex justify-end items-center gap-1.5 sm:gap-2">
                        <button
                          onClick={() => setSelectedNeed(need)}
                          className="p-2 text-secondary hover:bg-secondary-light/30 rounded-xl transition-colors cursor-pointer"
                          title="عرض وتعديل التفاصيل والحالة"
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
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 pt-4 border-t border-background">
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

      {/* Details & Status Edit Modal */}
      {selectedNeed && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 max-w-lg w-full space-y-5 sm:space-y-6 shadow-2xl border border-secondary-light/40 my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-background pb-3 sm:pb-4">
              <h3 className="text-lg sm:text-xl font-black text-primary">تفاصيل وإدارة الطلب #{selectedNeed.id}</h3>
              <button
                onClick={() => setSelectedNeed(null)}
                className="w-8 h-8 rounded-full bg-background hover:bg-secondary-light/40 flex items-center justify-center text-primary-muted hover:text-primary transition-colors cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
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
                <span className="font-medium text-primary break-all">{selectedNeed.user?.email || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-background">
                <span className="text-primary-muted font-bold">المدينة:</span>
                <span className="font-bold text-primary">{selectedNeed.city || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-background items-center">
                <span className="text-primary-muted font-bold">الحالة الحالية:</span>
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

              {/* Admin Status Changer Controls */}
              <div className="p-4 rounded-2xl bg-secondary/5 border border-secondary/20 space-y-2">
                <p className="text-xs font-black text-primary">تغيير حالة الطلب إدارياً:</p>
                {selectedNeed.status === 'open' ? (
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] font-bold text-blue-700">
                    الطلب مفتوح بانتظار استلامه من إحدى صانعات الأثر. لا يمكن تعديل حالته حتى يتم استلامه والبدء في تنفيذه.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleStatusChange(selectedNeed.id, 'in_progress')}
                      disabled={updatingId === selectedNeed.id || selectedNeed.status === 'in_progress'}
                      className={`py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        selectedNeed.status === 'in_progress'
                          ? 'bg-secondary text-white'
                          : 'bg-white border border-secondary-light/40 text-secondary hover:bg-background'
                      }`}
                    >
                      قيد التنفيذ
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedNeed.id, 'fulfilled')}
                      disabled={updatingId === selectedNeed.id || selectedNeed.status === 'fulfilled'}
                      className={`py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        selectedNeed.status === 'fulfilled'
                          ? 'bg-green-600 text-white'
                          : 'bg-white border border-green-200 text-green-700 hover:bg-green-50'
                      }`}
                    >
                      تم الإيفاء ✨
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedNeed(null)}
              className="w-full py-3 rounded-full bg-primary text-white font-black text-xs sm:text-sm cursor-pointer hover:bg-primary/90 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
