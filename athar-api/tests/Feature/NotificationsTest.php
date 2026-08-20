<?php

namespace Tests\Feature;

use App\Models\Gift;
use App\Models\Message;
use App\Models\SeekerNeed;
use App\Models\User;
use App\Notifications\NewChatMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationsTest extends TestCase
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

    private function seedThreadMessage($need, int $participantId, string $body = 'مرحباً'): Message
    {
        return Message::create([
            'messageable_id' => $need->id,
            'messageable_type' => SeekerNeed::class,
            'participant_id' => $participantId,
            'sender_id' => $participantId,
            'body' => $body,
        ]);
    }

    public function test_first_message_from_khatma_notifies_owner_as_new_participant()
    {
        [$seeker, $need] = $this->createSeekerWithNeed();
        [$khatma, $token] = $this->createKhatma();

        $this->withToken($token)->postJson("/api/chat/need/{$need->id}/messages", [
            'body' => 'مرحباً، أرغب بتقديم العطاء',
        ])->assertStatus(201);

        $notifications = $seeker->notifications()->get();
        $this->assertCount(1, $notifications);
        $this->assertSame('new_participant', $notifications->first()->data['kind']);
        $this->assertSame($need->id, $notifications->first()->data['item_id']);
        $this->assertNull($notifications->first()->read_at);
    }

    public function test_subsequent_khatma_message_notifies_as_new_message()
    {
        [$seeker, $need] = $this->createSeekerWithNeed();
        [$khatma, $token] = $this->createKhatma();
        $this->seedThreadMessage($need, $khatma->id);

        $this->withToken($token)->postJson("/api/chat/need/{$need->id}/messages", [
            'body' => 'رسالة متابعة',
        ])->assertStatus(201);

        $notifications = $seeker->notifications()->get();
        $this->assertCount(1, $notifications);
        $this->assertSame('new_message', $notifications->first()->data['kind']);
    }

    public function test_owner_reply_notifies_participant_as_new_message()
    {
        [$seeker, $need] = $this->createSeekerWithNeed();
        [$khatma] = $this->createKhatma();
        $this->seedThreadMessage($need, $khatma->id);

        $ownerToken = $seeker->createToken('owner-token', ['read'])->plainTextToken;
        $this->withToken($ownerToken)->postJson("/api/chat/need/{$need->id}/messages", [
            'body' => 'أهلاً بكِ، متى يناسبكِ؟',
            'participant_id' => $khatma->id,
        ])->assertStatus(201);

        $notifications = $khatma->notifications()->get();
        $this->assertCount(1, $notifications);
        $this->assertSame('new_message', $notifications->first()->data['kind']);
    }

    public function test_index_unread_count_and_mark_read_flow()
    {
        [$seeker, $need] = $this->createSeekerWithNeed();
        [$khatma] = $this->createKhatma();
        $seeker->notify(new NewChatMessage($this->seedThreadMessage($need, $khatma->id), true));

        $token = $seeker->createToken('list-token', ['read'])->plainTextToken;

        $this->withToken($token)->getJson('/api/notifications/unread-count')
            ->assertStatus(200)
            ->assertJsonPath('unread', 1);

        $list = $this->withToken($token)->getJson('/api/notifications');
        $list->assertStatus(200)->assertJsonCount(1);
        $this->assertSame('new_participant', $list->json('0.kind'));

        $this->withToken($token)->postJson("/api/notifications/{$list->json('0.id')}/read")
            ->assertStatus(200);

        $this->withToken($token)->getJson('/api/notifications/unread-count')
            ->assertJsonPath('unread', 0);
    }

    public function test_mark_all_read()
    {
        [$seeker, $need] = $this->createSeekerWithNeed();
        [$khatma] = $this->createKhatma();
        $message = $this->seedThreadMessage($need, $khatma->id);
        $seeker->notify(new NewChatMessage($message, true));
        $seeker->notify(new NewChatMessage($message, false));

        $token = $seeker->createToken('all-token', ['read'])->plainTextToken;

        $this->withToken($token)->getJson('/api/notifications/unread-count')
            ->assertJsonPath('unread', 2);

        $this->withToken($token)->postJson('/api/notifications/read-all')
            ->assertStatus(200);

        $this->withToken($token)->getJson('/api/notifications/unread-count')
            ->assertJsonPath('unread', 0);
    }

    public function test_user_cannot_mark_someone_elses_notification()
    {
        [$seeker, $need] = $this->createSeekerWithNeed();
        [$khatma] = $this->createKhatma();
        $seeker->notify(new NewChatMessage($this->seedThreadMessage($need, $khatma->id), true));
        $id = $seeker->notifications()->firstOrFail()->id;

        $other = User::factory()->create(['role' => 'khatma', 'email_verified_at' => now()]);
        $otherToken = $other->createToken('other-token', ['read'])->plainTextToken;

        $this->withToken($otherToken)->postJson("/api/notifications/{$id}/read")
            ->assertStatus(404);

        $this->assertNull($seeker->notifications()->firstOrFail()->read_at);
    }

    public function test_guests_cannot_access_notifications()
    {
        $this->getJson('/api/notifications')->assertStatus(401);
        $this->getJson('/api/notifications/unread-count')->assertStatus(401);
        $this->postJson('/api/notifications/read-all')->assertStatus(401);
    }
}
