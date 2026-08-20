<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Call;
use App\Models\Message;
use App\Models\KhatmaGift;
use App\Models\SeekerNeed;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class CallController extends Controller
{
    private function getCallable($type, $id)
    {
        if ($type === 'need') {
            return SeekerNeed::find($id);
        } elseif ($type === 'gift') {
            return KhatmaGift::find($id);
        }
        return null;
    }

    private function getOwnerId($callable)
    {
        if ($callable instanceof SeekerNeed) {
            return $callable->user_id;
        } elseif ($callable instanceof KhatmaGift) {
            return $callable->khatma?->user_id;
        }
        return null;
    }

    private function canUserAccessThread($user, $callable, $receiverId)
    {
        $ownerId = $this->getOwnerId($callable);
        if (!$ownerId) return false;

        // Owner initiating call to a participant
        if ($user->id === $ownerId) {
            return Message::where('messageable_id', $callable->id)
                ->where('messageable_type', get_class($callable))
                ->where('participant_id', $receiverId)
                ->exists();
        }

        // Non-owner initiating call to owner (user must be a thread participant)
        if ($receiverId === $ownerId) {
            return Message::where('messageable_id', $callable->id)
                ->where('messageable_type', get_class($callable))
                ->where('participant_id', $user->id)
                ->exists();
        }

        return false;
    }

    /**
     * Get currently active call for authenticated user.
     * Also auto-cleans calls older than 35 seconds that were never answered.
     */
    public function activeCall(Request $request)
    {
        $user = $request->user();

        // Expire ringing calls > 35 seconds
        Call::where('status', 'ringing')
            ->where('created_at', '<', Carbon::now()->subSeconds(35))
            ->update([
                'status' => 'missed',
                'ended_at' => Carbon::now(),
            ]);

        // Find active call involving user
        $activeCall = Call::with(['caller', 'receiver'])
            ->where(function ($q) use ($user) {
                $q->where('caller_id', $user->id)
                  ->orWhere('receiver_id', $user->id);
            })
            ->whereIn('status', ['ringing', 'connected'])
            ->latest()
            ->first();

        return response()->json([
            'call' => $activeCall ? $this->shapeCall($activeCall, $user->id) : null
        ]);
    }

    /**
     * Initiate a new 1-on-1 voice call.
     */
    public function initiate(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'receiver_id' => 'required|integer|exists:users,id|different:' . $user->id,
            'context_type' => 'required|string|in:need,gift',
            'context_id' => 'required|integer',
            'sdp_offer' => 'required|string',
        ]);

        $callable = $this->getCallable($validated['context_type'], $validated['context_id']);
        if (!$callable) {
            return response()->json(['message' => 'المورد المحدد غير موجود'], 404);
        }

        // Verify thread participation
        if (!$this->canUserAccessThread($user, $callable, (int) $validated['receiver_id'])) {
            return response()->json(['message' => 'غير مصرح لك بإجراء مكالمة مع هذا المستخدم'], 403);
        }

        // Check if receiver is currently in another active call
        $receiverActiveCall = Call::where(function ($q) use ($validated) {
            $q->where('caller_id', $validated['receiver_id'])
              ->orWhere('receiver_id', $validated['receiver_id']);
        })->whereIn('status', ['ringing', 'connected'])->exists();

        if ($receiverActiveCall) {
            return response()->json([
                'message' => 'المستخدم الآخر في مكالمة أخرى حالياً',
                'status' => 'busy'
            ], 409);
        }

        // Check if caller is in an active call
        $callerActiveCall = Call::where(function ($q) use ($user) {
            $q->where('caller_id', $user->id)
              ->orWhere('receiver_id', $user->id);
        })->whereIn('status', ['ringing', 'connected'])->first();

        if ($callerActiveCall) {
            return response()->json(['message' => 'أنت في مكالمة نشطة بالفعل'], 400);
        }

        $call = Call::create([
            'caller_id' => $user->id,
            'receiver_id' => $validated['receiver_id'],
            'callable_id' => $callable->id,
            'callable_type' => get_class($callable),
            'status' => 'ringing',
            'sdp_offer' => $validated['sdp_offer'],
            'caller_ice_candidates' => [],
            'receiver_ice_candidates' => [],
        ]);

        return response()->json([
            'call' => $this->shapeCall($call->load(['caller', 'receiver']), $user->id)
        ], 201);
    }

    /**
     * Receiver accepts or rejects call.
     */
    public function respond(Request $request, $id)
    {
        $user = $request->user();
        $call = Call::with(['caller', 'receiver'])->find($id);

        if (!$call) {
            return response()->json(['message' => 'المكالمة غير موجودة'], 404);
        }

        if ($call->receiver_id !== $user->id) {
            return response()->json(['message' => 'غير مصرح لك بالرد على هذه المكالمة'], 403);
        }

        $validated = $request->validate([
            'action' => 'required|string|in:accept,reject',
            'sdp_answer' => 'required_if:action,accept|nullable|string',
        ]);

        if ($validated['action'] === 'accept') {
            $call->update([
                'status' => 'connected',
                'sdp_answer' => $validated['sdp_answer'],
                'started_at' => Carbon::now(),
            ]);
        } else {
            $call->update([
                'status' => 'rejected',
                'ended_at' => Carbon::now(),
            ]);

            // Add system chat message for rejected call
            $this->addCallChatMessage($call, '📞 مكالمة صوتية لم يتم الرد عليها');
        }

        return response()->json([
            'call' => $this->shapeCall($call->fresh(), $user->id)
        ]);
    }

    /**
     * Submit WebRTC ICE Candidates.
     */
    public function signal(Request $request, $id)
    {
        $user = $request->user();
        $call = Call::find($id);

        if (!$call) {
            return response()->json(['message' => 'المكالمة غير موجودة'], 404);
        }

        if ($call->caller_id !== $user->id && $call->receiver_id !== $user->id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $validated = $request->validate([
            'candidate' => 'required|array',
        ]);

        if ($call->caller_id === $user->id) {
            $candidates = $call->caller_ice_candidates ?? [];
            $candidates[] = $validated['candidate'];
            $call->update(['caller_ice_candidates' => $candidates]);
        } else {
            $candidates = $call->receiver_ice_candidates ?? [];
            $candidates[] = $validated['candidate'];
            $call->update(['receiver_ice_candidates' => $candidates]);
        }

        return response()->json([
            'call' => $this->shapeCall($call->fresh(['caller', 'receiver']), $user->id)
        ]);
    }

    /**
     * End active call.
     */
    public function end(Request $request, $id)
    {
        $user = $request->user();
        $call = Call::with(['caller', 'receiver'])->find($id);

        if (!$call) {
            return response()->json(['message' => 'المكالمة غير موجودة'], 404);
        }

        if ($call->caller_id !== $user->id && $call->receiver_id !== $user->id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        if (in_array($call->status, ['ended', 'rejected', 'missed', 'cancelled'])) {
            return response()->json(['call' => $this->shapeCall($call, $user->id)]);
        }

        $now = Carbon::now();
        $duration = 0;
        if ($call->started_at) {
            $duration = (int) $call->started_at->diffInSeconds($now);
        }

        $newStatus = $call->status === 'ringing' ? 'cancelled' : 'ended';

        $call->update([
            'status' => $newStatus,
            'ended_at' => $now,
            'duration_seconds' => $duration,
        ]);

        // Add summary chat message
        $formattedDuration = $call->formatted_duration;
        $chatMsg = $newStatus === 'cancelled'
            ? '📞 مكالمة صوتية ملغاة'
            : "📞 مكالمة صوتية ({$formattedDuration})";

        $this->addCallChatMessage($call, $chatMsg);

        return response()->json([
            'call' => $this->shapeCall($call->fresh(), $user->id)
        ]);
    }

    /**
     * Fetch call details by ID (for polling).
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $call = Call::with(['caller', 'receiver'])->find($id);

        if (!$call) {
            return response()->json(['message' => 'المكالمة غير موجودة'], 404);
        }

        if ($call->caller_id !== $user->id && $call->receiver_id !== $user->id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        return response()->json([
            'call' => $this->shapeCall($call, $user->id)
        ]);
    }

    private function addCallChatMessage(Call $call, string $body)
    {
        $ownerId = $this->getOwnerId($call->callable);
        $participantId = $call->caller_id === $ownerId ? $call->receiver_id : $call->caller_id;

        Message::create([
            'messageable_id' => $call->callable_id,
            'messageable_type' => $call->callable_type,
            'participant_id' => $participantId,
            'sender_id' => $call->caller_id,
            'body' => $body,
        ]);
    }

    private function shapeCall(Call $call, int $currentUserId): array
    {
        $isCaller = $call->caller_id === $currentUserId;
        $otherUser = $isCaller ? $call->receiver : $call->caller;

        return [
            'id' => $call->id,
            'caller_id' => $call->caller_id,
            'receiver_id' => $call->receiver_id,
            'caller_name' => $call->caller?->display_name ?: $call->caller?->name ?: 'مستخدم',
            'receiver_name' => $call->receiver?->display_name ?: $call->receiver?->name ?: 'مستخدم',
            'other_user_name' => $otherUser?->display_name ?: $otherUser?->name ?: 'مستخدم',
            'callable_id' => $call->callable_id,
            'callable_type' => $call->callable_type === SeekerNeed::class ? 'need' : 'gift',
            'status' => $call->status,
            'sdp_offer' => $call->sdp_offer,
            'sdp_answer' => $call->sdp_answer,
            'caller_ice_candidates' => $call->caller_ice_candidates ?? [],
            'receiver_ice_candidates' => $call->receiver_ice_candidates ?? [],
            'started_at' => optional($call->started_at)->toIso8601String(),
            'ended_at' => optional($call->ended_at)->toIso8601String(),
            'duration_seconds' => $call->duration_seconds,
            'formatted_duration' => $call->formatted_duration,
            'is_caller' => $isCaller,
        ];
    }
}
