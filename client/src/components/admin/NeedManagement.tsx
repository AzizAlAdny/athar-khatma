import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle, Trash2, Eye } from 'lucide-react';
import { getNeeds, deleteNeed, type Need } from '@/services/api';

export default function NeedManagement() {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNeeds();
  }, []);

  const loadNeeds = async () => {
    setLoading(true);
    try {
      const data = await getNeeds();
      setNeeds(data);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Needs fetch error:', err);
      }
      setError('تعذر تحميل الطلبات.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنتِ متأكدة من حذف هذا الطلب؟')) return;

    try {
      await deleteNeed(id);
      loadNeeds();
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Delete error:', err);
      }
      alert('فشل حذف الطلب');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-primary-muted font-bold">جاري تحميل الطلبات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 text-red-600 p-8 rounded-[2.5rem] text-center flex flex-col items-center">
        <AlertCircle size={48} className="mb-4" />
        <h3 className="text-xl font-black mb-2">عذراً، حدث خطأ</h3>
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-secondary-light/30">
      <h2 className="text-2xl font-black text-primary mb-6">إدارة الطلبات</h2>

      {needs.length === 0 ? (
        <div className="text-center py-20 text-primary-muted font-bold">
          لا توجد طلبات حالياً.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-background text-primary-muted text-sm">
                <th className="pb-5 font-black pr-4 text-right">المعرف</th>
                <th className="pb-5 font-black text-right">الهدية</th>
                <th className="pb-5 font-black text-right">الوصف</th>
                <th className="pb-5 font-black text-right">المدينة</th>
                <th className="pb-5 font-black text-right">تاريخ الإنشاء</th>
                <th className="pb-5 font-black text-right pr-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-background">
              {needs.map((need) => (
                <tr key={need.id} className="group hover:bg-background/30 transition-colors">
                  <td className="py-6 font-black text-primary pr-4">#{need.id}</td>
                  <td className="py-6 text-slate-600 font-semibold">{need.gift?.name || '-'}</td>
                  <td className="py-6 text-slate-600 font-semibold max-w-xs truncate">
                    {need.description || '-'}
                  </td>
                  <td className="py-6 text-slate-600 font-semibold">{need.city || '-'}</td>
                  <td className="py-6 text-slate-600 font-semibold">
                    {need.created_at_human || '-'}
                  </td>
                  <td className="py-6 pr-4">
                    <div className="flex gap-2">
                      <button className="text-secondary font-black hover:underline cursor-pointer flex items-center gap-1">
                        <Eye size={16} />
                        عرض
                      </button>
                      <button
                        onClick={() => handleDelete(need.id)}
                        className="text-red-600 font-black hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
