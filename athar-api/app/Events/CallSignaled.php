<?php

namespace App\Events;

use App\Models\Call;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CallSignaled implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $targetUserId,
        public string $action,
        public array $payload = []
    ) {
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("call.{$this->targetUserId}"),
        ];
    }

    /**
     * Event name for frontend listener.
     */
    public function broadcastAs(): string
    {
        return 'call.signaled';
    }

    /**
     * Payload for frontend clients.
     */
    public function broadcastWith(): array
    {
        return [
            'action' => $this->action,
            'payload' => $this->payload,
            'timestamp' => now()->toISOString(),
        ];
    }
}
