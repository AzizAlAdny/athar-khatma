'use client';

import React from 'react';
import { X as XIcon, Award, MapPin, Star, User } from 'lucide-react';

interface Achievement {
  gift_name: string;
  category: string;
  status: string;
  description: string;
  date: string;
}

interface Review {
  id: number;
  rating: number;
  comment?: string;
  created_at?: string;
  reviewer?: {
    name: string;
    display_name?: string;
  };
}

interface Need {
  gift_name: string;
  status: string;
  date: string;
}

interface ProfileProps {
  data: {
    user: { name: string; bio: string; city: string; role?: string };
    impact_score?: number;
    achievements?: Achievement[];
    reviews?: Review[];
    average_rating?: number;
    needs?: Need[];
  };
  onClose?: () => void;
  isPage?: boolean;
}

const AtharProfile = ({ data, onClose, isPage = false }: ProfileProps) => {
  const containerClasses = isPage
    ? "w-full max-w-4xl mx-auto"
    : "fixed inset-y-0 right-0 w-full md:w-[450px] bg-white shadow-2xl z-[1000] p-8 overflow-y-auto transform transition-transform duration-500 ease-out border-l border-secondary-light/30";

  const Content = (
    <div className="space-y-10">
      {/* Header Info */}
      <div className="text-center relative">
        {!isPage && onClose && (
          <button onClick={onClose} className="absolute right-0 top-0 p-2 text-primary-muted hover:text-primary transition-colors">
            <XIcon size={24} />
          </button>
        )}

        <div className="relative inline-block">
          <div className="w-28 h-28 bg-background border-4 border-white shadow-xl rounded-[2.5rem] mx-auto flex items-center justify-center text-4xl font-black text-primary overflow-hidden">
             <User size={56} />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-secondary rounded-2xl flex items-center justify-center text-white shadow-lg border-4 border-white">
             <Star size={18} fill="currentColor" />
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <h3 className="text-3xl font-black text-primary tracking-tight">{data.user.name}</h3>
          <div className="flex items-center justify-center gap-2 text-primary-muted font-bold">
             <MapPin size={16} className="text-secondary" />
             <span>{data.user.city}</span>
          </div>
          <p className="text-sm text-primary-muted/80 max-w-xs mx-auto leading-relaxed">
            {data.user.bio || "صانعة أثر ومحبة للخير، تسعى لترك بصمة في مجتمعها من خلال ختمات القرآن الكريم."}
          </p>
        </div>

        <div className="mt-8 flex justify-center gap-4">
           {data.user.role !== 'seeker' && (
             <>
               <div className="px-6 py-3 bg-secondary/10 rounded-2xl border border-secondary/20">
                  <p className="text-[10px] text-secondary font-black uppercase tracking-wider">نقاط الأثر</p>
                  <p className="text-2xl font-black text-secondary">{data.impact_score || 0}</p>
               </div>
               {data.average_rating !== undefined && (
                  <div className="px-6 py-3 bg-yellow-50 rounded-2xl border border-yellow-200">
                    <p className="text-[10px] text-yellow-600 font-black uppercase tracking-wider">التقييم</p>
                    <div className="flex items-center gap-1 justify-center">
                      <span className="text-2xl font-black text-yellow-600">{data.average_rating}</span>
                      <Star size={18} className="text-yellow-400 fill-yellow-400" />
                    </div>
                  </div>
               )}
               <div className="px-6 py-3 bg-primary/5 rounded-2xl border border-primary/10">
                  <p className="text-[10px] text-primary font-black uppercase tracking-wider">المبادرات</p>
                  <p className="text-2xl font-black text-primary">{data.achievements?.length || 0}</p>
               </div>
             </>
           )}
           {data.user.role === 'seeker' && (
             <div className="px-6 py-3 bg-accent/5 rounded-2xl border border-accent/10">
                <p className="text-[10px] text-accent font-black uppercase tracking-wider">الطلبات المسجلة</p>
                <p className="text-2xl font-black text-accent">{data.needs?.length || 0}</p>
             </div>
           )}
        </div>
      </div>

      {/* Reviews Section - Only for Khatma */}
      {data.user.role !== 'seeker' && data.reviews && data.reviews.length > 0 && (
        <div className="space-y-6 mt-12">
          <div className="flex items-center gap-3 border-b border-background pb-4">
             <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-500">
                <Star size={20} fill="currentColor" />
             </div>
             <h4 className="font-black text-xl text-primary">تقييمات صانعات الأثر</h4>
          </div>

          <div className="space-y-4">
            {data.reviews.map((review, idx) => (
              <div key={idx} className="bg-background/30 p-5 rounded-[1.5rem] border border-secondary-light/10">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} fill={s <= review.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <span className="text-xs font-black text-primary">
                      {review.reviewer?.display_name || review.reviewer?.name || 'مستخدمة'}
                    </span>
                  </div>
                  <span className="text-[9px] text-primary-muted font-bold">
                    {review.created_at ? new Date(review.created_at).toLocaleDateString('ar-SA') : ''}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-primary-muted font-medium italic">"{review.comment}"</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievement List - For Khatma */}
      {data.user.role !== 'seeker' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-background pb-4">
             <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                <Award size={20} />
             </div>
             <h4 className="font-black text-xl text-primary">سجل العطاء والأثر</h4>
          </div>

          <div className="space-y-4">
            {data.achievements && data.achievements.length > 0 ? (
              data.achievements.map((ach, idx) => (
                <div key={idx} className="group bg-white p-5 rounded-[2rem] border border-secondary-light/30 shadow-sm hover:shadow-md hover:border-secondary/30 transition-all duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-3 py-1 text-[10px] font-black rounded-full border uppercase tracking-tight ${
                      ach.status === 'delivered' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-background text-primary-muted border-secondary-light/20'
                    }`}>
                      {ach.category} • {ach.status === 'delivered' ? 'تم التسليم' : 'متوفر'}
                    </span>
                    <span className="text-[10px] text-primary-muted/60 font-bold">{ach.date}</span>
                  </div>
                  <h5 className="font-black text-primary text-lg group-hover:text-secondary transition-colors">{ach.gift_name}</h5>
                  <p className="text-sm text-primary-muted font-medium mt-2 leading-relaxed line-clamp-2">{ach.description}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-10 px-6 bg-background/50 rounded-[2rem] border border-dashed border-secondary-light/40">
                 <p className="text-primary-muted font-bold">لا توجد إنجازات مسجلة بعد.</p>
                 <p className="text-xs text-primary-muted/60 mt-1">ابدئي رحلة أثرك اليوم!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Needs List - For Seeker */}
      {data.user.role === 'seeker' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-background pb-4">
             <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <MapPin size={20} />
             </div>
             <h4 className="font-black text-xl text-primary">طلباتي السابقة</h4>
          </div>

          <div className="space-y-4">
            {data.needs && data.needs.length > 0 ? (
              data.needs.map((need, idx) => (
                <div key={idx} className="group bg-white p-5 rounded-[2rem] border border-secondary-light/30 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-3 py-1 text-[10px] font-black rounded-full border uppercase tracking-tight ${
                      need.status === 'fulfilled' ? 'bg-green-50 text-green-600 border-green-100' :
                      need.status === 'in_progress' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                      'bg-background text-primary-muted border-secondary-light/20'
                    }`}>
                      {need.status === 'fulfilled' ? 'مكتمل' : need.status === 'in_progress' ? 'قيد التنفيذ' : 'قيد الانتظار'}
                    </span>
                    <span className="text-[10px] text-primary-muted/60 font-bold">{need.date}</span>
                  </div>
                  <h5 className="font-black text-primary text-lg">{need.gift_name || 'طلب مساعدة'}</h5>
                </div>
              ))
            ) : (
              <div className="text-center py-10 px-6 bg-background/50 rounded-[2rem] border border-dashed border-secondary-light/40">
                 <p className="text-primary-muted font-bold">لا توجد طلبات مسجلة بعد.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (isPage) return <div className={containerClasses}>{Content}</div>;

  return (
    <div className={containerClasses}>
      {Content}
    </div>
  );
};

export default AtharProfile;
