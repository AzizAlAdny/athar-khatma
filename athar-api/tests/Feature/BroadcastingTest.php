<?php

namespace Tests\Feature;

use App\Events\CallSignaled;
use App\Events\MessageSent;
use App\Models\Gift;
use App\Models\Message;
use App\Models\SeekerNeed;
use App\Models\User;
use App\Models\Call;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class BroadcastingTest extends TestCase
{
    use RefreshDatabase;

    private function createUsers(): array
    {
        $owner = User::factory()->create(['role' => 'seeker', 'email_verified_at' => now()]);
        $ownerToken = $owner->createToken('owner-token', ['read', 'need:create'])->plainTextToken;

        $khatma = User::factory()->create(['role' => 'khatma', 'email_verified_at' => now()]);
        $khatmaToken = $khatma->createToken('khatma-token', ['read', 'khatma:create'])->plainTextToken;

        $gift = Gift::factory()->create();
        $need = SeekerNeed::create([
            'user_id' => $owner->id,
            'gift_id' => $gift->id,
            'description' => 'طلب مساعدة في الحفظ',
            'city' => 'الرياض',
            'status' => 'open',
        ]);

        return [$owner, $ownerToken, $khatma, $khatmaToken, $need];
    }

    public function test_message_sent_event_is_dispatched_on_chat_store()
    {
        Event::fake([MessageSent::class]);

        [$owner, $ownerToken, $khatma, $khatmaToken, $need] = $this->createUsers();

        $response = $this->withToken($khatmaToken)->postJson("/api/chat/need/{$need->id}/messages", [
            'body' => 'السلام عليكم، أنا مستعدة للمساعدة',
        ]);

        $response->assertStatus(201);

        Event::assertDispatched(MessageSent::class, function ($event) use ($khatma, $need) {
            return $event->message->sender_id === $khatma->id
                && $event->message->messageable_id === $need->id
                && $event->broadcastAs() === 'message.sent';
        });
    }

    public function test_call_signaled_event_is_dispatched_on_call_initiate()
    {
        Event::fake([CallSignaled::class]);

        [$owner, $ownerToken, $khatma, $khatmaToken, $need] = $this->createUsers();

        // Seed message so thread participation is validated
        Message::create([
            'messageable_id' => $need->id,
            'messageable_type' => SeekerNeed::class,
            'participant_id' => $khatma->id,
            'sender_id' => $khatma->id,
            'body' => 'محادثة أولية',
        ]);

        $response = $this->withToken($khatmaToken)->postJson('/api/calls/initiate', [
            'receiver_id' => $owner->id,
            'context_type' => 'need',
            'context_id' => $need->id,
            'sdp_offer' => json_encode(['type' => 'offer', 'sdp' => 'v=0...']),
        ]);

        $response->assertStatus(201);

        Event::assertDispatched(CallSignaled::class, function ($event) use ($owner) {
            return $event->targetUserId === $owner->id
                && $event->action === 'incoming_call'
                && $event->broadcastAs() === 'call.signaled';
        });
    }

    public function test_call_signaled_event_is_dispatched_on_call_respond()
    {
        Event::fake([CallSignaled::class]);

        [$owner, $ownerToken, $khatma, $khatmaToken, $need] = $this->createUsers();

        $call = Call::create([
            'caller_id' => $khatma->id,
            'receiver_id' => $owner->id,
            'callable_id' => $need->id,
            'callable_type' => SeekerNeed::class,
            'status' => 'ringing',
            'sdp_offer' => 'sdp-offer-string',
        ]);

        $respondResponse = $this->withToken($ownerToken)->postJson("/api/calls/{$call->id}/respond", [
            'action' => 'accept',
            'sdp_answer' => 'sdp-answer-string',
        ]);

        $respondResponse->assertStatus(200);

        Event::assertDispatched(CallSignaled::class, function ($event) use ($khatma) {
            return $event->targetUserId === $khatma->id && $event->action === 'call_answered';
        });
    }

    public function test_call_signaled_event_is_dispatched_on_call_end()
    {
        Event::fake([CallSignaled::class]);

        [$owner, $ownerToken, $khatma, $khatmaToken, $need] = $this->createUsers();

        $call = Call::create([
            'caller_id' => $khatma->id,
            'receiver_id' => $owner->id,
            'callable_id' => $need->id,
            'callable_type' => SeekerNeed::class,
            'status' => 'connected',
            'sdp_offer' => 'sdp-offer-string',
            'sdp_answer' => 'sdp-answer-string',
            'started_at' => now()->subMinute(),
        ]);

        $endResponse = $this->withToken($khatmaToken)->postJson("/api/calls/{$call->id}/end");

        $endResponse->assertStatus(200);

        Event::assertDispatched(CallSignaled::class, function ($event) use ($owner) {
            return $event->targetUserId === $owner->id && $event->action === 'call_ended';
        });
    }

    public function test_authorized_user_can_authenticate_private_channel()
    {
        config([
            'broadcasting.default' => 'pusher',
            'broadcasting.connections.pusher.key' => 'test-key',
            'broadcasting.connections.pusher.secret' => 'test-secret',
            'broadcasting.connections.pusher.app_id' => 'test-app-id',
        ]);

        [$owner, $ownerToken, $khatma, $khatmaToken, $need] = $this->createUsers();

        $response = $this->withToken($ownerToken)->postJson('/api/broadcasting/auth', [
            'channel_name' => "private-App.Models.User.{$owner->id}",
            'socket_id' => '1234.5678',
        ]);

        if ($response->status() !== 200) {
            dump([
                'status' => $response->status(),
                'content' => $response->content(),
                'json' => $response->json(),
                'owner_id' => $owner->id,
            ]);
        }

        $response->assertStatus(200);
        $this->assertArrayHasKey('auth', $response->json());
    }

    public function test_unauthorized_user_is_forbidden_from_other_private_channel()
    {
        config([
            'broadcasting.default' => 'pusher',
            'broadcasting.connections.pusher.key' => 'test-key',
            'broadcasting.connections.pusher.secret' => 'test-secret',
            'broadcasting.connections.pusher.app_id' => 'test-app-id',
        ]);

        [$owner, $ownerToken, $khatma, $khatmaToken, $need] = $this->createUsers();

        $response = $this->withToken($khatmaToken)->postJson('/api/broadcasting/auth', [
            'channel_name' => "private-App.Models.User.{$owner->id}",
            'socket_id' => '1234.5678',
        ]);

        $response->assertStatus(403);
    }
}
