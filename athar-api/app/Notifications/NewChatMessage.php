<?php

namespace App\Notifications;

use App\Models\Message;
use App\Models\SeekerNeed;
use App\Models\KhatmaGift;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

/**
 * Stored via database channel and broadcast live over WebSockets for SPA header bell.
 */
class NewChatMessage extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    public function __construct(private Message $message, private bool $firstContact = false)
    {
    }

    /**
     * Database + Broadcast channels.
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Payload consumed by the SPA header bell.
     */
    public function toDatabase(object $notifiable): array
    {
        $this->message->loadMissing(['sender', 'messageable.gift']);
        $sender = $this->message->sender;
        $messageable = $this->message->messageable;

        $type = $this->message->messageable_type === SeekerNeed::class ? 'need' : 'gift';

        return [
            'kind' => $this->firstContact ? 'new_participant' : 'new_message',
            'message_id' => $this->message->id,
            'type' => $type,
            'item_id' => $this->message->messageable_id,
            'participant_id' => $this->message->participant_id,
            'sender_id' => $this->message->sender_id,
            'sender_name' => $sender?->display_name ?: $sender?->name,
            'item_title' => $messageable?->gift?->name,
            'excerpt' => mb_strimwidth($this->message->body, 0, 80, '…'),
        ];
    }

    /**
     * Real-time broadcast payload.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toDatabase($notifiable));
    }
}
