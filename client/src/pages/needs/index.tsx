'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/ui/AppShell';
import Button from '@/components/ui/Button';
import Hero from '@/components/ui/Hero';
import { getNeeds, Need } from '@/services/api';
import { Plus, MapPin, ChevronLeft, HelpCircle } from 'lucide-react';

import Link from 'next/link';

export default function CommunityNeeds() {
  const [needs, setNeeds] = useState<Need[]>([]);

  useEffect(() => {
    getNeeds().then(data => setNeeds(data)).catch(console.error);
  }, []);

  const needsHero = (
    <Hero
      title="طلبات تحتاج أثركِ"
      subtitle="اكتشفي الطلبات المجتمعية التي تنتظر دعمك وشاركي في صناعة أثر حقيقي يدوم."
      variant="accent"
      actions={
        <Link href="/needs/register">
          <Button className="bg-accent hover:bg-[#0e3522] text-white rounded-2xl px-8 py-4 text-sm font-black flex items-center justify-center gap-2 shadow-xl shadow-accent/10 active:scale-95 transition-all w-full md:w-auto">
            <Plus size={18} /> أضيفي احتياجاً
          </Button>
        </Link>
      }
      graphic={
        <div className="w-48 h-48 rounded-full bg-accent/5 flex items-center justify-center text-accent/20">
          <HelpCircle size={120} />
        </div>
      }
    />
  );

  return (
    <AppShell hero={needsHero}>
      <div className="space-y-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between px-2">
          <div className="text-right">
            <h2 className="text-2xl font-black text-primary">طلبات المحتاجين</h2>
            <p className="text-sm text-gray-500 font-medium">مبادرات منتقاة لتقديم عطاء ملموس للمجتمع.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {needs.length > 0 ? needs.map((need) => (
            <div key={need.id} className="group rounded-[32px] md:rounded-[40px] border border-secondary-light/30 bg-white p-6 md:p-8 shadow-sm transition-all hover:shadow-md">
              <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between">
                <div className="flex items-start gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-background text-accent shadow-sm text-2xl group-hover:scale-110 transition-transform">
                    {need.gift?.icon === 'book-open' ? '📖' : <MapPin size={24} />}
                  </div>
                  <div className="text-right">
                    <h3 className="text-lg font-black text-gray-800">{need.gift?.name || 'طلب مساعدة'}</h3>
                    <p className="text-gray-500 text-sm font-medium mt-1 leading-relaxed line-clamp-2">{need.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-bold mt-3">
                      <MapPin size={12} className="text-secondary" />
                      <span>{need.city || 'الرياض'}</span>
                      <span className="mx-1 opacity-50">•</span>
                      <span>منذ {need.created_at_human || 'قليل'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button className="flex-1 md:flex-none bg-accent hover:bg-[#0e3522] text-white rounded-2xl px-6 py-3.5 text-xs font-black shadow-lg shadow-accent/10 transition-all active:scale-95">
                    تقديم العطاء
                  </Button>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full rounded-[40px] border border-dashed border-secondary-light bg-white p-16 text-center shadow-sm">
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus size={24} className="text-secondary-muted" />
              </div>
              <p className="text-gray-400 font-bold text-lg">لا توجد طلبات احتياج حالياً..</p>
              <p className="text-secondary-muted text-sm mt-1">كوني أنتِ المبادرة الأولى في صناعة الأثر!</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
