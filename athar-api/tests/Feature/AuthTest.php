<?php

namespace Tests\Feature;

use App\Models\Gift;
use App\Models\User;
use App\Models\Khatma;
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
            'password_confirmation' => 'password123',
            'role' => 'khatma',
            'city' => 'Riyadh',
            'lat' => 24.7136,
            'lng' => 46.6753,
            'pledge_accepted' => true,
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
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
            'pledge_accepted' => true,
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
            'password_confirmation' => 'password123',
            'role' => 'seeker',
            'city' => 'Jeddah',
            'lat' => 21.4858,
            'lng' => 39.1925,
            'pledge_accepted' => true,
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'email' => 'seeker@example.com',
            'role' => 'seeker',
            'pledge_accepted' => true,
        ]);

        $user = User::where('email', 'seeker@example.com')->first();
        $this->assertDatabaseMissing('khatmas', [
            'user_id' => $user->id,
        ]);
    }
}
