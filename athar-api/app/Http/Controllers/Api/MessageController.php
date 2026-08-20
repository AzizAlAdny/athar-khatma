<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\SeekerNeed;
use App\Models\KhatmaGift;
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
            return SeekerNeed::find($id);
        } elseif ($type === 'gift') {
            return KhatmaGift::find($id);
        }
        return null;
    }

    private function getOwnerId($messageable)
    {
        if ($messageable instanceof SeekerNeed) {
            return $messageable->user_id;
        } elseif ($messageable instanceof KhatmaGift) {
            return $messageable->khatma->user_id;
        }
        return null;
    }

    private function getOwner($messageable)
    {
        if ($messageable instanceof SeekerNeed) {
            return $messageable->user;
        } elseif ($messageable instanceof KhatmaGift) {
            return $messageable->khatma?->user;
        }
        return null;
    }

    private function getMessageableType($type)
    {
        return $type === 'need' ? SeekerNeed::class : KhatmaGift::class;
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

        // Real-time broadcast
        try {
            broadcast(new \App\Events\MessageSent($message->load('sender')));
        } catch (\Throwable $e) {
            Log::warning('Broadcast failed for message', ['error' => $e->getMessage()]);
        }

        Log::info('Chat message sent', [
            'type' => $type,
            'id' => $id,
            'sender_id' => $user->id,
            'participant_id' => $message->participant_id,
        ]);

        return response()->json($this->shape($message->load('sender')), 201);
    }

    /**
     * Get all unique conversation threads for the user.
     */
    public function threads(Request $request)
    {
        $user = $request->user();

        // Get all messages involving the user
        $messages = Message::with(['sender', 'messageable.gift'])
            ->where(function($q) use ($user) {
                $q->where('sender_id', $user->id)
                  ->orWhere('participant_id', $user->id)
                  ->orWhereHasMorph('messageable', [SeekerNeed::class], function($q) use ($user) {
                      $q->where('user_id', $user->id);
                  })
                  ->orWhereHasMorph('messageable', [KhatmaGift::class], function($q) use ($user) {
                      $q->whereHas('khatma', function($q) use ($user) {
                          $q->where('user_id', $user->id);
                      });
                  });
            })
            ->latest()
            ->get();

        // Group by (messageable_type, messageable_id, participant_id)
        $threads = $messages->groupBy(function($m) {
            return $m->messageable_type . ':' . $m->messageable_id . ':' . $m->participant_id;
        })->map(function($msgs) use ($user) {
            $last = $msgs->first();
            $messageable = $last->messageable;

            if (!$messageable) return null;

            $ownerId = $this->getOwnerId($messageable);
            $isOwner = $ownerId === $user->id;

            $otherName = 'مستخدم';
            if ($isOwner) {
                $other = User::find($last->participant_id);
                $otherName = $other?->display_name ?: $other?->name ?: 'مشاركة';
            } else {
                $owner = $this->getOwner($messageable);
                $otherName = $owner?->display_name ?: $owner?->name ?: 'صاحبة الطلب';
            }

            return [
                'type' => $last->messageable_type === SeekerNeed::class ? 'need' : 'gift',
                'item_id' => $last->messageable_id,
                'participant_id' => $last->participant_id,
                'item_title' => $messageable->gift?->name ?: (isset($messageable->description) ? mb_strimwidth($messageable->description, 0, 30, '...') : 'مبادرة'),
                'other_name' => $otherName,
                'last_message' => mb_strimwidth($last->body, 0, 60, '...'),
                'updated_at' => $last->created_at->toIso8601String(),
            ];
        })->filter()->values();

        return response()->json($threads);
    }

    private function shape(Message $message): array
    {
        $sender = $message->sender;

        return [
            'id' => $message->id,
            'messageable_id' => $message->messageable_id,
            'messageable_type' => $message->messageable_type === SeekerNeed::class ? 'need' : 'gift',
            'participant_id' => $message->participant_id,
            'sender_id' => $message->sender_id,
            'sender_name' => $sender?->display_name ?: $sender?->name,
            'body' => $message->body,
            'created_at' => optional($message->created_at)->toIso8601String(),
        ];
    }
}
