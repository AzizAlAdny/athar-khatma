<?php

namespace Tests\Feature;

use App\Models\Gift;
use App\Models\User;
use App\Models\Khatma;
use App\Models\KhatmaGift;
use App\Models\SeekerNeed;
use App\Models\Review;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class KhatmaTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_store_khatma()
    {
        $user = User::factory()->create(['role' => 'khatma', 'email_verified_at' => now()]);
        Sanctum::actingAs($user, ['khatma:create']);

        $gift1 = Gift::create(['name' => 'Gift 1', 'slug' => 'gift-1', 'category' => 'test', 'icon' => 'test', 'description' => 'test']);
        $gift2 = Gift::create(['name' => 'Gift 2', 'slug' => 'gift-2', 'category' => 'test', 'icon' => 'test', 'description' => 'test']);

        $payload = [
            'completion_date' => now()->format('Y-m-d'),
            'gift_ids' => [$gift1->id, $gift2->id],
        ];

        $response = $this->postJson('/api/khatmas', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('message', 'تم تسجيل الختمة بنجاح');

        $this->assertDatabaseHas('khatmas', [
            'user_id' => $user->id,
            'status' => 'active',
        ]);

        $khatma = Khatma::where('user_id', $user->id)->first();
        $this->assertCount(2, $khatma->khatmaGifts);
        $this->assertSame(0, $khatma->impact_score);
        foreach ($khatma->khatmaGifts as $gift) {
            $this->assertSame(0, $gift->points_earned);
            $this->assertSame('pending', $gift->status);
        }
    }

    public function test_guest_cannot_store_khatma()
    {
        $response = $this->postJson('/api/khatmas', []);
        $response->assertStatus(401);
    }

    public function test_completing_seeker_need_awards_impact_points_to_khatma_user()
    {
        $khatmaUser = User::factory()->create(['role' => 'khatma', 'email_verified_at' => now()]);
        $seekerUser = User::factory()->create(['role' => 'seeker', 'email_verified_at' => now()]);
        $gift = Gift::create(['name' => 'Quran gift', 'slug' => 'quran-gift', 'category' => 'quran', 'icon' => 'book', 'description' => 'test']);

        $need = SeekerNeed::create([
            'user_id' => $seekerUser->id,
            'gift_id' => $gift->id,
            'description' => 'Need help learning Quran',
            'status' => 'in_progress',
            'fulfilled_by_id' => $khatmaUser->id,
            'points_earned' => 0,
        ]);

        Sanctum::actingAs($khatmaUser, ['*']);

        $response = $this->postJson("/api/seeker-needs/{$need->id}/fulfilled");

        $response->assertStatus(200);
        $this->assertSame(10, $need->fresh()->points_earned);
        $this->assertSame('fulfilled', $need->fresh()->status);
        $this->assertSame($khatmaUser->id, $need->fresh()->fulfilled_by_id);

        // Check user profile impact score includes the 10 points
        $profileResponse = $this->getJson("/api/users/{$khatmaUser->id}/profile");
        $profileResponse->assertStatus(200)
            ->assertJsonPath('impact_score', 10);
    }

    public function test_marking_khatma_gift_delivered_awards_points_and_syncs_khatma_impact()
    {
        $khatmaUser = User::factory()->create(['role' => 'khatma', 'email_verified_at' => now()]);
        $seekerUser = User::factory()->create(['role' => 'seeker', 'email_verified_at' => now()]);
        $gift = Gift::create(['name' => 'Gift 1', 'slug' => 'gift-1', 'category' => 'test', 'icon' => 'test', 'description' => 'test']);

        $khatma = Khatma::create([
            'user_id' => $khatmaUser->id,
            'completion_date' => now()->format('Y-m-d'),
            'impact_score' => 0,
            'status' => 'active',
        ]);

        $khatmaGift = KhatmaGift::create([
            'khatma_id' => $khatma->id,
            'gift_id' => $gift->id,
            'status' => 'in_progress',
            'delivered_to_id' => $seekerUser->id,
            'points_earned' => 0,
        ]);

        Sanctum::actingAs($khatmaUser, ['*']);

        $response = $this->postJson("/api/khatma-gifts/{$khatmaGift->id}/delivered");

        $response->assertStatus(200);
        $this->assertSame(10, $khatmaGift->fresh()->points_earned);
        $this->assertSame('delivered', $khatmaGift->fresh()->status);
        $this->assertSame(10, $khatma->fresh()->impact_score);
    }

    public function test_submitting_review_adds_bonus_points()
    {
        $khatmaUser = User::factory()->create(['role' => 'khatma', 'email_verified_at' => now()]);
        $seekerUser = User::factory()->create(['role' => 'seeker', 'email_verified_at' => now()]);
        $gift = Gift::create(['name' => 'Gift 1', 'slug' => 'gift-1', 'category' => 'test', 'icon' => 'test', 'description' => 'test']);

        $need = SeekerNeed::create([
            'user_id' => $seekerUser->id,
            'gift_id' => $gift->id,
            'description' => 'Need help learning Quran',
            'status' => 'fulfilled',
            'fulfilled_at' => now(),
            'fulfilled_by_id' => $khatmaUser->id,
            'points_earned' => 10,
        ]);

        Sanctum::actingAs($seekerUser, ['*']);

        // Seeker gives 5 star review (5 * 2 = 10 bonus points, total = 10 + 10 = 20)
        $response = $this->postJson('/api/reviews', [
            'reviewable_id' => $need->id,
            'reviewable_type' => 'need',
            'rating' => 5,
            'comment' => 'جزاكِ الله خيراً',
        ]);

        $response->assertStatus(201);
        $this->assertSame(20, $need->fresh()->points_earned);

        // Check user profile impact score
        Sanctum::actingAs($khatmaUser, ['*']);
        $profileResponse = $this->getJson("/api/users/{$khatmaUser->id}/profile");
        $profileResponse->assertStatus(200)
            ->assertJsonPath('impact_score', 20);
    }
}
