<?php

namespace App\Events;

use App\Models\Message;
use App\Models\SeekerNeed;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Message $message)
    {
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        $type = $this->message->messageable_type === SeekerNeed::class ? 'need' : 'gift';
        $itemId = $this->message->messageable_id;
        $participantId = $this->message->participant_id;

        return [
            new PrivateChannel("chat.{$type}.{$itemId}.{$participantId}"),
        ];
    }

    /**
     * Event name for frontend listener.
     */
    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    /**
     * Payload for frontend clients.
     */
    public function broadcastWith(): array
    {
        $sender = $this->message->sender;

        return [
            'id' => $this->message->id,
            'messageable_id' => $this->message->messageable_id,
            'messageable_type' => $this->message->messageable_type === SeekerNeed::class ? 'need' : 'gift',
            'participant_id' => $this->message->participant_id,
            'sender_id' => $this->message->sender_id,
            'sender_name' => $sender?->display_name ?: $sender?->name,
            'body' => $this->message->body,
            'created_at' => $this->message->created_at?->toISOString() ?: now()->toISOString(),
        ];
    }
}
