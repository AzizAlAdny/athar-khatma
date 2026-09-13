<?php

namespace Tests\Feature;

use App\Models\AuthEvent;
use App\Models\Gift;
use App\Models\Khatma;
use App\Models\KhatmaGift;
use App\Models\Message;
use App\Models\Review;
use App\Models\SeekerNeed;
use App\Models\User;
use App\Models\Call;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
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
            'display_name' => 'أم محمد',
            'email' => 'noura@example.com',
            'password' => 'SecurePass123!',
            'role' => 'khatma',
            'city' => 'الرياض',
            'neighborhood' => 'حي الملقى',
            'latitude' => 24.8142,
            'longitude' => 46.6111,
            'bio' => 'مهتمة بتعليم القرآن الكريم وتحفيظ الصغار.',
        ];

        $response = $this->withToken($token)->postJson('/api/admin/users', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('user.email', 'noura@example.com')
            ->assertJsonPath('user.role', 'khatma')
            ->assertJsonPath('user.neighborhood', 'حي الملقى')
            ->assertJsonPath('user.bio', 'مهتمة بتعليم القرآن الكريم وتحفيظ الصغار.');

        $user = User::where('email', 'noura@example.com')->firstOrFail();
        $this->assertNotNull($user->email_verified_at);
        $this->assertTrue((bool) $user->pledge_accepted);
        $this->assertEquals('حي الملقى', $user->neighborhood);
        $this->assertEquals(24.8142, (float) $user->latitude);
    }

    public function test_admin_create_user_validation_fails_on_duplicate_email_or_invalid_role()
    {
        [$admin, $token] = $this->createAdmin();

        User::factory()->create(['email' => 'existing@example.com']);

        // Duplicate email
        $response = $this->withToken($token)->postJson('/api/admin/users', [
            'name' => 'سارة',
            'email' => 'existing@example.com',
            'password' => 'SecurePass123!',
            'role' => 'khatma',
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        // Short password
        $response = $this->withToken($token)->postJson('/api/admin/users', [
            'name' => 'سارة',
            'email' => 'unique@example.com',
            'password' => '123',
            'role' => 'khatma',
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        // Invalid role
        $response = $this->withToken($token)->postJson('/api/admin/users', [
            'name' => 'سارة',
            'email' => 'unique@example.com',
            'password' => 'SecurePass123!',
            'role' => 'superman',
        ]);
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['role']);
    }

    public function test_non_admin_cannot_create_users_via_admin_api()
    {
        [$khatmaUser, $token] = $this->createKhatmaUser();

        $response = $this->withToken($token)->postJson('/api/admin/users', [
            'name' => 'مستخدم جديد',
            'email' => 'newuser@example.com',
            'password' => 'SecurePass123!',
            'role' => 'seeker',
        ]);

        $response->assertStatus(403);
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
        $this->assertSame(10, $khatmaGift->fresh()->points_earned);
        $this->assertSame(10, $khatma->fresh()->impact_score);
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

    public function test_admin_can_delete_user_and_all_associated_data()
    {
        [$admin, $token] = $this->createAdmin();
        $secondAdmin = User::factory()->create(['role' => 'admin']);
        $targetUser = User::factory()->create(['role' => 'khatma', 'email' => 'target@example.com']);
        $otherUser = User::factory()->create(['role' => 'seeker']);

        $gift = Gift::create([
            'name' => 'مصحف مرمز',
            'slug' => 'quran-book-' . uniqid(),
            'category' => 'تعليم',
            'description' => 'وصف الهدية',
        ]);

        // 1. Personal access tokens
        $targetUser->createToken('test_token');

        // 2. Auth events
        AuthEvent::create([
            'user_id' => $targetUser->id,
            'event' => 'login',
            'ip_address' => '127.0.0.1',
        ]);

        // 3. Khatmas & Gifts
        $khatma = Khatma::create([
            'user_id' => $targetUser->id,
            'completion_date' => now()->toDateString(),
            'impact_score' => 10,
            'status' => 'active',
        ]);

        $khatmaGift = KhatmaGift::create([
            'khatma_id' => $khatma->id,
            'gift_id' => $gift->id,
            'description' => 'هدية تجريبية',
            'status' => 'pending',
            'delivered_to_id' => $otherUser->id,
        ]);

        // 4. Seeker Needs
        $need = SeekerNeed::create([
            'user_id' => $targetUser->id,
            'gift_id' => $gift->id,
            'description' => 'طلب تجريبي',
            'city' => 'الرياض',
            'status' => 'open',
            'fulfilled_by_id' => $otherUser->id,
        ]);

        // 5. Calls
        Call::create([
            'caller_id' => $targetUser->id,
            'receiver_id' => $otherUser->id,
            'callable_type' => KhatmaGift::class,
            'callable_id' => $khatmaGift->id,
            'status' => 'ended',
        ]);

        // 6. Messages
        Message::create([
            'messageable_id' => $khatmaGift->id,
            'messageable_type' => 'gift',
            'participant_id' => $targetUser->id,
            'sender_id' => $targetUser->id,
            'body' => 'رسالة تجريبية',
        ]);

        // 7. Reviews
        Review::create([
            'reviewer_id' => $targetUser->id,
            'reviewee_id' => $otherUser->id,
            'reviewable_id' => $khatmaGift->id,
            'reviewable_type' => KhatmaGift::class,
            'rating' => 5,
            'comment' => 'تقييم ممتاز',
        ]);

        // 8. Cache throttling keys
        $emailHash = sha1(strtolower(trim($targetUser->email)));
        Cache::put("verification_last_sent:{$emailHash}", now()->timestamp);
        Cache::put("verification_resend_count:{$emailHash}", 1);

        // Perform Delete
        $response = $this->withToken($token)->deleteJson("/api/admin/users/{$targetUser->id}");

        $response->assertStatus(200);
        $response->assertJson(['message' => 'تم حذف المستخدم وجميع بياناته المرتبطة بنجاح من قاعدة البيانات.']);

        // Assert all user tables are wiped
        $this->assertDatabaseMissing('users', ['id' => $targetUser->id]);
        $this->assertDatabaseMissing('khatmas', ['user_id' => $targetUser->id]);
        $this->assertDatabaseMissing('khatma_gifts', ['id' => $khatmaGift->id]);
        $this->assertDatabaseMissing('seeker_needs', ['id' => $need->id]);
        $this->assertDatabaseMissing('calls', ['caller_id' => $targetUser->id]);
        $this->assertDatabaseMissing('messages', ['sender_id' => $targetUser->id]);
        $this->assertDatabaseMissing('reviews', ['reviewer_id' => $targetUser->id]);
        $this->assertDatabaseMissing('auth_events', ['user_id' => $targetUser->id]);
        $this->assertNull(Cache::get("verification_last_sent:{$emailHash}"));
        $this->assertNull(Cache::get("verification_resend_count:{$emailHash}"));
    }

    public function test_admin_cannot_delete_their_own_account()
    {
        [$admin, $token] = $this->createAdmin();

        $response = $this->withToken($token)->deleteJson("/api/admin/users/{$admin->id}");

        $response->assertStatus(422);
        $response->assertJson(['message' => 'لا يمكنك حذف حسابك الشخصي من لوحة التحكم.']);
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_admin_cannot_delete_last_remaining_admin()
    {
        [$performingAdmin, $token] = $this->createAdmin();

        $response = $this->withToken($token)->deleteJson("/api/admin/users/{$performingAdmin->id}");
        $response->assertStatus(422);
    }

    public function test_non_admin_cannot_delete_users()
    {
        [$khatmaUser, $token] = $this->createKhatmaUser();
        $target = User::factory()->create(['role' => 'khatma']);

        $response = $this->withToken($token)->deleteJson("/api/admin/users/{$target->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('users', ['id' => $target->id]);
    }

    public function test_unauthenticated_guest_cannot_delete_users()
    {
        $target = User::factory()->create(['role' => 'khatma']);

        $response = $this->deleteJson("/api/admin/users/{$target->id}");

        $response->assertStatus(401);
        $this->assertDatabaseHas('users', ['id' => $target->id]);
    }
}
