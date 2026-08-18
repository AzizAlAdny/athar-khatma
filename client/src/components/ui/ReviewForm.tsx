'use client';

import React, { useState } from 'react';
import { Star, Loader2, MessageSquare, Send } from 'lucide-react';
import Button from './Button';
import { submitReview } from '@/services/api';

interface ReviewFormProps {
  reviewableId: number;
  reviewableType: 'gift' | 'need';
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({
  reviewableId,
  reviewableType,
  onSuccess,
  onCancel
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('يرجى اختيار التقييم أولاً');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await submitReview({
        reviewable_id: reviewableId,
        reviewable_type: reviewableType,
        rating,
        comment: comment.trim() || undefined
      });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إرسال التقييم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-secondary-light/20 shadow-sm animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-secondary">
          <Star size={32} fill={rating > 0 ? "currentColor" : "none"} />
        </div>
        <h3 className="text-xl font-black text-primary">تقييم التجربة</h3>
        <p className="text-sm text-primary-muted font-bold mt-1">شاركينا رأيكِ في الأثر الذي تم تحقيقه.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center space-y-3">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="transition-all duration-200 hover:scale-125 active:scale-95"
              >
                <Star
                  size={36}
                  className={`${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-200'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-xs font-black text-primary-muted h-4">
            {rating === 1 && 'ضعيف جداً'}
            {rating === 2 && 'ضعيف'}
            {rating === 3 && 'جيد'}
            {rating === 4 && 'جيد جداً'}
            {rating === 5 && 'ممتاز، بارك الله فيكم'}
          </p>
        </div>

        <div className="relative group">
          <div className="absolute top-4 right-4 text-primary-muted group-focus-within:text-primary transition-colors">
            <MessageSquare size={18} />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="اكتبي تعليقكِ هنا (اختياري)..."
            rows={4}
            className="w-full bg-background/50 border border-secondary-light/30 rounded-2xl pr-12 pl-4 py-4 text-sm font-semibold text-primary placeholder:text-primary-muted/50 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white transition-all resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-[11px] font-black p-4 rounded-2xl flex items-center gap-2">
            <span className="shrink-0">⚠️</span>
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={loading || rating === 0}
            className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-primary/20 transition-all hover:translate-y-[-2px] active:translate-y-0 disabled:opacity-50 disabled:translate-y-0"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" /> جاري الإرسال...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Send size={16} className="rotate-[-45deg]" /> إرسال التقييم
              </span>
            )}
          </Button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 text-primary-muted font-black text-sm hover:text-primary transition-colors"
            >
              إلغاء
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
