<?php

namespace Tests\Feature;

use App\Models\Gift;
use App\Models\Khatma;
use App\Models\KhatmaGift;
use App\Models\Review;
use App\Models\SeekerNeed;
use App\Models\User;
use App\Models\Call;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminFeatureTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin(): array
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'email_verified_at' => now(),
            'pledge_accepted' => true,
        ]);
        $token = $admin->createToken('admin-token', ['*'])->plainTextToken;

        return [$admin, $token];
    }

    private function createKhatmaUser(): array
    {
        $khatma = User::factory()->create([
            'role' => 'khatma',
            'email_verified_at' => now(),
            'pledge_accepted' => true,
        ]);
        $token = $khatma->createToken('khatma-token', ['khatma:create'])->plainTextToken;

        return [$khatma, $token];
    }

    public function test_admin_can_access_overview_stats()
    {
        [$admin, $token] = $this->createAdmin();

        $response = $this->withToken($token)->getJson('/api/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'total_users',
                'total_khatmas',
                'total_needs',
                'total_gifts',
                'active_khatmas',
                'pending_needs',
                'khatma_users',
                'seeker_users',
                'admin_users',
                'total_impact_points',
            ]);
    }

    public function test_admin_can_list_and_search_users()
    {
        [$admin, $token] = $this->createAdmin();

        User::factory()->create(['name' => 'فاطمة الزهراء', 'role' => 'khatma']);
        User::factory()->create(['name' => 'مريم أحمد', 'role' => 'seeker']);

        $response = $this->withToken($token)->getJson('/api/admin/users?search=فاطمة');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'فاطمة الزهراء');
    }

    public function test_admin_can_create_auto_verified_user()
    {
        [$admin, $token] = $this->createAdmin();

        $payload = [
            'name' => 'نورة العتيبي',
            'email' => 'noura@example.com',
            'password' => 'SecurePass123!',
            'role' => 'khatma',
            'city' => 'الرياض',
        ];

        $response = $this->withToken($token)->postJson('/api/admin/users', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('user.email', 'noura@example.com')
            ->assertJsonPath('user.role', 'khatma');

        $user = User::where('email', 'noura@example.com')->firstOrFail();
        $this->assertNotNull($user->email_verified_at);
        $this->assertTrue((bool) $user->pledge_accepted);
    }

    public function test_admin_can_list_all_khatmas_with_eager_loaded_relations()
    {
        [$admin, $token] = $this->createAdmin();
        [$khatmaUser] = $this->createKhatmaUser();

        $khatma = Khatma::create([
            'user_id' => $khatmaUser->id,
            'completion_date' => now()->toDateString(),
            'status' => 'active',
            'impact_score' => 50,
        ]);

        $gift = Gift::factory()->create(['name' => 'إهداء تلاوة']);
        KhatmaGift::create([
            'khatma_id' => $khatma->id,
            'user_id' => $khatmaUser->id,
            'gift_id' => $gift->id,
            'status' => 'available',
        ]);

        $response = $this->withToken($token)->getJson('/api/admin/khatmas');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $khatma->id)
            ->assertJsonPath('data.0.user.name', $khatmaUser->name);
    }

    public function test_admin_can_delete_khatma()
    {
        [$admin, $token] = $this->createAdmin();
        [$khatmaUser] = $this->createKhatmaUser();

        $khatma = Khatma::create([
            'user_id' => $khatmaUser->id,
            'completion_date' => now()->toDateString(),
            'status' => 'active',
            'impact_score' => 10,
        ]);

        $response = $this->withToken($token)->deleteJson("/api/admin/khatmas/{$khatma->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('khatmas', ['id' => $khatma->id]);
    }

    public function test_admin_can_list_and_filter_seeker_needs()
    {
        [$admin, $token] = $this->createAdmin();
        $seeker = User::factory()->create(['role' => 'seeker']);
        $gift = Gift::factory()->create(['name' => 'تعليم سورة']);

        $openNeed = SeekerNeed::create([
            'user_id' => $seeker->id,
            'gift_id' => $gift->id,
            'description' => 'أحتاج مراجعة جزء عم',
            'city' => 'الدمام',
            'status' => 'open',
        ]);

        $fulfilledNeed = SeekerNeed::create([
            'user_id' => $seeker->id,
            'gift_id' => $gift->id,
            'description' => 'طلب مكتمل',
            'city' => 'جدة',
            'status' => 'fulfilled',
        ]);

        $response = $this->withToken($token)->getJson('/api/admin/needs?status=open');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $openNeed->id);
    }

    public function test_admin_can_delete_seeker_need()
    {
        [$admin, $token] = $this->createAdmin();
        $seeker = User::factory()->create(['role' => 'seeker']);
        $gift = Gift::factory()->create();

        $need = SeekerNeed::create([
            'user_id' => $seeker->id,
            'gift_id' => $gift->id,
            'description' => 'طلب للتجربة',
            'city' => 'الرياض',
            'status' => 'open',
        ]);

        $response = $this->withToken($token)->deleteJson("/api/admin/needs/{$need->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('seeker_needs', ['id' => $need->id]);
    }

    public function test_admin_can_list_and_delete_review_with_impact_recalculation()
    {
        [$admin, $token] = $this->createAdmin();
        [$khatmaUser] = $this->createKhatmaUser();
        $reviewer = User::factory()->create(['role' => 'seeker']);

        $khatma = Khatma::create([
            'user_id' => $khatmaUser->id,
            'completion_date' => now()->toDateString(),
            'status' => 'active',
            'impact_score' => 20,
        ]);

        $gift = Gift::factory()->create();
        $khatmaGift = KhatmaGift::create([
            'khatma_id' => $khatma->id,
            'user_id' => $khatmaUser->id,
            'gift_id' => $gift->id,
            'status' => 'delivered',
            'points_earned' => 10,
        ]);

        $review = Review::create([
            'reviewer_id' => $reviewer->id,
            'reviewee_id' => $khatmaUser->id,
            'reviewable_id' => $khatmaGift->id,
            'reviewable_type' => KhatmaGift::class,
            'rating' => 5,
            'comment' => 'تعليق مخالف وسيتم حذفه',
        ]);

        // Verify admin lists reviews
        $this->withToken($token)->getJson('/api/admin/reviews')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data');

        // Delete review
        $deleteResponse = $this->withToken($token)->deleteJson("/api/admin/reviews/{$review->id}");

        $deleteResponse->assertStatus(200);
        $this->assertDatabaseMissing('reviews', ['id' => $review->id]);
        $this->assertSame(0, $khatmaGift->fresh()->points_earned);
        $this->assertSame(0, $khatma->fresh()->impact_score);
    }

    public function test_non_admin_users_are_strictly_forbidden_from_admin_routes()
    {
        [$khatmaUser, $token] = $this->createKhatmaUser();

        $this->withToken($token)->getJson('/api/admin/users')->assertStatus(403);
        $this->withToken($token)->getJson('/api/admin/khatmas')->assertStatus(403);
        $this->withToken($token)->getJson('/api/admin/needs')->assertStatus(403);
        $this->withToken($token)->getJson('/api/admin/reviews')->assertStatus(403);
        $this->withToken($token)->getJson('/api/admin/calls')->assertStatus(403);
    }
}
