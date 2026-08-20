<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Khatma;
use App\Models\Gift;
use App\Models\KhatmaGift;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_khatma_resource_returns_correct_structure()
    {
        $user = User::factory()->create(['role' => 'khatma', 'email_verified_at' => now()]);
        $gift = Gift::factory()->create();

        $khatma = Khatma::factory()->create([
            'user_id' => $user->id,
            'completion_date' => now()->addDays(7),
            'status' => 'active',
            'impact_score' => 20,
        ]);

        $token = $user->createToken('test-token', ['khatma:create'])->plainTextToken;

        $response = $this->withToken($token)->getJson("/api/khatmas/{$khatma->id}");

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'id',
            'user_id',
            'completion_date',
            'impact_score',
            'status',
            'created_at',
            'updated_at',
            'user' => [
                'name',
                'bio',
                'city',
            ],
            'achievements',
        ]);
    }

    public function test_user_resource_returns_correct_structure()
    {
        $user = User::factory()->create(['role' => 'khatma', 'email_verified_at' => now()]);
        $token = $user->createToken('test-token', ['khatma:create'])->plainTextToken;

        $response = $this->withToken($token)->getJson("/api/users/{$user->id}/profile");

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'id',
            'user' => [
                'name',
                'bio',
                'city',
                'role',
            ],
            'completion_date',
            'impact_score',
            'achievements',
            'needs',
        ]);
    }

    public function test_gift_resource_returns_correct_structure()
    {
        Gift::factory()->create();

        $response = $this->getJson('/api/gifts');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            '*' => [
                'id',
                'name',
                'description',
                'icon',
                'created_at',
                'updated_at',
            ],
        ]);
    }

    public function test_khatma_index_returns_resource_collection()
    {
        $user = User::factory()->create(['role' => 'khatma', 'email_verified_at' => now()]);

        Khatma::factory()->create([
            'user_id' => $user->id,
            'completion_date' => now()->addDays(7),
            'status' => 'active',
            'impact_score' => 20,
        ]);

        Khatma::factory()->create([
            'user_id' => $user->id,
            'completion_date' => now()->addDays(14),
            'status' => 'active',
            'impact_score' => 30,
        ]);

        $token = $user->createToken('test-token', ['khatma:create'])->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/khatmas');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'khatmas' => [
                '*' => [
                    'id',
                    'user_id',
                    'completion_date',
                    'status',
                    'impact_score',
                ],
            ],
            'total_impact_score',
        ]);
    }

    public function test_khatma_gift_resource_returns_correct_structure()
    {
        $user = User::factory()->create(['role' => 'khatma', 'email_verified_at' => now()]);
        $gift = Gift::factory()->create();

        $khatma = Khatma::factory()->create([
            'user_id' => $user->id,
            'completion_date' => now()->addDays(7),
            'status' => 'active',
            'impact_score' => 20,
        ]);

        KhatmaGift::factory()->create([
            'khatma_id' => $khatma->id,
            'gift_id' => $gift->id,
            'status' => 'completed',
        ]);

        $token = $user->createToken('test-token', ['khatma:create'])->plainTextToken;

        $response = $this->withToken($token)->getJson("/api/khatmas/{$khatma->id}");

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'id',
            'user_id',
            'completion_date',
            'impact_score',
            'status',
            'created_at',
            'updated_at',
            'user',
            'achievements',
        ]);
    }

    public function test_api_responses_are_consistent()
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
        $response->assertJson([
            'id' => $khatma->id,
            'status' => $khatma->status,
            'impact_score' => $khatma->impact_score,
        ]);
    }
}
