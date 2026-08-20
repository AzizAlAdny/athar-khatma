<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Khatma;
use App\Models\SeekerNeed;
use App\Models\Gift;
use App\Models\Review;
use App\Models\Call;
use App\Models\KhatmaGift;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AdminController extends Controller
{
    /**
     * Get platform overview analytics and system metrics.
     */
    public function index(): JsonResponse
    {
        $stats = [
            'total_users' => User::count(),
            'total_khatmas' => Khatma::count(),
            'total_needs' => SeekerNeed::count(),
            'total_gifts' => Gift::count(),
            'active_khatmas' => Khatma::where('status', 'active')->count(),
            'pending_needs' => SeekerNeed::where('status', 'open')->count(),
            'in_progress_needs' => SeekerNeed::where('status', 'in_progress')->count(),
            'fulfilled_needs' => SeekerNeed::where('status', 'fulfilled')->count(),
            'khatma_users' => User::where('role', 'khatma')->count(),
            'seeker_users' => User::where('role', 'seeker')->count(),
            'admin_users' => User::where('role', 'admin')->count(),
            'total_reviews' => Review::count(),
            'average_platform_rating' => round((float) (Review::avg('rating') ?? 5.0), 1),
            'total_impact_points' => (int) Khatma::sum('impact_score'),
            'active_calls' => Call::whereIn('status', ['OUTGOING_RINGING', 'CONNECTING', 'CONNECTED'])->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Get paginated users with filtering and eager loaded activity metrics.
     */
    public function users(Request $request): JsonResponse
    {
        $query = User::query()->withCount(['khatmas', 'seekerNeeds', 'authEvents']);

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('display_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate((int) ($request->per_page ?? 20));

        return response()->json($users);
    }

    /**
     * Create a new user by admin with automatic verification.
     */
    public function createUser(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'display_name' => 'nullable|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:khatma,seeker,admin',
            'city' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:1000',
        ]);

        $user = User::create([
            'name' => $request->name,
            'display_name' => $request->display_name ?: $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role' => $request->role,
            'city' => $request->city ?: 'الرياض',
            'bio' => $request->bio,
        ]);

        $user->email_verified_at = now();
        $user->pledge_accepted = true;
        $user->save();

        Log::info('User created by admin', [
            'admin_id' => $request->user()->id,
            'new_user_id' => $user->id,
            'role' => $user->role,
        ]);

        return response()->json([
            'message' => 'تم إنشاء المستخدم بنجاح وتفعيله مباشرة',
            'user' => $user,
        ], 201);
    }

    /**
     * Get platform-wide khatmas with search, filters, and relationship eager loading.
     */
    public function khatmas(Request $request): JsonResponse
    {
        $query = Khatma::with([
            'user:id,name,display_name,email,city',
            'khatmaGifts.gift',
        ]);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('display_name', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%");
            });
        }

        $khatmas = $query->latest()->paginate((int) ($request->per_page ?? 15));

        return response()->json($khatmas);
    }

    /**
     * Delete a khatma by admin.
     */
    public function deleteKhatma($id): JsonResponse
    {
        $khatma = Khatma::findOrFail($id);
        $khatma->delete();

        Log::info('Khatma deleted by admin', [
            'admin_id' => auth()->id(),
            'khatma_id' => $id,
            'khatma_user_id' => $khatma->user_id,
        ]);

        return response()->json(['message' => 'تم حذف الختمة بنجاح']);
    }

    /**
     * Get platform-wide seeker needs with search, status filters, and helper info.
     */
    public function needs(Request $request): JsonResponse
    {
        $query = SeekerNeed::with([
            'user:id,name,display_name,email,city',
            'gift',
            'helper:id,name,display_name,email',
        ]);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('display_name', 'like', "%{$search}%");
                  });
            });
        }

        $needs = $query->latest()->paginate((int) ($request->per_page ?? 15));

        return response()->json($needs);
    }

    /**
     * Delete a seeker need by admin.
     */
    public function deleteNeed($id): JsonResponse
    {
        $need = SeekerNeed::findOrFail($id);
        $need->delete();

        Log::info('Need deleted by admin', [
            'admin_id' => auth()->id(),
            'need_id' => $id,
            'need_user_id' => $need->user_id,
        ]);

        return response()->json(['message' => 'تم حذف الطلب بنجاح']);
    }

    /**
     * Get platform-wide reviews for moderation.
     */
    public function reviews(Request $request): JsonResponse
    {
        $query = Review::with([
            'reviewer:id,name,display_name,email',
            'reviewee:id,name,display_name,email',
            'reviewable',
        ]);

        if ($request->filled('rating')) {
            $query->where('rating', $request->rating);
        }

        if ($request->filled('reviewable_type')) {
            $typeClass = $request->reviewable_type === 'gift' ? KhatmaGift::class : SeekerNeed::class;
            $query->where('reviewable_type', $typeClass);
        }

        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('comment', 'like', "%{$search}%")
                  ->orWhereHas('reviewer', function ($rq) use ($search) {
                      $rq->where('name', 'like', "%{$search}%")
                         ->orWhere('display_name', 'like', "%{$search}%");
                  });
            });
        }

        $reviews = $query->latest()->paginate((int) ($request->per_page ?? 15));

        return response()->json($reviews);
    }

    /**
     * Delete an abusive review and recalculate target impact score atomically.
     */
    public function deleteReview($id): JsonResponse
    {
        return DB::transaction(function () use ($id) {
            $review = Review::findOrFail($id);
            $item = $review->reviewable;

            $review->delete();

            // Recalculate remaining points for the item
            if ($item) {
                $avgRating = $item->reviews()->avg('rating') ?? 0;
                $points = round($avgRating * 2);
                $item->update(['points_earned' => $points]);

                if ($review->reviewable_type === KhatmaGift::class && $item->khatma) {
                    $totalImpact = $item->khatma->khatmaGifts()->sum('points_earned');
                    $item->khatma->update(['impact_score' => $totalImpact]);
                }
            }

            Log::info('Review deleted by admin and impact recalculated', [
                'admin_id' => auth()->id(),
                'review_id' => $id,
            ]);

            return response()->json(['message' => 'تم حذف التقييم وتحديث نقاط الأثر بنجاح']);
        });
    }

    /**
     * Get voice call audit logs.
     */
    public function calls(Request $request): JsonResponse
    {
        $query = Call::with([
            'caller:id,name,display_name,email',
            'receiver:id,name,display_name,email',
        ]);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $calls = $query->latest()->paginate((int) ($request->per_page ?? 20));

        return response()->json($calls);
    }
}
