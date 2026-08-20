<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Gift;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_khatma_validation_requires_completion_date()
    {
        $user = User::factory()->create(['role' => 'khatma', 'email_verified_at' => now()]);
        $token = $user->createToken('test-token', ['khatma:create'])->plainTextToken;
        $gift = Gift::factory()->create();

        $response = $this->withToken($token)->postJson('/api/khatmas', [
            'gift_ids' => [$gift->id],
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['completion_date']);
    }

    public function test_khatma_creation_persists_valid_khatma()
    {
        $user = User::factory()->create(['role' => 'khatma', 'email_verified_at' => now()]);
        $token = $user->createToken('test-token', ['khatma:create'])->plainTextToken;
        $gift = Gift::factory()->create();

        $response = $this->withToken($token)->postJson('/api/khatmas', [
            'completion_date' => now()->addDays(7)->toDateString(),
            'gift_ids' => [$gift->id],
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('khatmas', [
            'user_id' => $user->id,
        ]);
        $this->assertDatabaseHas('khatma_gifts', [
            'gift_id' => $gift->id,
        ]);
    }

    public function test_khatma_validation_requires_gift_ids()
    {
        $user = User::factory()->create(['role' => 'khatma', 'email_verified_at' => now()]);
        $token = $user->createToken('test-token', ['khatma:create'])->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/khatmas', [
            'completion_date' => now()->addDays(7)->toDateString(),
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['gift_ids']);
    }

    public function test_khatma_validation_rejects_non_existent_gift_ids()
    {
        $user = User::factory()->create(['role' => 'khatma', 'email_verified_at' => now()]);
        $token = $user->createToken('test-token', ['khatma:create'])->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/khatmas', [
            'completion_date' => now()->addDays(7)->toDateString(),
            'gift_ids' => [99999],
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['gift_ids.0']);
    }

    public function test_need_validation_requires_gift_id()
    {
        $user = User::factory()->create(['role' => 'seeker', 'email_verified_at' => now()]);
        $token = $user->createToken('test-token', ['need:create'])->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/seeker-needs', [
            'description' => 'Test need',
            'city' => 'الرياض',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['gift_id']);
    }

    public function test_need_validation_requires_description()
    {
        $user = User::factory()->create(['role' => 'seeker', 'email_verified_at' => now()]);
        $token = $user->createToken('test-token', ['need:create'])->plainTextToken;

        $gift = Gift::factory()->create();

        $response = $this->withToken($token)->postJson('/api/seeker-needs', [
            'gift_id' => $gift->id,
            'city' => 'الرياض',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['description']);
    }

    public function test_email_validation_rejects_invalid_format()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'invalid-email',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'khatma',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    public function test_password_validation_requires_minimum_length()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => '123',
            'password_confirmation' => '123',
            'role' => 'khatma',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }

    public function test_password_validation_requires_confirmation()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'DifferentPassword!',
            'role' => 'khatma',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }

    public function test_name_validation_is_required()
    {
        $response = $this->postJson('/api/register', [
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'khatma',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name']);
    }

    public function test_role_validation_rejects_invalid_role()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'invalid_role',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['role']);
    }
}
