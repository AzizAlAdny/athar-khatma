<?php

namespace Tests\Feature;

use App\Models\Gift;
use App\Models\User;
use App\Models\Khatma;
use App\Models\KhatmaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_as_khatma()
    {
        $payload = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'role' => 'khatma',
            'city' => 'Riyadh',
            'lat' => 24.7136,
            'lng' => 46.6753,
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'access_token',
                'token_type',
                'user' => [
                    'id', 'name', 'email', 'role', 'city', 'latitude', 'longitude'
                ]
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'role' => 'khatma',
            'city' => 'Riyadh',
            'latitude' => 24.7136,
            'longitude' => 46.6753,
        ]);

        $user = User::where('email', 'test@example.com')->first();
        $this->assertDatabaseMissing('khatmas', [
            'user_id' => $user->id,
        ]);
    }

    public function test_user_can_register_as_seeker_without_gift()
    {
        $payload = [
            'name' => 'Seeker User',
            'email' => 'seeker@example.com',
            'password' => 'password123',
            'role' => 'seeker',
            'city' => 'Jeddah',
            'lat' => 21.4858,
            'lng' => 39.1925,
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'email' => 'seeker@example.com',
            'role' => 'seeker',
        ]);

        $user = User::where('email', 'seeker@example.com')->first();
        $this->assertDatabaseMissing('khatmas', [
            'user_id' => $user->id,
        ]);
    }
}
