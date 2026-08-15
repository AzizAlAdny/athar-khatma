import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle, Trash2, Eye } from 'lucide-react';
import { getUserKhatmas, deleteKhatma, type KhatmaProfile } from '@/services/api';

export default function KhatmaManagement() {
  const [khatmas, setKhatmas] = useState<KhatmaProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadKhatmas();
  }, []);

  const loadKhatmas = async () => {
    setLoading(true);
    try {
      const data = await getUserKhatmas();
      setKhatmas(data.khatmas);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Khatmas fetch error:', err);
      }
      setError('تعذر تحميل الختمات.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنتِ متأكدة من حذف هذه الختمة؟')) return;

    try {
      await deleteKhatma(id);
      loadKhatmas();
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Delete error:', err);
      }
      alert('فشل حذف الختمة');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-primary-muted font-bold">جاري تحميل الختمات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 text-red-600 p-8 rounded-[2.5rem] text-center flex flex-col items-center">
        <AlertCircle size={48} className="mb-4" />
        <h3 className="text-xl font-black text-primary mb-2">عذراً، حدث خطأ</h3>
        <p className="text-primary-muted font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-secondary-light/30">
      <h2 className="text-2xl font-black text-primary mb-6">إدارة الختمات</h2>

      {khatmas.length === 0 ? (
        <div className="text-center py-20 text-primary-muted font-bold">
          لا توجد ختمات حالياً.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-background text-primary-muted text-sm">
                <th className="pb-5 font-black pr-4 text-right">المعرف</th>
                <th className="pb-5 font-black text-right">المستخدم</th>
                <th className="pb-5 font-black text-right">تاريخ الإتمام</th>
                <th className="pb-5 font-black text-right">النوع</th>
                <th className="pb-5 font-black text-right">نقاط الأثر</th>
                <th className="pb-5 font-black text-right">الحالة</th>
                <th className="pb-5 font-black text-right pr-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-background">
              {khatmas.map((khatma) => (
                <tr key={khatma.id} className="group hover:bg-background/30 transition-colors">
                  <td className="py-6 font-black text-primary pr-4">#{khatma.id}</td>
                  <td className="py-6 text-primary-muted font-semibold">{khatma.user?.name || '-'}</td>
                  <td className="py-6 text-primary-muted font-semibold">
                    {khatma.completion_date ? new Date(khatma.completion_date).toLocaleDateString('ar-SA') : '-'}
                  </td>
                  <td className="py-6 text-primary-muted font-semibold">{khatma.type || '-'}</td>
                  <td className="py-6 font-black text-accent">{khatma.impact_score || 0}</td>
                  <td className="py-6">
                    <span className="px-4 py-1.5 rounded-full text-xs font-black bg-primary/10 text-primary">
                      {khatma.status || 'نشط'}
                    </span>
                  </td>
                  <td className="py-6 pr-4">
                    <div className="flex gap-2">
                      <button className="text-secondary font-black hover:underline cursor-pointer flex items-center gap-1">
                        <Eye size={16} />
                        عرض
                      </button>
                      <button
                        onClick={() => handleDelete(khatma.id)}
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
