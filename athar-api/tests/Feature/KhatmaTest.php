<?php

namespace Tests\Feature;

use App\Models\Gift;
use App\Models\User;
use App\Models\Khatma;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class KhatmaTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_store_khatma()
    {
        $user = User::factory()->create(['role' => 'khatma', 'email_verified_at' => now()]);
        Sanctum::actingAs($user);

        $gift1 = Gift::create(['name' => 'Gift 1', 'slug' => 'gift-1', 'category' => 'test', 'icon' => 'test', 'description' => 'test']);
        $gift2 = Gift::create(['name' => 'Gift 2', 'slug' => 'gift-2', 'category' => 'test', 'icon' => 'test', 'description' => 'test']);

        $payload = [
            'completion_date' => now()->format('Y-m-d'),
            'type' => 'فردية',
            'gift_ids' => [$gift1->id, $gift2->id],
        ];

        $response = $this->postJson('/api/khatmas', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('message', 'Khatma recorded successfully');

        $this->assertDatabaseHas('khatmas', [
            'user_id' => $user->id,
            'status' => 'active',
        ]);

        $khatma = Khatma::where('user_id', $user->id)->first();
        $this->assertCount(2, $khatma->services);
    }

    public function test_guest_cannot_store_khatma()
    {
        $response = $this->postJson('/api/khatmas', []);
        $response->assertStatus(401);
    }
}
