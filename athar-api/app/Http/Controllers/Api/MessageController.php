<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Need;
use App\Models\User;
use App\Notifications\NewChatMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Chat between a need owner (طالب الخدمة) and a khatma user (الخاتمة) so the
 * two parties can coordinate on the gift/service details. A thread is keyed
 * by (need_id, participant_id), where participant_id is the non-owner party.
 */
class MessageController extends Controller
{
    /**
     * List messages for a need. The owner sees all threads (optionally
     * filtered to one participant); anyone else sees only their own thread.
     */
    public function index(Request $request, $id)
    {
        $need = Need::find($id);

        if (!$need) {
            return response()->json(['message' => 'الطلب غير موجود'], 404);
        }

        $user = $request->user();

        if ($user->id === $need->user_id) {
            $query = $need->messages()->with('sender');
            if ($request->filled('participant')) {
                $query->where('participant_id', (int) $request->query('participant'));
            }
        } else {
            $query = $need->messages()->with('sender')
                ->where('participant_id', $user->id);
        }

        return response()->json(
            $query->orderBy('created_at')->get()->map(fn($m) => $this->shape($m))->values()
        );
    }

    /**
     * Send a message. Non-owners always message the need's owner (their own
     * thread); the owner must specify which participant thread they reply in.
     */
    public function store(Request $request, $id)
    {
        $need = Need::find($id);

        if (!$need) {
            return response()->json(['message' => 'الطلب غير موجود'], 404);
        }

        $user = $request->user();
        $isOwner = $user->id === $need->user_id;

        $validated = $request->validate([
            'body' => 'required|string|max:1000',
            'participant_id' => $isOwner
                ? 'required|integer|exists:users,id|not_in:' . $user->id
                : 'prohibited',
        ], [
            'body.required' => 'نص الرسالة مطلوب',
            'body.max' => 'الرسالة يجب أن لا تتجاوز 1000 حرف',
            'participant_id.required' => 'يجب تحديد الطرف الآخر في المحادثة',
            'participant_id.exists' => 'المستخدم المحدد غير موجود',
        ]);

        // First contact from a khatma user doubles as a "new participant on
        // your need" signal for the owner's notifications bell.
        $isFirstContact = !$isOwner
            && !Message::where('need_id', $need->id)
                ->where('participant_id', $user->id)
                ->exists();

        $message = Message::create([
            'need_id' => $need->id,
            'participant_id' => $isOwner ? (int) $validated['participant_id'] : $user->id,
            'sender_id' => $user->id,
            'body' => strip_tags($validated['body']),
        ]);

        // Notify the other party in the thread (stored for the header bell).
        $recipient = $isOwner ? User::find($message->participant_id) : $need->user;
        $recipient?->notify(new NewChatMessage($message, $isFirstContact));

        Log::info('Chat message sent', [
            'need_id' => $need->id,
            'sender_id' => $user->id,
            'participant_id' => $message->participant_id,
        ]);

        return response()->json($this->shape($message->load('sender')), 201);
    }

    private function shape(Message $message): array
    {
        $sender = $message->sender;

        return [
            'id' => $message->id,
            'need_id' => $message->need_id,
            'participant_id' => $message->participant_id,
            'sender_id' => $message->sender_id,
            'sender_name' => $sender?->display_name ?: $sender?->name,
            'body' => $message->body,
            'created_at' => optional($message->created_at)->toIso8601String(),
        ];
    }
}
