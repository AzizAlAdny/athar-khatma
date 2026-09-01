'use client';

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/ui/AppShell';
import AtharProfile from '@/components/ui/AtharProfile';
import Hero from '@/components/ui/Hero';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { getKhatmaProfile, KhatmaProfile, authUserKey, updateUserProfile, getUserReviews, Review } from '@/services/api';
import { CITY_DATA } from '@/constants/locations';
import { User, ArrowLeft, Check, X, MapPin, Edit3 } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
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

  const fetchProfile = React.useCallback(() => {
    const storedUserStr = typeof window !== 'undefined' ? localStorage.getItem(authUserKey) : null;
    if (storedUserStr) {
      const storedUser = JSON.parse(storedUserStr);
      const userId = storedUser.id || 1;

      getKhatmaProfile(userId)
        .then(async data => {
          setProfile(data);
          setEditName(data.user.name || '');
          setEditDisplayName(storedUser.display_name || '');
          setEditBio(data.user.bio || '');
          setEditCity(data.user.city || 'الرياض');
          setEditNeighborhood(storedUser.neighborhood || '');

          if (storedUser.role === 'khatma') {
            try {
              const revs = await getUserReviews(userId);
              setReviewsData(revs);
            } catch (e) {
              console.error('Reviews fetch error:', e);
            }
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
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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

      // Update AuthContext state (this also updates localStorage)
      updateUser(res.user);

      // Update local page profile state
      if (profile) {
        setProfile({
          ...profile,
          user: {
            ...profile.user,
            name: res.user.display_name || res.user.name,
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
      title={user?.role === 'seeker' ? "ملفي الشخصي" : user?.role === 'admin' ? "الملف الشخصي للمشرفة" : "ملفكِ الشخصي"}
      subtitle={user?.role === 'seeker' ? "تابعي طلباتكِ وتواصلكِ في مجتمع الأثر." : user?.role === 'admin' ? "إدارة وتعديل بيانات الحساب الإشرافي." : "تابعي إنجازاتكِ، وأديري مساهماتكِ في صناعة الأثر."}
      variant="primary"
      actions={
        <div className="flex flex-wrap gap-4">
          <Link
            href={user?.role === 'admin' ? "/admin" : "/dashboard"}
            className="bg-white text-primary border border-secondary-light/30 px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-background transition-all shadow-sm active:scale-95"
          >
             <ArrowLeft size={18} /> {user?.role === 'admin' ? "العودة للوحة الإدارة" : "العودة للوحة التحكم"}
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
               <Link href={user?.role === 'admin' ? "/admin" : "/dashboard"} className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm">العودة للرئيسية</Link>
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
                       user: { ...profile.user, role: user?.role },
                       impact_score: profile.impact_score || 0,
                       achievements: (profile.achievements || []) as any,
                       reviews: reviewsData?.reviews,
                       average_rating: reviewsData?.average_rating,
                       needs: (profile.needs || []) as any
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
