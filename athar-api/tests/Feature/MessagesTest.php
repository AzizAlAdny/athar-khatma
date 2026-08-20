<?php

namespace Tests\Feature;

use App\Models\Gift;
use App\Models\Message;
use App\Models\SeekerNeed;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessagesTest extends TestCase
{
    use RefreshDatabase;

    private function createSeekerWithNeed(): array
    {
        $seeker = User::factory()->create(['role' => 'seeker', 'email_verified_at' => now()]);
        $gift = Gift::factory()->create();
        $need = $seeker->seekerNeeds()->create([
            'gift_id' => $gift->id,
            'description' => 'أحتاج معلمة تحفيظ',
            'city' => 'الرياض',
        ]);

        return [$seeker, $need];
    }

    private function createKhatma(): array
    {
        $khatma = User::factory()->create(['role' => 'khatma', 'email_verified_at' => now()]);
        $token = $khatma->createToken('test-token', ['read'])->plainTextToken;
        return [$khatma, $token];
    }

    public function test_khatma_user_can_message_need_owner()
    {
        [$seeker, $need] = $this->createSeekerWithNeed();
        [$khatma, $token] = $this->createKhatma();

        $response = $this->withToken($token)->postJson("/api/chat/need/{$need->id}/messages", [
            'body' => 'مرحباً، أرغب بتقديم العطاء',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('messages', [
            'messageable_id' => $need->id,
            'messageable_type' => SeekerNeed::class,
            'participant_id' => $khatma->id,
            'sender_id' => $khatma->id,
        ]);
    }

    public function test_owner_can_read_participant_thread()
    {
        [$seeker, $need] = $this->createSeekerWithNeed();
        [$khatma, $token] = $this->createKhatma();
        Message::create([
            'messageable_id' => $need->id,
            'messageable_type' => SeekerNeed::class,
            'participant_id' => $khatma->id,
            'sender_id' => $khatma->id,
            'body' => 'رسالة من الخاتمة',
        ]);

        $ownerToken = $seeker->createToken('test-token', ['read'])->plainTextToken;
        $response = $this->withToken($ownerToken)
            ->getJson("/api/chat/need/{$need->id}/messages?participant={$khatma->id}");
        $response->assertStatus(200)->assertJsonCount(1);
    }

    public function test_participant_reads_own_thread()
    {
        [$seeker, $need] = $this->createSeekerWithNeed();
        [$khatma, $token] = $this->createKhatma();
        Message::create([
            'messageable_id' => $need->id,
            'messageable_type' => SeekerNeed::class,
            'participant_id' => $khatma->id,
            'sender_id' => $khatma->id,
            'body' => 'رسالة من الخاتمة',
        ]);

        $response = $this->withToken($token)->getJson("/api/chat/need/{$need->id}/messages");
        $response->assertStatus(200)->assertJsonCount(1);
    }

    public function test_owner_reply_requires_participant_id()
    {
        [$seeker, $need] = $this->createSeekerWithNeed();
        [$khatma, $token] = $this->createKhatma();
        Message::create([
            'messageable_id' => $need->id,
            'messageable_type' => SeekerNeed::class,
            'participant_id' => $khatma->id,
            'sender_id' => $khatma->id,
            'body' => 'مرحباً',
        ]);

        $ownerToken = $seeker->createToken('test-token', ['read'])->plainTextToken;
        $response = $this->withToken($ownerToken)->postJson(
            "/api/chat/need/{$need->id}/messages",
            ['body' => 'رد بدون تحديد الطرف الآخر']
        );

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['participant_id']);
    }

    public function test_owner_can_reply_in_thread()
    {
        [$seeker, $need] = $this->createSeekerWithNeed();
        [$khatma, $token] = $this->createKhatma();
        Message::create([
            'messageable_id' => $need->id,
            'messageable_type' => SeekerNeed::class,
            'participant_id' => $khatma->id,
            'sender_id' => $khatma->id,
            'body' => 'مرحباً',
        ]);

        $ownerToken = $seeker->createToken('test-token', ['read'])->plainTextToken;
        $response = $this->withToken($ownerToken)->postJson(
            "/api/chat/need/{$need->id}/messages",
            [
                'body' => 'أهلاً بكِ، متى يناسبكِ؟',
                'participant_id' => $khatma->id,
            ]
        );

        $response->assertStatus(201);
        $this->assertDatabaseHas('messages', [
            'messageable_id' => $need->id,
            'messageable_type' => SeekerNeed::class,
            'sender_id' => $seeker->id,
            'participant_id' => $khatma->id,
        ]);
    }

    public function test_other_users_cannot_read_a_thread_that_is_not_theirs()
    {
        [$seeker, $need] = $this->createSeekerWithNeed();
        [$khatma, $token] = $this->createKhatma();
        $intruder = User::factory()->create([
            'role' => 'khatma',
            'email_verified_at' => now(),
        ]);

        Message::create([
            'messageable_id' => $need->id,
            'messageable_type' => SeekerNeed::class,
            'participant_id' => $khatma->id,
            'sender_id' => $khatma->id,
            'body' => 'رسالة خاصة',
        ]);

        $intruderToken = $intruder->createToken('test-token', ['read'])->plainTextToken;
        $response = $this->withToken($intruderToken)->getJson("/api/chat/need/{$need->id}/messages");
        $response->assertStatus(200)->assertJsonCount(0);
    }

    public function test_message_body_is_required()
    {
        [$seeker, $need] = $this->createSeekerWithNeed();
        [$khatma, $token] = $this->createKhatma();

        $response = $this->withToken($token)->postJson("/api/chat/need/{$need->id}/messages", []);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['body']);
    }

    public function test_guests_cannot_message()
    {
        [$seeker, $need] = $this->createSeekerWithNeed();

        $this->postJson("/api/chat/need/{$need->id}/messages", ['body' => 'مرحباً'])
            ->assertStatus(401);
        $this->getJson("/api/chat/need/{$need->id}/messages")
            ->assertStatus(401);
    }
}
