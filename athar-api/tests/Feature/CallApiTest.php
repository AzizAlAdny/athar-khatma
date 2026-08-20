<?php

namespace Tests\Feature;

use App\Models\Call;
use App\Models\Gift;
use App\Models\Message;
use App\Models\SeekerNeed;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CallApiTest extends TestCase
{
    use RefreshDatabase;

    private function createParticipants(): array
    {
        $seeker = User::factory()->create(['role' => 'seeker', 'email_verified_at' => now()]);
        $khatma = User::factory()->create(['role' => 'khatma', 'email_verified_at' => now()]);

        $gift = Gift::factory()->create();
        $need = SeekerNeed::create([
            'user_id' => $seeker->id,
            'gift_id' => $gift->id,
            'description' => 'حاجة إلى معلمة قراءات',
            'city' => 'الرياض',
        ]);

        // Establish thread contact
        Message::create([
            'messageable_id' => $need->id,
            'messageable_type' => SeekerNeed::class,
            'participant_id' => $khatma->id,
            'sender_id' => $khatma->id,
            'body' => 'السلام عليكم ورجمة الله',
        ]);

        return [$seeker, $khatma, $need];
    }

    public function test_participant_can_initiate_call()
    {
        [$seeker, $khatma, $need] = $this->createParticipants();
        $token = $khatma->createToken('test-token', ['read', 'khatma:create'])->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/calls/initiate', [
            'receiver_id' => $seeker->id,
            'context_type' => 'need',
            'context_id' => $need->id,
            'sdp_offer' => 'v=0\r\no=- 12345 2 IN IP4 127.0.0.1',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('call.status', 'ringing')
            ->assertJsonPath('call.caller_id', $khatma->id)
            ->assertJsonPath('call.receiver_id', $seeker->id);

        $this->assertDatabaseHas('calls', [
            'caller_id' => $khatma->id,
            'receiver_id' => $seeker->id,
            'status' => 'ringing',
        ]);
    }

    public function test_receiver_can_accept_call()
    {
        [$seeker, $khatma, $need] = $this->createParticipants();
        $call = Call::create([
            'caller_id' => $khatma->id,
            'receiver_id' => $seeker->id,
            'callable_id' => $need->id,
            'callable_type' => SeekerNeed::class,
            'status' => 'ringing',
            'sdp_offer' => 'v=0\r\no=- 12345 2 IN IP4 127.0.0.1',
        ]);

        $seekerToken = $seeker->createToken('test-token', ['read'])->plainTextToken;

        $response = $this->withToken($seekerToken)->postJson("/api/calls/{$call->id}/respond", [
            'action' => 'accept',
            'sdp_answer' => 'v=0\r\no=- 67890 2 IN IP4 127.0.0.1',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('call.status', 'connected');

        $this->assertDatabaseHas('calls', [
            'id' => $call->id,
            'status' => 'connected',
        ]);
    }

    public function test_user_can_end_call()
    {
        [$seeker, $khatma, $need] = $this->createParticipants();
        $call = Call::create([
            'caller_id' => $khatma->id,
            'receiver_id' => $seeker->id,
            'callable_id' => $need->id,
            'callable_type' => SeekerNeed::class,
            'status' => 'connected',
            'started_at' => now()->subSeconds(125),
            'sdp_offer' => 'v=0',
            'sdp_answer' => 'v=0',
        ]);

        $token = $khatma->createToken('test-token', ['read'])->plainTextToken;

        $response = $this->withToken($token)->postJson("/api/calls/{$call->id}/end");

        $response->assertStatus(200)
            ->assertJsonPath('call.status', 'ended');

        $this->assertDatabaseHas('calls', [
            'id' => $call->id,
            'status' => 'ended',
        ]);

        $this->assertDatabaseHas('messages', [
            'messageable_id' => $need->id,
            'messageable_type' => SeekerNeed::class,
            'sender_id' => $khatma->id,
        ]);
    }

    public function test_unauthorized_user_cannot_initiate_call()
    {
        [$seeker, $khatma, $need] = $this->createParticipants();
        $stranger = User::factory()->create(['role' => 'khatma', 'email_verified_at' => now()]);
        $strangerToken = $stranger->createToken('test-token', ['read'])->plainTextToken;

        $response = $this->withToken($strangerToken)->postJson('/api/calls/initiate', [
            'receiver_id' => $seeker->id,
            'context_type' => 'need',
            'context_id' => $need->id,
            'sdp_offer' => 'v=0',
        ]);

        $response->assertStatus(403);
    }
}
