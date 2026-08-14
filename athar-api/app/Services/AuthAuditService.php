<?php

namespace App\Services;

use App\Models\AuthEvent;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AuthAuditService
{
    /**
     * Record an authentication-related event.
     */
    public function record(string $event, ?User $user, Request $request, array $context = []): void
    {
        try {
            AuthEvent::create([
                'user_id' => $user?->id,
                'event' => $event,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'context' => $context,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to record auth event', [
                'event' => $event,
                'user_id' => $user?->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
