<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as BaseVerifyEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;

class VerifyEmail extends BaseVerifyEmail
{
    use Queueable;

    /**
     * Build the verification URL pointing to the first-party SPA frontend,
     * which then calls the API verification endpoint to mark the email verified.
     */
    protected function verificationUrl($notifiable): string
    {
        $apiUrl = URL::temporarySignedRoute(
            'api.verification.verify',
            Carbon::now()->addMinutes(config('auth.verification.expire', 60)),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );

        // Parse the API URL and forward the signature + expiry as query params
        // to the frontend verify page, so the SPA can trigger the API call.
        $frontend = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/');
        $query = parse_url($apiUrl, PHP_URL_QUERY);

        return $frontend . '/auth/verify?' . $query;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable): MailMessage
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        return $this->buildMailMessage($verificationUrl)
            ->subject('تحققي من بريدكِ الإلكتروني | ختمة وأثر')
            ->line('يرجى الضغط على الزر أدناه للتحقق من بريدكِ الإلكتروني وإتمام إنشاء حسابكِ.');
    }
}
