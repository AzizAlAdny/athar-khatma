<?php

namespace App\Notifications;

use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Stored via the database channel and rendered by the header bell. The first
 * contact from a khatma user towards a need is flagged as "new_participant" so
 * the need owner sees it as a new interested khatma; everything else is a plain
 * "new_message".
 */
class NewChatMessage extends Notification
{
    use Queueable;

    public function __construct(private Message $message, private bool $firstContact = false)
    {
    }

    /**
     * In-app only (database channel); no e-mail or queue worker required.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Payload consumed by the SPA header bell.
     *
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        $this->message->loadMissing(['sender', 'need.gift']);
        $sender = $this->message->sender;

        return [
            'kind' => $this->firstContact ? 'new_participant' : 'new_message',
            'message_id' => $this->message->id,
            'need_id' => $this->message->need_id,
            'participant_id' => $this->message->participant_id,
            'sender_id' => $this->message->sender_id,
            'sender_name' => $sender?->display_name ?: $sender?->name,
            'need_title' => $this->message->need?->gift?->name,
            'excerpt' => mb_strimwidth($this->message->body, 0, 80, '…'),
        ];
    }
}
