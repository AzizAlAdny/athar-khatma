<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KhatmaGift;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class KhatmaGiftController extends Controller
{
    public function show($id)
    {
        $gift = KhatmaGift::with(['gift', 'khatma.user'])->find($id);

        if (!$gift) {
            return response()->json(['message' => 'العطاء غير موجود'], 404);
        }

        return response()->json([
            'id' => $gift->id,
            'user_id' => $gift->khatma->user_id,
            'gift_name' => $gift->gift->name,
            'user_name' => $gift->khatma->user?->display_name ?: $gift->khatma->user?->name,
            'city' => $gift->khatma->user->city,
            'status' => $gift->status,
            'delivered_at' => $gift->delivered_at,
        ]);
    }

    public function recent(Request $request)
    {
        $user = $request->user();
        $query = KhatmaGift::with(['gift', 'khatma.user'])
            ->withCount('messages')
            ->withAvg('reviews', 'rating');

        if ($user && $user->role !== 'admin') {
            $query->where(function($q) use ($user) {
                $q->where('status', 'pending')
                  ->orWhere('delivered_to_id', $user->id);
            });
        }

        $gifts = $query->latest()
            ->limit(24)
            ->get()
            ->map(fn ($gift) => [
                'id' => $gift->id,
                'khatma_id' => $gift->khatma_id,
                'user_id' => $gift->khatma->user_id,
                'gift_name' => $gift->gift->name ?? null,
                'gift_icon' => $gift->gift->icon ?? null,
                'messages_count' => $gift->messages_count,
                'user_name' => $gift->khatma->user?->display_name ?: ($gift->khatma->user?->name ?? null),
                'city' => $gift->khatma->user->city ?? null,
                'created_at' => optional($gift->created_at)->toIso8601String(),
                'status' => $gift->status,
                'average_rating' => $gift->average_rating,
                'delivered_to_id' => $gift->delivered_to_id,
            ])
            ->filter(fn ($item) => $item['gift_name'] && $item['user_name'])
            ->values();

        return response()->json($gifts);
    }

    public function markDelivered(Request $request, $id)
    {
        $gift = KhatmaGift::with('khatma')->find($id);

        if (!$gift) {
            return response()->json(['message' => 'العطاء غير موجود'], 404);
        }

        $user = $request->user();

        // The khatma owner, the seeker who ordered it (delivered_to_id), or an admin can mark as delivered
        if ($user->id !== $gift->khatma->user_id && $user->id !== $gift->delivered_to_id && $user->role !== 'admin') {
            return response()->json(['message' => 'غير مصرح لك بتغيير حالة هذا العطاء.'], 403);
        }

        $deliveredToId = $request->input('delivered_to_id') ?? $gift->delivered_to_id ?? $user->id;

        $gift->update([
            'status' => 'delivered',
            'delivered_at' => now(),
            'delivered_to_id' => $deliveredToId,
        ]);

        Log::info('Gift marked as delivered', [
            'gift_id' => $gift->id,
            'delivered_to_id' => $gift->delivered_to_id,
            'user_id' => $user->id,
        ]);

        return response()->json([
            'message' => 'تم تحديد العطاء كمسلم بنجاح',
            'gift' => $gift->load(['gift', 'khatma.user'])
        ]);
    }

    public function markInProgress(Request $request, $id)
    {
        $gift = KhatmaGift::with('khatma')->find($id);

        if (!$gift) {
            return response()->json(['message' => 'العطاء غير موجود'], 404);
        }

        if ($gift->status !== 'pending') {
            return response()->json(['message' => 'العطاء تم استلامه مسبقاً أو غير متاح.'], 400);
        }

        $user = $request->user();

        // If the user ordering is not the khatma owner, set delivered_to_id to this seeker
        $deliveredToId = ($user->id !== $gift->khatma->user_id)
            ? $user->id
            : ($request->input('delivered_to_id') ?? $gift->delivered_to_id);

        $gift->update([
            'status' => 'in_progress',
            'delivered_to_id' => $deliveredToId,
        ]);

        Log::info('Gift marked as in_progress', [
            'gift_id' => $gift->id,
            'user_id' => $user->id,
            'delivered_to_id' => $deliveredToId,
        ]);

        return response()->json([
            'message' => 'تم طلب العطاء بنجاح، يمكنك الآن البدء في التنسيق والمحادثة.',
            'gift' => $gift->load(['gift', 'khatma.user'])
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $gift = KhatmaGift::with('khatma')->find($id);

        if (!$gift) {
            return response()->json(['message' => 'العطاء غير موجود'], 404);
        }

        $user = $request->user();

        if ($user->id !== $gift->khatma->user_id && $user->role !== 'admin') {
            return response()->json(['message' => 'غير مصرح لك بحذف هذا العطاء.'], 403);
        }

        $gift->delete();

        Log::info('KhatmaGift deleted', [
            'gift_id' => $id,
            'user_id' => $user->id,
        ]);

        return response()->json([
            'message' => 'تم حذف العطاء بنجاح'
        ]);
    }
}
