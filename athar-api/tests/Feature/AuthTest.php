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
            'phone_number' => '0512345678',
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
                    'id', 'name', 'email', 'phone_number', 'role', 'city', 'latitude', 'longitude'
                ]
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'phone_number' => '0512345678',
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
            'phone_number' => '0587654321',
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
            'phone_number' => '0587654321',
            'role' => 'seeker',
            'pledge_accepted' => true,
        ]);

        $user = User::where('email', 'seeker@example.com')->first();
        $this->assertDatabaseMissing('khatmas', [
            'user_id' => $user->id,
        ]);
    }

    public function test_registration_fails_without_phone_number()
    {
        $payload = [
            'name' => 'No Phone User',
            'email' => 'nophone@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'khatma',
            'pledge_accepted' => true,
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone_number']);
    }

    public function test_registration_fails_with_invalid_phone_number()
    {
        $payload = [
            'name' => 'Bad Phone User',
            'email' => 'badphone@example.com',
            'phone_number' => '123456789',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'khatma',
            'pledge_accepted' => true,
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone_number']);
    }

    public function test_registration_fails_with_duplicate_phone_number()
    {
        User::factory()->create([
            'email' => 'user1@example.com',
            'phone_number' => '0511112222',
        ]);

        $payload = [
            'name' => 'Duplicate Phone User',
            'email' => 'user2@example.com',
            'phone_number' => '0511112222',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'khatma',
            'pledge_accepted' => true,
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone_number']);
    }
}
