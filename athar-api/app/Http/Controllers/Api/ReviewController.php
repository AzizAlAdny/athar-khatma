<?php

namespace App\Http\Controllers\Api;

use App\Actions\Reviews\SubmitReviewAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Submit a review for a completed service or gift via SubmitReviewAction.
     */
    public function store(StoreReviewRequest $request, SubmitReviewAction $action): JsonResponse
    {
        $review = $action->execute($request->user(), $request->validated());

        return response()->json([
            'message' => 'شكراً لك على تقييمك!',
            'review' => $review,
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
