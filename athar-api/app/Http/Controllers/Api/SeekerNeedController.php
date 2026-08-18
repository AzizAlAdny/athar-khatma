<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSeekerNeedRequest;
use App\Models\SeekerNeed;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SeekerNeedController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $query = SeekerNeed::with(['user', 'gift'])->withCount('messages');

        // Enforcement of visibility rules
        if ($user && $user->role !== 'admin') {
            $query->where(function($q) use ($user) {
                $q->where('status', 'open')
                  ->orWhere('user_id', $user->id)
                  ->orWhere('fulfilled_by_id', $user->id);
            });
        }

        $needs = $query->latest()->get()->map(function ($need) {
            $need->created_at_human = $need->created_at?->diffForHumans();
            return $need;
        });

        return response()->json($needs);
    }

    public function show($id)
    {
        $need = SeekerNeed::with(['user', 'gift'])->withCount('messages')->find($id);

        if (!$need) {
            return response()->json(['message' => 'الطلب غير موجود'], 404);
        }

        return response()->json($need);
    }

    public function store(StoreSeekerNeedRequest $request)
    {
        $need = $request->user()->seekerNeeds()->create([
            'gift_id' => $request->gift_id,
            'description' => strip_tags($request->description),
            'city' => $request->city ? strip_tags($request->city) : null,
            'neighborhood' => $request->neighborhood ? strip_tags($request->neighborhood) : null,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ]);

        Log::info('Need created', [
            'user_id' => $request->user()->id,
            'need_id' => $need->id,
            'gift_id' => $need->gift_id,
            'ip' => $request->ip(),
        ]);

        $this->notificationService->notifyNeedCreated($need);

        return response()->json($need, 201);
    }

    public function destroy(Request $request, $id)
    {
        $need = SeekerNeed::find($id);

        if (!$need) {
            return response()->json(['message' => 'الطلب غير موجود'], 404);
        }

        if ($request->user()->id !== $need->user_id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'غير مصرح لك بحذف هذا الطلب.'], 403);
        }

        $need->delete();

        return response()->json(['message' => 'تم حذف الطلب بنجاح']);
    }

    public function markFulfilled(Request $request, $id)
    {
        $need = SeekerNeed::find($id);

        if (!$need) {
            return response()->json(['message' => 'الطلب غير موجود'], 404);
        }

        // Only the owner (seeker) can mark as fulfilled
        if ($request->user()->id !== $need->user_id) {
            return response()->json(['message' => 'غير مصرح لك بتغيير حالة هذا الطلب.'], 403);
        }

        $validated = $request->validate([
            'fulfilled_by_id' => 'required|exists:users,id',
        ]);

        $need->update([
            'status' => 'fulfilled',
            'fulfilled_at' => now(),
            'fulfilled_by_id' => $validated['fulfilled_by_id'],
        ]);

        Log::info('Need marked as fulfilled', [
            'need_id' => $need->id,
            'fulfilled_by_id' => $need->fulfilled_by_id,
        ]);

        return response()->json([
            'message' => 'تم تحديد الطلب كمكتمل بنجاح',
            'need' => $need
        ]);
    }

    public function markInProgress(Request $request, $id)
    {
        $need = SeekerNeed::find($id);

        if (!$need) {
            return response()->json(['message' => 'الطلب غير موجود'], 404);
        }

        if ($need->status !== 'open') {
            return response()->json(['message' => 'الطلب تم استلامه مسبقاً أو غير متاح.'], 400);
        }

        // Only users with khatma role (or admin) can claim a need
        if ($request->user()->role !== 'khatma' && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'فقط صانعات الأثر يمكنهن استلام الطلبات.'], 403);
        }

        $need->update([
            'status' => 'in_progress',
            'fulfilled_by_id' => $request->user()->id,
        ]);

        Log::info('Need marked as in_progress', [
            'need_id' => $need->id,
            'helper_id' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'تم استلام الطلب بنجاح، يمكنك الآن البدء في التنسيق.',
            'need' => $need->load(['user', 'gift'])
        ]);
    }
}
