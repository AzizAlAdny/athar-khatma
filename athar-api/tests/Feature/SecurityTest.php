<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Khatma;
use App\Models\Gift;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_cannot_access_other_users_khatma()
    {
        $user1 = User::factory()->create(['role' => 'khatma', 'email_verified_at' => now()]);
        $user2 = User::factory()->create(['role' => 'khatma', 'email_verified_at' => now()]);

        $khatma = Khatma::factory()->create([
            'user_id' => $user2->id,
            'completion_date' => now()->addDays(7),
            'status' => 'active',
            'impact_score' => 20,
        ]);

        $token = $user1->createToken('test-token', ['khatma:create'])->plainTextToken;

        $response = $this->withToken($token)->getJson("/api/khatmas/{$khatma->id}");

        $response->assertStatus(403);
    }

    public function test_user_can_access_own_khatma()
    {
        $user = User::factory()->create(['role' => 'khatma', 'email_verified_at' => now()]);

        $khatma = Khatma::factory()->create([
            'user_id' => $user->id,
            'completion_date' => now()->addDays(7),
            'status' => 'active',
            'impact_score' => 20,
        ]);

        $token = $user->createToken('test-token', ['khatma:create'])->plainTextToken;

        $response = $this->withToken($token)->getJson("/api/khatmas/{$khatma->id}");

        $response->assertStatus(200);
    }

    public function test_admin_can_access_any_khatma()
    {
        $admin = User::factory()->create(['role' => 'admin', 'email_verified_at' => now()]);
        $user = User::factory()->create(['role' => 'khatma', 'email_verified_at' => now()]);

        $khatma = Khatma::factory()->create([
            'user_id' => $user->id,
            'completion_date' => now()->addDays(7),
            'status' => 'active',
            'impact_score' => 20,
        ]);

        $token = $admin->createToken('test-token', ['*'])->plainTextToken;

        $response = $this->withToken($token)->getJson("/api/khatmas/{$khatma->id}");

        $response->assertStatus(200);
    }

    public function test_user_cannot_access_other_users_profile()
    {
        $user1 = User::factory()->create(['role' => 'khatma', 'email_verified_at' => now()]);
        $user2 = User::factory()->create(['role' => 'khatma', 'email_verified_at' => now()]);

        $token = $user1->createToken('test-token', ['khatma:create'])->plainTextToken;

        $response = $this->withToken($token)->getJson("/api/users/{$user2->id}/profile");

        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_access_protected_routes()
    {
        $response = $this->getJson('/api/khatmas');
        $response->assertStatus(401);

        $response = $this->getJson('/api/user');
        $response->assertStatus(401);
    }

    public function test_registration_prevents_admin_role_assignment()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'admin',
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseMissing('users', [
            'email' => 'test@example.com',
            'role' => 'admin',
        ]);
    }

    public function test_mass_assignment_prevention_in_need_creation()
    {
        $user = User::factory()->create(['role' => 'seeker', 'email_verified_at' => now()]);
        $gift = Gift::factory()->create();
        $token = $user->createToken('test-token', ['need:create'])->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/seeker-needs', [
            'gift_id' => $gift->id,
            'description' => 'Test need',
            'city' => 'الرياض',
            'latitude' => 24.7136,
            'longitude' => 46.6753,
            'status' => 'fulfilled', // Attempt to override status
            'user_id' => 999, // Attempt to override user_id
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('seeker_needs', [
            'user_id' => $user->id, // Should use authenticated user's ID
            'status' => 'open', // Should use default status
        ]);
    }
}
