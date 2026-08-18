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

    public function index()
    {
        $needs = SeekerNeed::with(['user', 'gift'])->withCount('messages')->latest()->get()->map(function ($need) {
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
}
