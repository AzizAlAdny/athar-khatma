import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Shield,
  HeartHandshake,
  BookOpen,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { createAdminUser } from '@/services/api';
import { CITY_DATA, CITIES, DEFAULT_CITY, getNeighborhoodCoordinates } from '@/constants/locations';

interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateUserModal({ onClose, onSuccess }: CreateUserModalProps) {
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'khatma' | 'seeker' | 'admin'>('khatma');
  const [city, setCity] = useState(DEFAULT_CITY);
  const [neighborhood, setNeighborhood] = useState(
    CITY_DATA[DEFAULT_CITY]?.[0]?.name || 'حي الملقى'
  );
  const [bio, setBio] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    const availableNeighborhoods = CITY_DATA[newCity] || [];
    if (availableNeighborhoods.length > 0) {
      setNeighborhood(availableNeighborhoods[0].name);
    } else {
      setNeighborhood('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const coords = getNeighborhoodCoordinates(city, neighborhood);

    try {
      await createAdminUser({
        name: name.trim(),
        display_name: displayName.trim() || undefined,
        email: email.trim(),
        password,
        role,
        city,
        neighborhood: neighborhood || undefined,
        latitude: coords.lat,
        longitude: coords.lng,
        bio: bio.trim() || undefined,
      });

      setSuccessMessage('تم إنشاء حساب المستخدم بنجاح وتفعيله مباشرة.');
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Create user error:', err);
      }
      setError(err?.message || 'فشل إنشاء المستخدم. يرجى مراجعة البيانات والتأكد من عدم تكرار البريد.');
      setSubmitting(false);
    }
  };

  const roleOptions: {
    id: 'khatma' | 'seeker' | 'admin';
    title: string;
    description: string;
    icon: React.ElementType;
    badgeColor: string;
  }[] = [
    {
      id: 'khatma',
      title: 'خاتمة (مقدمة عطاء)',
      description: 'تسجيل الختمات وتقديم المبادرات والخدمات القرآنية',
      icon: BookOpen,
      badgeColor: 'bg-primary/10 text-primary border-primary/20',
    },
    {
      id: 'seeker',
      title: 'طالبة احتياج (مستفيدة)',
      description: 'طلب الخدمات والمبادرات القرآنية للمجتمع',
      icon: HeartHandshake,
      badgeColor: 'bg-accent/10 text-accent border-accent/20',
    },
    {
      id: 'admin',
      title: 'مشرفة إدارية (إشراف)',
      description: 'صلاحيات كاملة لإدارة المنصة ومتابعة المحتوى',
      icon: Shield,
      badgeColor: 'bg-secondary-light text-primary border-secondary',
    },
  ];

  const currentNeighborhoods = CITY_DATA[city] || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl border border-secondary-light/40 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-background pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Plus size={22} />
            </div>
            <div>
              <h3 className="text-xl font-black text-primary">إضافة مستخدم جديد</h3>
              <p className="text-xs text-primary-muted font-bold">إنشاء حساب فوري وتفعيله مباشرة في المنصة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-background hover:bg-secondary-light/40 flex items-center justify-center text-primary-muted hover:text-primary transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-2.5">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-black flex items-center gap-2.5">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Role Selection */}
          <div>
            <label className="block text-xs font-black text-primary mb-2">نوع الحساب والدور *</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {roleOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = role === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setRole(opt.id)}
                    className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                        : 'border-secondary-light/40 bg-background/30 hover:bg-background'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Icon size={18} className={isSelected ? 'text-primary' : 'text-primary-muted'} />
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black border ${opt.badgeColor}`}>
                        {opt.id}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-black text-primary">{opt.title}</div>
                      <div className="text-[10px] text-primary-muted font-medium mt-0.5 leading-snug line-clamp-2">
                        {opt.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name & Display Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-primary mb-1">الاسم الكامل *</label>
              <div className="relative">
                <UserIcon size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary-muted" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-secondary-light/40 bg-background/50 focus:outline-none focus:border-primary font-medium text-xs text-primary"
                  placeholder="مثال: هند بنت محمد"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-primary mb-1">الاسم المستعار (اختياري)</label>
              <div className="relative">
                <UserIcon size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary-muted" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-secondary-light/40 bg-background/50 focus:outline-none focus:border-primary font-medium text-xs text-primary"
                  placeholder="مثال: أم عبد الرحمن"
                />
              </div>
            </div>
          </div>

          {/* Email & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-primary mb-1">البريد الإلكتروني *</label>
              <div className="relative">
                <Mail size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-secondary-light/40 bg-background/50 focus:outline-none focus:border-primary font-medium text-xs text-primary"
                  placeholder="user@example.com"
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-primary mb-1">كلمة المرور * (8 أحرف فأكثر)</label>
              <div className="relative">
                <Lock size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-secondary-light/40 bg-background/50 focus:outline-none focus:border-primary font-medium text-xs text-primary"
                  placeholder="••••••••"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-muted hover:text-primary cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* City & Neighborhood */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-primary mb-1 flex items-center gap-1">
                <MapPin size={14} className="text-secondary" />
                المدينة *
              </label>
              <select
                value={city}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-secondary-light/40 bg-background/50 focus:outline-none focus:border-primary font-bold text-xs text-primary"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-primary mb-1 flex items-center gap-1">
                <MapPin size={14} className="text-secondary" />
                الحي
              </label>
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-secondary-light/40 bg-background/50 focus:outline-none focus:border-primary font-bold text-xs text-primary"
              >
                {currentNeighborhoods.map((hood) => (
                  <option key={hood.name} value={hood.name}>
                    {hood.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bio / Description */}
          <div>
            <label className="block text-xs font-bold text-primary mb-1 flex items-center gap-1">
              <FileText size={14} className="text-primary-muted" />
              النبذة التعريفية (اختياري)
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-secondary-light/40 bg-background/50 focus:outline-none focus:border-primary font-medium text-xs text-primary resize-none"
              placeholder="نبذة موجزة عن اهتمامات المستخدم أو المبادرات التطوعية..."
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full border border-secondary-light/40 font-bold text-xs text-primary-muted hover:bg-background transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting || !!successMessage}
              className="flex-1 py-3 rounded-full bg-primary text-white font-black text-xs hover:bg-primary/90 transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              تأكيد وإضافة المستخدم
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
