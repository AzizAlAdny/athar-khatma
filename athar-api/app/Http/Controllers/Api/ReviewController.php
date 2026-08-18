<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\KhatmaGift;
use App\Models\SeekerNeed;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ReviewController extends Controller
{
    /**
     * Submit a review for a completed service or gift.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reviewable_id' => 'required|integer',
            'reviewable_type' => 'required|string|in:gift,need',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $type = $validated['reviewable_type'];
        $id = $validated['reviewable_id'];

        if ($type === 'gift') {
            $item = KhatmaGift::with('khatma')->find($id);
            if (!$item || $item->status !== 'delivered') {
                return response()->json(['message' => 'العطاء غير جاهز للتقييم'], 400);
            }
            $revieweeId = $item->khatma->user_id;
            $reviewableType = KhatmaGift::class;

            // Only the person it was delivered to can review (the participant in chat)
            if ($user->id !== $item->delivered_to_id) {
                return response()->json(['message' => 'غير مصرح لك بتقييم هذا العطاء'], 403);
            }
        } else {
            $item = SeekerNeed::find($id);
            if (!$item || $item->status !== 'fulfilled') {
                return response()->json(['message' => 'الطلب غير جاهز للتقييم'], 400);
            }
            $revieweeId = $item->user_id;
            $reviewableType = SeekerNeed::class;

            // Only the person who fulfilled it can review?
            // Wait, usually the seeker reviews the khatma user, or vice versa?
            // In "Need", the Seeker is the one helped. The Khatma user is the one who helped.
            // If SeekerNeed is fulfilled, the Seeker (owner) should review the Helper.
            // Or the Helper reviews the Seeker?
            // The prompt says "Adding rating and review feature after the service or gift is delivered."
            // For Gift: Seeker reviews Khatma user.
            // For Need: Seeker reviews Khatma user (who fulfilled the need).

            if ($user->id !== $item->user_id) {
                return response()->json(['message' => 'غير مصرح لك بتقييم هذا الطلب'], 403);
            }
            $revieweeId = $item->fulfilled_by_id;
        }

        // Check if already reviewed
        $exists = Review::where('reviewer_id', $user->id)
            ->where('reviewable_id', $id)
            ->where('reviewable_type', $reviewableType)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'لقد قمت بتقييم هذا المورد مسبقاً'], 400);
        }

        $review = Review::create([
            'reviewer_id' => $user->id,
            'reviewee_id' => $revieweeId,
            'reviewable_id' => $id,
            'reviewable_type' => $reviewableType,
            'rating' => $validated['rating'],
            'comment' => strip_tags($validated['comment']),
        ]);

        // Recalculate impact
        if ($type === 'gift') {
            $item->update([
                'points_earned' => $review->rating * 2
            ]);

            // Update parent Khatma impact score
            $khatma = $item->khatma;
            $totalImpact = $khatma->khatmaGifts()->sum('points_earned');
            $khatma->update([
                'impact_score' => $totalImpact
            ]);
        } elseif ($type === 'need') {
            $item->update([
                'points_earned' => $review->rating * 2
            ]);
        }

        Log::info('Review submitted and impact recalculated', [
            'reviewer_id' => $user->id,
            'reviewee_id' => $revieweeId,
            'rating' => $review->rating,
            'new_points' => $item->points_earned,
        ]);

        return response()->json([
            'message' => 'شكراً لك على تقييمك!',
            'review' => $review
        ], 201);
    }

    /**
     * Get reviews for a specific user.
     */
    public function userReviews($userId)
    {
        $reviews = Review::where('reviewee_id', $userId)
            ->with('reviewer:id,name,display_name')
            ->latest()
            ->get();

        $averageRating = $reviews->avg('rating');

        return response()->json([
            'reviews' => $reviews,
            'average_rating' => round($averageRating, 1),
            'total_reviews' => $reviews->count(),
        ]);
    }
}
