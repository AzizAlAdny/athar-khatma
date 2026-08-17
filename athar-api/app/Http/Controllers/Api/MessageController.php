<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Need;
use App\Models\KhatmaService;
use App\Models\User;
use App\Notifications\NewChatMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Unified chat between users regarding an initiative (Need or Gift).
 * A thread is keyed by (messageable_id, messageable_type, participant_id),
 * where participant_id is the non-owner party.
 */
class MessageController extends Controller
{
    private function getMessageable($type, $id)
    {
        if ($type === 'need') {
            return Need::find($id);
        } elseif ($type === 'gift') {
            return KhatmaService::find($id);
        }
        return null;
    }

    private function getOwnerId($messageable)
    {
        if ($messageable instanceof Need) {
            return $messageable->user_id;
        } elseif ($messageable instanceof KhatmaService) {
            return $messageable->khatma->user_id;
        }
        return null;
    }

    private function getMessageableType($type)
    {
        return $type === 'need' ? Need::class : KhatmaService::class;
    }

    /**
     * List messages for a need or gift.
     */
    public function index(Request $request, $type, $id)
    {
        $messageable = $this->getMessageable($type, $id);

        if (!$messageable) {
            return response()->json(['message' => 'المورد غير موجود'], 404);
        }

        $user = $request->user();
        $ownerId = $this->getOwnerId($messageable);

        if ($user->id === $ownerId) {
            $query = $messageable->messages()->with('sender');
            if ($request->filled('participant')) {
                $query->where('participant_id', (int) $request->query('participant'));
            }
        } else {
            $query = $messageable->messages()->with('sender')
                ->where('participant_id', $user->id);
        }

        return response()->json(
            $query->orderBy('created_at')->get()->map(fn($m) => $this->shape($m))->values()
        );
    }

    /**
     * Send a message.
     */
    public function store(Request $request, $type, $id)
    {
        $messageable = $this->getMessageable($type, $id);

        if (!$messageable) {
            return response()->json(['message' => 'المورد غير موجود'], 404);
        }

        $user = $request->user();
        $ownerId = $this->getOwnerId($messageable);
        $isOwner = $user->id === $ownerId;

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

        $participantId = $isOwner ? (int) $validated['participant_id'] : $user->id;

        // First contact check
        $isFirstContact = !$isOwner
            && !Message::where('messageable_id', $messageable->id)
                ->where('messageable_type', get_class($messageable))
                ->where('participant_id', $user->id)
                ->exists();

        $message = Message::create([
            'messageable_id' => $messageable->id,
            'messageable_type' => get_class($messageable),
            'participant_id' => $participantId,
            'sender_id' => $user->id,
            'body' => strip_tags($validated['body']),
        ]);

        // Notify the other party
        $recipient = $isOwner ? User::find($message->participant_id) : User::find($ownerId);
        $recipient?->notify(new NewChatMessage($message, $isFirstContact));

        Log::info('Chat message sent', [
            'type' => $type,
            'id' => $id,
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
            'messageable_id' => $message->messageable_id,
            'messageable_type' => $message->messageable_type === Need::class ? 'need' : 'gift',
            'participant_id' => $message->participant_id,
            'sender_id' => $message->sender_id,
            'sender_name' => $sender?->display_name ?: $sender?->name,
            'body' => $message->body,
            'created_at' => optional($message->created_at)->toIso8601String(),
        ];
    }
}
