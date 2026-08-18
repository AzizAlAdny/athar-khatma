<?php

namespace App\Mail;

use App\Models\SeekerNeed;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;

class NeedCreatedNotification extends Mailable
{
    use Queueable;

    public $need;

    public function __construct(SeekerNeed $need)
    {
        $this->need = $need;
    }

    public function envelope(): array
    {
        return [
            'subject' => 'تم تسجيل طلبك بنجاح - Your Need Registration',
        ];
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.need_created',
            with: [
                'need' => $this->need,
                'user' => $this->need->user,
            ],
        );
    }
}
