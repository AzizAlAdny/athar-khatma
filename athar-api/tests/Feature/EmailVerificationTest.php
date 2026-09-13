<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        config([
            'services.hunter.api_key' => 'test-api-key',
            'services.hunter.enabled' => true,
            'services.verification.resend_cooldown' => 120,
            'services.verification.max_resends' => 3,
        ]);
    }

    public function test_step_1_fails_immediately_if_email_already_registered_without_calling_hunter()
    {
        Http::fake();

        User::factory()->create([
            'email' => 'existing@example.com',
        ]);

        $response = $this->postJson('/api/register', [
            'name' => 'Existing User',
            'email' => 'existing@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'khatma',
            'pledge_accepted' => true,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
        $this->assertEquals('البريد الإلكتروني مسجل بالفعل لدينا.', $response->json('errors.email.0'));

        // Ensure Hunter API was NEVER called
        Http::assertNothingSent();
    }

    public function test_step_2_rejects_disposable_email()
    {
        Http::fake([
            'api.hunter.io/*' => Http::response([
                'data' => [
                    'status' => 'disposable',
                    'score' => 0,
                    'disposable' => true,
                    'mx_records' => false,
                ],
            ], 200),
        ]);

        $response = $this->postJson('/api/register', [
            'name' => 'Test Disposable',
            'email' => 'disposable@fake-domain.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'khatma',
            'pledge_accepted' => true,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
        $this->assertStringContainsString('لا يُسمح باستخدام البريد الإلكتروني المؤقت', $response->json('errors.email.0'));

        $this->assertDatabaseMissing('users', [
            'email' => 'disposable@fake-domain.com',
        ]);
    }

    public function test_step_2_rejects_invalid_undeliverable_email()
    {
        Http::fake([
            'api.hunter.io/*' => Http::response([
                'data' => [
                    'status' => 'invalid',
                    'score' => 0,
                    'disposable' => false,
                    'mx_records' => true,
                ],
            ], 200),
        ]);

        $response = $this->postJson('/api/register', [
            'name' => 'Test Invalid',
            'email' => 'nonexistent@real-domain.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'khatma',
            'pledge_accepted' => true,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
        $this->assertStringContainsString('غير موجود أو غير قابل للاستلام', $response->json('errors.email.0'));

        $this->assertDatabaseMissing('users', [
            'email' => 'nonexistent@real-domain.com',
        ]);
    }

    public function test_step_3_succeeds_with_valid_real_email_and_initializes_cooldown()
    {
        Http::fake([
            'api.hunter.io/*' => Http::response([
                'data' => [
                    'status' => 'valid',
                    'score' => 95,
                    'disposable' => false,
                    'mx_records' => true,
                ],
            ], 200),
        ]);

        $response = $this->postJson('/api/register', [
            'name' => 'Real User',
            'email' => 'realuser@valid-domain.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'khatma',
            'pledge_accepted' => true,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'email' => 'realuser@valid-domain.com',
        ]);

        // Check cache initialized
        $emailHash = sha1('realuser@valid-domain.com');
        $this->assertNotNull(Cache::get("verification_last_sent:{$emailHash}"));
        $this->assertEquals(0, Cache::get("verification_resend_count:{$emailHash}"));
    }

    public function test_resend_verification_code_enforces_2_minute_cooldown()
    {
        Http::fake([
            'api.hunter.io/*' => Http::response([
                'data' => ['status' => 'valid', 'disposable' => false, 'mx_records' => true],
            ], 200),
        ]);

        Carbon::setTestNow(Carbon::create(2026, 9, 13, 12, 0, 0));

        $reg = $this->postJson('/api/register', [
            'name' => 'Cooldown User',
            'email' => 'cooldown@valid-domain.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'khatma',
            'pledge_accepted' => true,
        ]);
        $reg->assertStatus(201);

        // Immediate resend attempt (0 seconds elapsed) -> Should be rejected with 429
        $resend1 = $this->postJson('/api/resend-verification-code', [
            'email' => 'cooldown@valid-domain.com',
        ]);
        $resend1->assertStatus(429);
        $this->assertStringContainsString('يرجى الانتظار', $resend1->json('message'));

        // Advance time by 60 seconds (still within 120s cooldown)
        Carbon::setTestNow(Carbon::create(2026, 9, 13, 12, 1, 0));
        $resend2 = $this->postJson('/api/resend-verification-code', [
            'email' => 'cooldown@valid-domain.com',
        ]);
        $resend2->assertStatus(429);
        $this->assertEquals(60, $resend2->json('remaining_seconds'));

        // Advance time by 121 seconds (cooldown expired) -> Should succeed
        Carbon::setTestNow(Carbon::create(2026, 9, 13, 12, 2, 5));
        $resend3 = $this->postJson('/api/resend-verification-code', [
            'email' => 'cooldown@valid-domain.com',
        ]);
        $resend3->assertStatus(200);
        $this->assertEquals(1, $resend3->json('resend_count'));
        $this->assertEquals(2, $resend3->json('remaining_resends'));
    }

    public function test_resend_verification_code_limits_to_maximum_3_repeats()
    {
        Http::fake([
            'api.hunter.io/*' => Http::response([
                'data' => ['status' => 'valid', 'disposable' => false, 'mx_records' => true],
            ], 200),
        ]);

        $now = Carbon::create(2026, 9, 13, 10, 0, 0);
        Carbon::setTestNow($now);

        $this->postJson('/api/register', [
            'name' => 'Max Resend User',
            'email' => 'maxresend@valid-domain.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'khatma',
            'pledge_accepted' => true,
        ])->assertStatus(201);

        // 1st resend (after 120s)
        Carbon::setTestNow($now->addSeconds(125));
        $res1 = $this->postJson('/api/resend-verification-code', ['email' => 'maxresend@valid-domain.com']);
        $res1->assertStatus(200);
        $this->assertEquals(1, $res1->json('resend_count'));

        // 2nd resend (after another 125s)
        Carbon::setTestNow($now->addSeconds(125));
        $res2 = $this->postJson('/api/resend-verification-code', ['email' => 'maxresend@valid-domain.com']);
        $res2->assertStatus(200);
        $this->assertEquals(2, $res2->json('resend_count'));

        // 3rd resend (after another 125s)
        Carbon::setTestNow($now->addSeconds(125));
        $res3 = $this->postJson('/api/resend-verification-code', ['email' => 'maxresend@valid-domain.com']);
        $res3->assertStatus(200);
        $this->assertEquals(3, $res3->json('resend_count'));

        // 4th resend attempt (after cooldown) -> Should be rejected with 429
        Carbon::setTestNow($now->addSeconds(125));
        $res4 = $this->postJson('/api/resend-verification-code', ['email' => 'maxresend@valid-domain.com']);
        $res4->assertStatus(429);
        $this->assertStringContainsString('تجاوزت الحد الأقصى', $res4->json('message'));
    }

    public function test_fail_open_allows_registration_when_hunter_service_is_down()
    {
        Http::fake([
            'api.hunter.io/*' => Http::response(['error' => 'Service Unavailable'], 503),
        ]);

        $response = $this->postJson('/api/register', [
            'name' => 'Failopen User',
            'email' => 'failopen@valid-domain.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'khatma',
            'pledge_accepted' => true,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'email' => 'failopen@valid-domain.com',
        ]);
    }
}
