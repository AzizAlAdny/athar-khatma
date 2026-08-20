<?php

namespace App\Actions\Reviews;

use App\Models\Review;
use App\Models\KhatmaGift;
use App\Models\SeekerNeed;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class SubmitReviewAction
{
    /**
     * Execute the atomic review submission, point calculation, and parent score update.
     *
     * @param User $reviewer
     * @param array $data
     * @return Review
     * @throws ValidationException
     */
    public function execute(User $reviewer, array $data): Review
    {
        return DB::transaction(function () use ($reviewer, $data) {
            $type = $data['reviewable_type'];
            $id = $data['reviewable_id'];
            $reviewableType = $type === 'gift' ? KhatmaGift::class : SeekerNeed::class;

            if ($type === 'gift') {
                $item = KhatmaGift::with('khatma')->findOrFail($id);

                if ($item->status !== 'delivered') {
                    throw ValidationException::withMessages([
                        'reviewable_id' => 'لا يمكن تقييم هذا العطاء إلا بعد تأكيد التسليم.',
                    ]);
                }

                if ($reviewer->id !== $item->delivered_to_id) {
                    throw ValidationException::withMessages([
                        'reviewable_id' => 'غير مصرح لك بتقييم هذا العطاء.',
                    ]);
                }

                $revieweeId = $item->khatma->user_id;
            } else {
                $item = SeekerNeed::findOrFail($id);

                if ($item->status !== 'fulfilled') {
                    throw ValidationException::withMessages([
                        'reviewable_id' => 'لا يمكن تقييم هذا الطلب إلا بعد اكتمال تلبيته.',
                    ]);
                }

                if ($reviewer->id !== $item->user_id) {
                    throw ValidationException::withMessages([
                        'reviewable_id' => 'غير مصرح لك بتقييم هذا الطلب.',
                    ]);
                }

                $revieweeId = $item->fulfilled_by_id;
            }

            // Check if already reviewed (guarded by unique index as well)
            $exists = Review::where('reviewer_id', $reviewer->id)
                ->where('reviewable_id', $id)
                ->where('reviewable_type', $reviewableType)
                ->exists();

            if ($exists) {
                throw ValidationException::withMessages([
                    'reviewable_id' => 'لقد قمت بتقييم هذا المورد مسبقاً.',
                ]);
            }

            // Create Review
            $review = Review::create([
                'reviewer_id' => $reviewer->id,
                'reviewee_id' => $revieweeId,
                'reviewable_id' => $id,
                'reviewable_type' => $reviewableType,
                'rating' => $data['rating'],
                'comment' => isset($data['comment']) ? strip_tags($data['comment']) : null,
            ]);

            // Recalculate impact points
            $points = $review->rating * 2;
            $item->update([
                'points_earned' => $points,
            ]);

            if ($type === 'gift' && $item->khatma) {
                $totalImpact = $item->khatma->khatmaGifts()->sum('points_earned');
                $item->khatma->update([
                    'impact_score' => $totalImpact,
                ]);
            }

            Log::info('Review submitted and impact recalculated atomically', [
                'reviewer_id' => $reviewer->id,
                'reviewee_id' => $revieweeId,
                'rating' => $review->rating,
                'new_points' => $item->points_earned,
            ]);

            return $review;
        });
    }
}
