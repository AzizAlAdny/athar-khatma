<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

/**
 * In-app notifications powering the header bell (polled every few seconds by
 * the SPA). Notifications are stored exclusively via the database channel.
 */
class NotificationController extends Controller
{
    /**
     * Latest 20 notifications for the authenticated user, newest first.
     */
    public function index(Request $request)
    {
        $notifications = $request->user()->notifications()->latest()->limit(20)->get();

        return response()->json($notifications->map(fn ($n) => $this->shape($n))->values());
    }

    /**
     * Count only — used by the bell badge polling loop.
     */
    public function unreadCount(Request $request)
    {
        return response()->json([
            'unread' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    /**
     * Mark a single notification as read (scoped to the owner).
     */
    public function markRead(Request $request, string $id)
    {
        $notification = $request->user()->notifications()->where('id', $id)->first();

        if (!$notification) {
            return response()->json(['message' => 'الإشعار غير موجود'], 404);
        }

        $notification->markAsRead();

        return response()->json(['status' => 'ok']);
    }

    /**
     * Mark every notification of the authenticated user as read.
     */
    public function markAllRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['status' => 'ok']);
    }

    private function shape(DatabaseNotification $notification): array
    {
        $data = $notification->data ?? [];

        return [
            'id' => $notification->id,
            'kind' => $data['kind'] ?? 'new_message',
            'sender_name' => $data['sender_name'] ?? null,
            'need_id' => $data['need_id'] ?? null,
            'participant_id' => $data['participant_id'] ?? null,
            'need_title' => $data['need_title'] ?? null,
            'excerpt' => $data['excerpt'] ?? null,
            'read_at' => optional($notification->read_at)->toIso8601String(),
            'created_at' => optional($notification->created_at)->toIso8601String(),
        ];
    }
}
