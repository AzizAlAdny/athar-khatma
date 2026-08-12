<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Khatma;
use App\Models\Gift;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_admin_routes()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/stats');

        $response->assertStatus(200);
    }

    public function test_khatma_can_create_khatma()
    {
        $khatma = User::factory()->create(['role' => 'khatma']);
        $gift = Gift::factory()->create();
        $token = $khatma->createToken('test-token')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/khatmas', [
            'completion_date' => now()->addDays(7)->toDateString(),
            'type' => 'فردية',
            'gift_ids' => [$gift->id],
        ]);

        $response->assertStatus(201);
    }

    public function test_seeker_cannot_create_khatma()
    {
        $seeker = User::factory()->create(['role' => 'seeker']);
        $gift = Gift::factory()->create();
        $token = $seeker->createToken('test-token')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/khatmas', [
            'completion_date' => now()->addDays(7)->toDateString(),
            'type' => 'فردية',
            'gift_ids' => [$gift->id],
        ]);

        $response->assertStatus(403);
    }

    public function test_user_can_view_own_profile()
    {
        $user = User::factory()->create(['role' => 'khatma']);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withToken($token)->getJson("/api/users/{$user->id}/profile");

        $response->assertStatus(200);
    }

    public function test_user_cannot_view_other_users_profile()
    {
        $user1 = User::factory()->create(['role' => 'khatma']);
        $user2 = User::factory()->create(['role' => 'khatma']);
        $token = $user1->createToken('test-token')->plainTextToken;

        $response = $this->withToken($token)->getJson("/api/users/{$user2->id}/profile");

        $response->assertStatus(403);
    }

    public function test_admin_can_view_any_profile()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'khatma']);
        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withToken($token)->getJson("/api/users/{$user->id}/profile");

        $response->assertStatus(200);
    }
}
