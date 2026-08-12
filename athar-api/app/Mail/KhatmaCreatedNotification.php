<?php

namespace App\Mail;

use App\Models\Khatma;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;

class KhatmaCreatedNotification extends Mailable
{
    use Queueable;

    public $khatma;

    public function __construct(Khatma $khatma)
    {
        $this->khatma = $khatma;
    }

    public function envelope(): array
    {
        return [
            'subject' => 'تم تسجيل ختمتك بنجاح - Your Khatma Registration',
        ];
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.khatma_created',
            with: [
                'khatma' => $this->khatma,
                'user' => $this->khatma->user,
            ],
        );
    }
}
