<?php

namespace App\Services;

use App\Models\User;
use App\Models\Khatma;
use App\Models\Need;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\KhatmaCreatedNotification;
use App\Mail\NeedCreatedNotification;

class NotificationService
{
    /**
     * Send notification when a khatma is created
     */
    public function notifyKhatmaCreated(Khatma $khatma)
    {
        try {
            // Send email to the user
            Mail::to($khatma->user->email)->send(new KhatmaCreatedNotification($khatma));

            Log::info('Khatma creation notification sent', [
                'khatma_id' => $khatma->id,
                'user_email' => $khatma->user->email,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send khatma notification', [
                'khatma_id' => $khatma->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send notification when a need is created
     */
    public function notifyNeedCreated(Need $need)
    {
        try {
            // Send email to the user
            Mail::to($need->user->email)->send(new NeedCreatedNotification($need));

            Log::info('Need creation notification sent', [
                'need_id' => $need->id,
                'user_email' => $need->user->email,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send need notification', [
                'need_id' => $need->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send notification to admins about new user registration
     */
    public function notifyAdminNewUser(User $user)
    {
        try {
            Log::info('New user registered', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_role' => $user->role,
            ]);
            // Email notification can be added later when needed
        } catch (\Exception $e) {
            Log::error('Failed to log new user notification', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
