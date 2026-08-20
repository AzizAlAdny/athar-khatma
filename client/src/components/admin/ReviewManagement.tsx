import React, { useEffect, useState, useCallback } from 'react';
import { Loader2, AlertCircle, Trash2, Star, Search, Filter, ChevronLeft, ChevronRight, MessageSquare, ShieldAlert } from 'lucide-react';
import { getAdminReviews, deleteAdminReview, type AdminReview, type PaginatedResponse } from '@/services/api';

export default function ReviewManagement() {
  const [data, setData] = useState<PaginatedResponse<AdminReview> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [rating, setRating] = useState<string>('');
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminReviews({
        page,
        search: search.trim() || undefined,
        rating: rating ? parseInt(rating, 10) : undefined,
        per_page: 10,
      });
      setData(response);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Reviews fetch error:', err);
      }
      setError('تعذر تحميل التقييمات.');
    } finally {
      setLoading(false);
    }
  }, [page, search, rating]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadReviews();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadReviews]);

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنتِ متأكدة من رغبتك في حذف هذا التقييم؟ سيتم إعادة احتساب نقاط الأثر تلقائياً.')) return;

    setDeletingId(id);
    try {
      await deleteAdminReview(id);
      loadReviews();
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Delete review error:', err);
      }
      alert('فشل حذف التقييم.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Bar: Search & Rating Filter */}
      <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-secondary-light/30 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-muted" size={18} />
          <input
            type="text"
            placeholder="بحث بالتعليق أو اسم المقيّمة..."
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
            value={rating}
            onChange={(e) => {
              setRating(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-auto px-4 py-2.5 rounded-full border border-secondary-light/40 bg-background/50 text-sm font-bold text-primary focus:outline-none focus:border-primary"
          >
            <option value="">جميع التقييمات</option>
            <option value="5">5 نجوم ⭐⭐⭐⭐⭐</option>
            <option value="4">4 نجوم ⭐⭐⭐⭐</option>
            <option value="3">3 نجوم ⭐⭐⭐</option>
            <option value="2">نجمتان ⭐⭐</option>
            <option value="1">نجمة واحدة ⭐</option>
          </select>
        </div>
      </div>

      {/* Main Table / Review Cards */}
      <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-secondary-light/30">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-primary">مراجعة تقييمات المجتمع</h2>
          {data && (
            <span className="text-xs font-black text-primary-muted bg-background px-3 py-1.5 rounded-full">
              إجمالي التقييمات: {data.total}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-primary-muted font-bold text-sm">جاري تحميل التقييمات...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 text-red-600 p-8 rounded-[2rem] text-center flex flex-col items-center">
            <AlertCircle size={40} className="mb-2" />
            <p className="font-bold text-sm">{error}</p>
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="text-center py-16 text-primary-muted font-bold">
            لا توجد تقييمات مطابقة للبحث.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-background text-primary-muted text-xs font-black">
                  <th className="pb-4 pr-4">المعرف</th>
                  <th className="pb-4">المقيّمة</th>
                  <th className="pb-4">المقيَّم</th>
                  <th className="pb-4">التقييم</th>
                  <th className="pb-4">التعليق</th>
                  <th className="pb-4">التاريخ</th>
                  <th className="pb-4 pl-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-background">
                {data.data.map((review) => (
                  <tr key={review.id} className="group hover:bg-background/30 transition-colors">
                    <td className="py-5 font-black text-primary pr-4">#{review.id}</td>
                    <td className="py-5 font-bold text-primary">
                      {review.reviewer?.display_name || review.reviewer?.name || `مستخدم #${review.reviewer_id}`}
                      <div className="text-xs text-primary-muted font-normal">{review.reviewer?.email}</div>
                    </td>
                    <td className="py-5 font-bold text-primary">
                      {review.reviewee?.display_name || review.reviewee?.name || `مستخدم #${review.reviewee_id}`}
                      <div className="text-xs text-primary-muted font-normal">{review.reviewee?.email}</div>
                    </td>
                    <td className="py-5">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < review.rating ? 'text-secondary fill-secondary' : 'text-gray-300'}
                          />
                        ))}
                        <span className="text-xs font-black text-primary mr-1">({review.rating})</span>
                      </div>
                    </td>
                    <td className="py-5 text-primary-muted font-medium max-w-sm">
                      {review.comment ? (
                        <p className="line-clamp-2 text-xs">{review.comment}</p>
                      ) : (
                        <span className="text-xs text-primary-muted italic">بدون تعليق مكتوب</span>
                      )}
                    </td>
                    <td className="py-5 text-primary-muted font-medium text-xs">
                      {review.created_at ? new Date(review.created_at).toLocaleDateString('ar-SA') : '-'}
                    </td>
                    <td className="py-5 pl-4 text-left">
                      <button
                        onClick={() => handleDelete(review.id)}
                        disabled={deletingId === review.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                        title="حذف التقييم المخالف"
                      >
                        {deletingId === review.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                      </button>
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
    </div>
  );
}
