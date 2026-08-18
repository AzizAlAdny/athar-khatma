'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/ui/AppShell';
import AtharProfile from '@/components/ui/AtharProfile';
import Hero from '@/components/ui/Hero';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getKhatmaProfile, KhatmaProfile, authUserKey, updateUserProfile, saveAuthUser, getUserReviews, Review } from '@/services/api';
import { User, Settings, ArrowLeft, Check, X, MapPin, Edit3 } from 'lucide-react';
import Link from 'next/link';

interface Neighborhood {
  name: string;
  lat: number;
  lng: number;
}

const CITY_DATA: Record<string, Neighborhood[]> = {
    'الرياض': [
    { name: 'حي الملقى', lat: 24.8142, lng: 46.6111 },
    { name: 'حي حطين', lat: 24.7920, lng: 46.5970 },
    { name: 'حي القيروان', lat: 24.8210, lng: 46.5830 },
    { name: 'حي بنبان', lat: 24.8460, lng: 46.5610 },
    { name: 'حي العارض', lat: 24.8870, lng: 46.6270 },
    { name: 'حي الصحافة', lat: 24.8055, lng: 46.6375 },
    { name: 'حي الوادي', lat: 24.7930, lng: 46.6490 },
    { name: 'حي النفل', lat: 24.7860, lng: 46.6810 },
    { name: 'حي الياسمين', lat: 24.8217, lng: 46.6567 },
    { name: 'حي الربيع', lat: 24.7880, lng: 46.6830 },
    { name: 'حي الغدير', lat: 24.7740, lng: 46.6560 },
    { name: 'حي النرجس', lat: 24.8450, lng: 46.6800 },
    { name: 'حي المروج', lat: 24.7520, lng: 46.6580 },
    { name: 'حي الورود', lat: 24.7440, lng: 46.6750 },
    { name: 'حي الإزدهار', lat: 24.7680, lng: 46.6860 },
    { name: 'حي التعاون', lat: 24.7800, lng: 46.6290 },
    { name: 'حي النخيل', lat: 24.7450, lng: 46.6240 },
    { name: 'حي المصيف', lat: 24.7610, lng: 46.6280 },
    { name: 'حي الرحمانية', lat: 24.7330, lng: 46.6480 },
    { name: 'حي العليا', lat: 24.7136, lng: 46.6753 },
    { name: 'حي السليمانية', lat: 24.6940, lng: 46.6920 },
    { name: 'حي المعذر الشمالي', lat: 24.6540, lng: 46.6800 },
    { name: 'حي الملك عبدالعزيز', lat: 24.7010, lng: 46.7100 },
    { name: 'حي الملز', lat: 24.6680, lng: 46.7320 },
    { name: 'حي الروضة', lat: 24.7300, lng: 46.7700 },
    { name: 'حي الحمراء', lat: 24.7210, lng: 46.7540 },
    { name: 'حي غرناطة', lat: 24.7990, lng: 46.7770 },
    { name: 'حي قرطبة', lat: 24.7500, lng: 46.7960 },
    { name: 'حي اليرموك', lat: 24.8090, lng: 46.8050 },
    { name: 'حي الرمال', lat: 24.8510, lng: 46.8320 },
    { name: 'حي المونسية', lat: 24.7770, lng: 46.8260 },
    { name: 'حي القادسية', lat: 24.8020, lng: 46.8380 },
    { name: 'حي إشبيلية', lat: 24.7890, lng: 46.8420 },
    { name: 'حي عرقة', lat: 24.6940, lng: 46.5910 },
    { name: 'حي أم الحمام', lat: 24.6940, lng: 46.5540 },
    { name: 'حي لبن', lat: 24.6280, lng: 46.5450 },
    { name: 'حي ظهرة لبن', lat: 24.6220, lng: 46.5350 },
    { name: 'حي البديعة', lat: 24.6170, lng: 46.6310 },
    { name: 'حي السويدي', lat: 24.5960, lng: 46.6610 },
    { name: 'حي الشفا', lat: 24.5600, lng: 46.6660 },
    { name: 'حي بدر', lat: 24.5720, lng: 46.6970 },
    { name: 'حي العزيزية', lat: 24.5840, lng: 46.7570 },
    { name: 'حي الدار البيضاء', lat: 24.5450, lng: 46.7310 },
    { name: 'حي نمار', lat: 24.5860, lng: 46.5510 },
    { name: 'حي عريض', lat: 24.5750, lng: 46.6200 },
  ],
  'جدة': [
    { name: 'حي البلد', lat: 21.4833, lng: 39.1833 },
    { name: 'حي الحمراء', lat: 21.5282, lng: 39.1626 },
    { name: 'حي الشاطئ', lat: 21.6033, lng: 39.1166 },
    { name: 'حي الروضة', lat: 21.5732, lng: 39.1483 },
    { name: 'حي العزيزية', lat: 21.5499, lng: 39.1776 },
    { name: 'حي السلامة', lat: 21.5833, lng: 39.1500 },
    { name: 'حي المحيمدية', lat: 21.6167, lng: 39.1333 },
    { name: 'حي الفيصلية', lat: 21.5667, lng: 39.1833 },
    { name: 'حي أبحر الشمالية', lat: 21.7333, lng: 39.1167 },
    { name: 'حي المروة', lat: 21.6333, lng: 39.2000 },
  ],
  'الدمام': [
    { name: 'حي الشاطئ الشرقي', lat: 26.4731, lng: 50.1288 },
    { name: 'حي الريان', lat: 26.4180, lng: 50.1130 },
    { name: 'حي الفيصلية', lat: 26.3985, lng: 50.0760 },
    { name: 'حي الروضة', lat: 26.4420, lng: 50.0880 },
    { name: 'حي المزروعية', lat: 26.4520, lng: 50.1220 },
    { name: 'حي النور', lat: 26.4000, lng: 50.0333 },
    { name: 'حي الاتصالات', lat: 26.4167, lng: 50.0833 },
    { name: 'حي الزهور', lat: 26.4333, lng: 50.1167 },
    { name: 'حي الحمراء', lat: 26.4667, lng: 50.1000 },
    { name: 'حي المباركية', lat: 26.4500, lng: 50.1333 },
  ],
  'مكة المكرمة': [
    { name: 'حي أجياد', lat: 21.4179, lng: 39.8292 },
    { name: 'حي العزيزية', lat: 21.4166, lng: 39.8650 },
    { name: 'حي منى', lat: 21.4150, lng: 39.8930 },
    { name: 'حي المسفلة', lat: 21.4110, lng: 39.8230 },
    { name: 'حي الشبيكة', lat: 21.4210, lng: 39.8180 },
    { name: 'حي بطحاء قريش', lat: 21.3667, lng: 39.8333 },
    { name: 'حي الشرائع', lat: 21.4500, lng: 39.9500 },
    { name: 'حي النوارية', lat: 21.5500, lng: 39.7833 },
    { name: 'حي الرصيفة', lat: 21.4000, lng: 39.7833 },
    { name: 'حي الزايدي', lat: 21.3833, lng: 39.7333 },
  ],
  'المدينة المنورة': [
    { name: 'حي المنطقة المركزية', lat: 24.4686, lng: 39.6142 },
    { name: 'حي قباء', lat: 24.4392, lng: 39.6172 },
    { name: 'حي قربان', lat: 24.4536, lng: 39.6231 },
    { name: 'حي بضاعة', lat: 24.4727, lng: 39.6092 },
    { name: 'حي العيون', lat: 24.5200, lng: 39.5950 },
    { name: 'حي سيد الشهداء', lat: 24.4917, lng: 39.6125 },
    { name: 'حي العزيزية', lat: 24.4667, lng: 39.5333 },
    { name: 'حي الهجرة', lat: 24.4000, lng: 39.6167 },
    { name: 'حي الدويخلة', lat: 24.4833, lng: 39.6500 },
    { name: 'حي الخالدية', lat: 24.4500, lng: 39.6500 },
  ],
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<KhatmaProfile | null>(null);
  const [reviewsData, setReviewsData] = useState<{ reviews: Review[]; average_rating: number; total_reviews: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editNeighborhood, setEditNeighborhood] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem(authUserKey) : null;
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const userId = user.id || 1;

      getKhatmaProfile(userId)
        .then(async data => {
          setProfile(data);
          setEditName(data.user.name || '');
          setEditDisplayName(user.display_name || '');
          setEditBio(data.user.bio || '');
          setEditCity(data.user.city || 'الرياض');
          setEditNeighborhood(user.neighborhood || '');

          try {
            const revs = await getUserReviews(userId);
            setReviewsData(revs);
          } catch (e) {
            console.error('Reviews fetch error:', e);
          }

          setLoading(false);
        })
        .catch(err => {
          console.error('Profile fetch error:', err);
          setError('تعذر تحميل بيانات الملف الشخصي.');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    setUpdateError(null);
    try {
      const res = await updateUserProfile({
        name: editName,
        display_name: editDisplayName,
        bio: editBio,
        city: editCity,
        neighborhood: editNeighborhood
      });

      // Update local storage
      saveAuthUser(res.user);

      // Update local state
      if (profile) {
        setProfile({
          ...profile,
          user: {
            ...profile.user,
            name: res.user.name,
            bio: res.user.bio || '',
            city: res.user.city || ''
          }
        });
      }

      setIsEditing(false);
    } catch (err: any) {
      setUpdateError(err.message || 'فشل تحديث الملف الشخصي.');
    } finally {
      setIsUpdating(false);
    }
  };

  const profileHero = (
    <Hero
      title="ملفكِ الشخصي"
      subtitle="تابعي إنجازاتكِ، وأديري مساهماتكِ في صناعة الأثر."
      variant="primary"
      actions={
        <div className="flex flex-wrap gap-4">
          <Link href="/dashboard" className="bg-white text-primary border border-secondary-light/30 px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-background transition-all shadow-sm active:scale-95">
             <ArrowLeft size={18} /> العودة للوحة التحكم
          </Link>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-secondary text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-secondary-dark transition-all shadow-xl shadow-secondary/10 active:scale-95"
            >
              <Edit3 size={18} /> تعديل الملف الشخصي
            </button>
          )}
        </div>
      }
      graphic={
        <div className="w-48 h-48 rounded-full bg-primary/5 flex items-center justify-center text-primary/10">
          <User size={120} />
        </div>
      }
    />
  );

  return (
    <ProtectedRoute>
      <AppShell hero={profileHero}>
        <div className="pb-20">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
               <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
               <p className="text-primary-muted font-bold">جاري تحميل ملفكِ الشخصي...</p>
            </div>
          ) : error ? (
            <div className="max-w-md mx-auto text-center py-20 px-6 bg-white rounded-[2.5rem] shadow-sm border border-secondary-light/20">
               <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-black">!</span>
               </div>
               <h3 className="text-xl font-black text-primary mb-2">عذراً، حدث خطأ</h3>
               <p className="text-primary-muted font-medium mb-8">{error}</p>
               <Link href="/dashboard" className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm">العودة للرئيسية</Link>
            </div>
          ) : profile ? (
            <div className="space-y-8">
              {isEditing ? (
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(94,32,59,0.02)] border border-secondary-light/20 animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center">
                       <Edit3 size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-primary">تعديل بياناتكِ</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="الاسم الكامل"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      icon={User}
                      placeholder="اكتبي اسمكِ الكامل"
                    />
                    <Input
                      label="اسم العرض (اختياري)"
                      value={editDisplayName}
                      onChange={e => setEditDisplayName(e.target.value)}
                      icon={User}
                      placeholder="الاسم الذي سيظهر للآخرين"
                    />
                    <div className="md:col-span-2 space-y-2">
                       <label className="block text-sm font-black text-primary mr-1">النبذة التعريفية</label>
                       <textarea
                         value={editBio}
                         onChange={e => setEditBio(e.target.value)}
                         placeholder="اكتبي نبذة بسيطة عنكِ..."
                         className="w-full min-h-[120px] px-5 py-4 rounded-2xl border border-secondary-light/30 outline-none transition-all duration-200 text-primary font-semibold placeholder:text-primary-muted placeholder:font-normal bg-background/50 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary"
                       />
                    </div>
                    <Input
                      as="select"
                      label="المدينة"
                      value={editCity}
                      onChange={e => {
                        setEditCity(e.target.value);
                        setEditNeighborhood('');
                      }}
                      icon={MapPin}
                    >
                      {Object.keys(CITY_DATA).map(cityName => (
                        <option key={cityName} value={cityName}>{cityName}</option>
                      ))}
                    </Input>
                    <Input
                      as="select"
                      label="الحي السكني"
                      value={editNeighborhood}
                      onChange={e => setEditNeighborhood(e.target.value)}
                      icon={MapPin}
                    >
                      <option value="">اختر الحي السكني</option>
                      {CITY_DATA[editCity]?.map(n => (
                        <option key={n.name} value={n.name}>{n.name}</option>
                      ))}
                    </Input>
                  </div>

                  {updateError && (
                    <div className="mt-6 bg-red-50 text-red-600 text-xs font-bold p-4 rounded-2xl text-center border border-red-100">
                      {updateError}
                    </div>
                  )}

                  <div className="mt-10 flex gap-4">
                    <Button
                      onClick={handleUpdateProfile}
                      disabled={isUpdating}
                      className="flex-1 py-4 flex items-center justify-center gap-2"
                    >
                      {isUpdating ? 'جاري الحفظ...' : <><Check size={18} /> حفظ التغييرات</>}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setIsEditing(false)}
                      disabled={isUpdating}
                      className="flex-1 py-4 flex items-center justify-center gap-2 border border-secondary-light/30"
                    >
                      <X size={18} /> إلغاء
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(94,32,59,0.02)] border border-secondary-light/20">
                   <AtharProfile
                     data={{
                       user: profile.user,
                       impact_score: profile.impact_score || 0,
                       achievements: (profile.achievements || []) as any,
                       reviews: reviewsData?.reviews,
                       average_rating: reviewsData?.average_rating
                     }}
                     isPage
                   />
                </div>
              )}
            </div>
          ) : null}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
