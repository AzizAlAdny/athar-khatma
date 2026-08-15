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

interface ProfileProps {
  data: {
    user: { name: string; bio: string; city: string };
    impact_score: number;
    achievements: Achievement[];
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
           <div className="px-6 py-3 bg-secondary/10 rounded-2xl border border-secondary/20">
              <p className="text-[10px] text-secondary font-black uppercase tracking-wider">نقاط الأثر</p>
              <p className="text-2xl font-black text-secondary">{data.impact_score}</p>
           </div>
           <div className="px-6 py-3 bg-primary/5 rounded-2xl border border-primary/10">
              <p className="text-[10px] text-primary font-black uppercase tracking-wider">المبادرات</p>
              <p className="text-2xl font-black text-primary">{data.achievements.length}</p>
           </div>
        </div>
      </div>

      {/* Achievement List */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-background pb-4">
           <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
              <Award size={20} />
           </div>
           <h4 className="font-black text-xl text-primary">سجل العطاء والأثر</h4>
        </div>

        <div className="space-y-4">
          {data.achievements.length > 0 ? (
            data.achievements.map((ach, idx) => (
              <div key={idx} className="group bg-white p-5 rounded-[2rem] border border-secondary-light/30 shadow-sm hover:shadow-md hover:border-secondary/30 transition-all duration-300">
                <div className="flex justify-between items-start mb-3">
                  <span className="px-3 py-1 bg-background text-primary-muted text-[10px] font-black rounded-full border border-secondary-light/20 uppercase tracking-tight">
                    {ach.category}
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
