<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Khatma;
use App\Models\Gift;
use App\Models\KhatmaService as KhatmaServiceModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_khatma_resource_returns_correct_structure()
    {
        $user = User::factory()->create(['role' => 'khatma']);
        $gift = Gift::factory()->create();

        $khatma = Khatma::factory()->create([
            'user_id' => $user->id,
            'completion_date' => now()->addDays(7),
            'type' => 'فردية',
            'status' => 'active',
            'impact_score' => 20,
        ]);

        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withToken($token)->get("/api/khatmas/{$khatma->id}");

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'id',
            'user_id',
            'completion_date',
            'type',
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
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withToken($token)->get("/api/users/{$user->id}/profile");

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
        $gift = Gift::factory()->create();

        $response = $this->get('/api/gifts');

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
        $user = User::factory()->create(['role' => 'khatma']);
        $gift = Gift::factory()->create();

        $khatma1 = Khatma::factory()->create([
            'user_id' => $user->id,
            'completion_date' => now()->addDays(7),
            'type' => 'فردية',
            'status' => 'active',
            'impact_score' => 20,
        ]);

        $khatma2 = Khatma::factory()->create([
            'user_id' => $user->id,
            'completion_date' => now()->addDays(14),
            'type' => 'جماعية',
            'status' => 'active',
            'impact_score' => 30,
        ]);

        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withToken($token)->get('/api/khatmas');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'khatmas' => [
                '*' => [
                    'id',
                    'user_id',
                    'completion_date',
                    'type',
                    'status',
                    'impact_score',
                ],
            ],
            'total_impact_score',
        ]);
    }

    public function test_khatma_service_resource_returns_correct_structure()
    {
        $user = User::factory()->create(['role' => 'khatma']);
        $gift = Gift::factory()->create();

        $khatma = Khatma::factory()->create([
            'user_id' => $user->id,
            'completion_date' => now()->addDays(7),
            'type' => 'فردية',
            'status' => 'active',
            'impact_score' => 20,
        ]);

        $service = KhatmaServiceModel::factory()->create([
            'khatma_id' => $khatma->id,
            'gift_id' => $gift->id,
            'status' => 'completed',
        ]);

        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withToken($token)->get("/api/khatmas/{$khatma->id}");

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'id',
            'user_id',
            'completion_date',
            'type',
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
        $user = User::factory()->create(['role' => 'khatma']);
        $gift = Gift::factory()->create();

        $khatma = Khatma::factory()->create([
            'user_id' => $user->id,
            'completion_date' => now()->addDays(7),
            'type' => 'فردية',
            'status' => 'active',
            'impact_score' => 20,
        ]);

        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withToken($token)->get("/api/khatmas/{$khatma->id}");

        $response->assertStatus(200);
        $response->assertJson([
            'id' => $khatma->id,
            'type' => $khatma->type,
            'status' => $khatma->status,
            'impact_score' => $khatma->impact_score,
        ]);
    }
}
