<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VisitorMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VisitorMessageController extends Controller
{
    /**
     * Display a listing of visitor messages.
     */
    public function index(Request $request): JsonResponse
    {
        $messages = VisitorMessage::with(['user:id,name,display_name,city'])
            ->where('is_featured', true)
            ->latest()
            ->paginate($request->input('per_page', 15));

        $formatted = $messages->through(function ($item) {
            return [
                'id' => $item->id,
                'user_id' => $item->user_id,
                'user_name' => $item->user?->display_name ?: $item->user?->name ?: 'زائرة كريمة',
                'user_city' => $item->user?->city,
                'organization' => $item->organization,
                'message' => $item->message,
                'created_at' => $item->created_at->format('Y-m-d H:i'),
                'created_at_human' => $item->created_at->diffForHumans(),
            ];
        });

        return response()->json($formatted);
    }

    /**
     * Store a new visitor message.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|min:3|max:2000',
            'organization' => 'nullable|string|max:255',
        ], [
            'message.required' => 'الرجاء كتابة كلمتكِ أو رأيكِ بالمنصة.',
            'message.min' => 'يجب أن تحتوي الكلمة على 3 أحرف على الأقل.',
        ]);

        $user = $request->user();

        $visitorMessage = VisitorMessage::create([
            'user_id' => $user->id,
            'message' => strip_tags($request->message),
            'organization' => $request->filled('organization') ? strip_tags($request->organization) : null,
            'is_featured' => true,
        ]);

        // If user bio is empty, save the message into bio as well
        if (empty($user->bio)) {
            $user->bio = $visitorMessage->message;
            $user->save();
        }

        return response()->json([
            'message' => 'شكراً لكِ! تم تسجيل كلمتكِ الكريمة بنجاح، ونسعد بأثركِ معنا.',
            'data' => [
                'id' => $visitorMessage->id,
                'user_id' => $visitorMessage->user_id,
                'user_name' => $user->display_name ?: $user->name,
                'user_city' => $user->city,
                'organization' => $visitorMessage->organization,
                'message' => $visitorMessage->message,
                'created_at' => $visitorMessage->created_at->format('Y-m-d H:i'),
            ],
        ], 201);
    }
}
