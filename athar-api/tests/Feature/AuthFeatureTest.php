<?php

namespace Tests\Feature;

use App\Models\AuthEvent;
use App\Models\Gift;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Auth\Events\Registered;
use Tests\TestCase;

class AuthFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_unverified_user_cannot_create_khatma()
    {
        $user = User::factory()->create(['role' => 'khatma', 'email_verified_at' => null]);
        $gift = Gift::factory()->create();
        $token = $user->createToken('test-token', ['khatma:create'])->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/khatmas', [
            'completion_date' => now()->addDays(7)->toDateString(),
            'type' => 'فردية',
            'gift_ids' => [$gift->id],
        ]);

        $response->assertStatus(403);
    }

    public function test_verified_user_can_create_khatma()
    {
        $user = User::factory()->create(['role' => 'khatma', 'email_verified_at' => now()]);
        $gift = Gift::factory()->create();
        $token = $user->createToken('test-token', ['khatma:create'])->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/khatmas', [
            'completion_date' => now()->addDays(7)->toDateString(),
            'type' => 'فردية',
            'gift_ids' => [$gift->id],
        ]);

        $response->assertStatus(201);
    }

    public function test_token_without_required_ability_is_rejected()
    {
        $user = User::factory()->create(['role' => 'khatma', 'email_verified_at' => now()]);
        $gift = Gift::factory()->create();
        // Token has only 'read' ability, not 'khatma:create'
        $token = $user->createToken('test-token', ['read'])->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/khatmas', [
            'completion_date' => now()->addDays(7)->toDateString(),
            'type' => 'فردية',
            'gift_ids' => [$gift->id],
        ]);

        $response->assertStatus(403);
    }

    public function test_login_locks_out_after_five_failed_attempts()
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('Password123!'),
            'email_verified_at' => now(),
        ]);

        foreach (range(1, 5) as $i) {
            $this->postJson('/api/login', [
                'email' => 'test@example.com',
                'password' => 'WrongPassword!',
            ])->assertStatus(401);
        }

        // 6th attempt is locked out
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'WrongPassword!',
        ]);

        $response->assertStatus(429);
    }

    public function test_successful_login_resets_lockout_counter()
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('Password123!'),
            'email_verified_at' => now(),
        ]);

        // Two failed attempts
        $this->postJson('/api/login', ['email' => 'test@example.com', 'password' => 'Wrong!'])->assertStatus(401);
        $this->postJson('/api/login', ['email' => 'test@example.com', 'password' => 'Wrong!'])->assertStatus(401);

        // Successful login
        $this->postJson('/api/login', ['email' => 'test@example.com', 'password' => 'Password123!'])->assertStatus(200);

        // Counter reset: three more failed attempts should NOT lock out (need 5)
        $this->postJson('/api/login', ['email' => 'test@example.com', 'password' => 'Wrong!'])->assertStatus(401);
        $this->postJson('/api/login', ['email' => 'test@example.com', 'password' => 'Wrong!'])->assertStatus(401);
        $this->postJson('/api/login', ['email' => 'test@example.com', 'password' => 'Wrong!'])->assertStatus(401);
    }

    public function test_auth_events_are_recorded()
    {
        Notification::fake();
        Event::fake([Registered::class]);

        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('Password123!'),
            'email_verified_at' => now(),
        ]);

        // Login event
        $this->postJson('/api/login', ['email' => 'test@example.com', 'password' => 'Password123!'])->assertStatus(200);
        $this->assertDatabaseHas('auth_events', [
            'user_id' => $user->id,
            'event' => 'login',
        ]);

        // Failed login event
        $this->postJson('/api/login', ['email' => 'other@example.com', 'password' => 'Wrong!'])->assertStatus(401);
        $this->assertDatabaseHas('auth_events', [
            'event' => 'login_failed',
        ]);
    }

    public function test_role_denial_is_audited()
    {
        $seeker = User::factory()->create(['role' => 'seeker', 'email_verified_at' => now()]);
        $token = $seeker->createToken('test-token', ['need:create'])->plainTextToken;

        // Seeker attempts an admin-only route
        $this->withToken($token)->getJson('/api/stats')->assertStatus(403);

        $this->assertDatabaseHas('auth_events', [
            'user_id' => $seeker->id,
            'event' => 'role_denied',
        ]);
    }

    public function test_logout_all_revokes_every_token()
    {
        $user = User::factory()->create(['role' => 'khatma', 'email_verified_at' => now()]);
        $token1 = $user->createToken('t1', ['read'])->plainTextToken;
        $user->createToken('t2', ['read']);

        $response = $this->withToken($token1)->postJson('/api/logout-all');

        $response->assertStatus(200);
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);
    }

    public function test_email_verification_resend_requires_auth()
    {
        $response = $this->postJson('/api/email/resend');
        $response->assertStatus(401);
    }

    public function test_resend_returns_ok_when_already_verified()
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $response = $this->actingAs($user)->postJson('/api/email/resend');
        $response->assertStatus(200);
    }

    public function test_email_verification_link_is_idempotent_for_already_verified_user()
    {
        Notification::fake();
        Event::fake([Registered::class]);

        // User is already verified:
        // the signed verification link is idempotent: it redirects without
        // recording a duplicate email_verified event.
        $user = User::factory()->create([
            'email' => 'verify@example.com',
            'email_verified_at' => now(),
        ]);
        $this->assertNotNull($user->email_verified_at);

        // Hit the verification endpoint with a valid signed URL.
        $url = \Illuminate\Support\Facades\URL::signedRoute('api.verification.verify', [
            'id' => $user->id,
            'hash' => sha1($user->getEmailForVerification()),
        ]);

        $response = $this->get($url);
        $response->assertRedirect();

        // No duplicate event is recorded for an already-verified user.
        $this->assertDatabaseMissing('auth_events', [
            'user_id' => $user->id,
            'event' => 'email_verified',
        ]);
    }

    public function test_invalid_verification_hash_is_rejected()
    {
        $user = User::factory()->create(['email_verified_at' => null]);

        $url = \Illuminate\Support\Facades\URL::signedRoute('api.verification.verify', [
            'id' => $user->id,
            'hash' => 'invalid-hash',
        ]);

        $response = $this->getJson($url);
        $response->assertStatus(403);
        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_security_headers_are_present()
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200);
        $response->assertHeader('X-Frame-Options', 'DENY');
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
    }

    private function enableHunterVerification(): void
    {
        Mail::fake();
        config([
            'services.hunter.api_key' => 'test-api-key',
            'services.hunter.enabled' => true,
            'services.verification.resend_cooldown' => 120,
            'services.verification.max_resends' => 3,
        ]);
    }

    public function test_registration_validates_real_unique_email()
    {
        $this->enableHunterVerification();

        Http::fake(function ($request) {
            $email = $request['email'] ?? '';
            if ($email === 'disposable@fake.com') {
                return Http::response(['data' => ['status' => 'disposable', 'disposable' => true, 'mx_records' => false]], 200);
            }
            if ($email === 'failopen@valid.com') {
                return Http::response(['error' => 'Service Unavailable'], 503);
            }
            return Http::response(['data' => ['status' => 'valid', 'disposable' => false, 'mx_records' => true]], 200);
        });

        // 1. Step 1: Rejects duplicate email immediately without calling Hunter API
        User::factory()->create(['email' => 'existing@example.com']);
        $this->postJson('/api/register', [
            'name' => 'Existing User',
            'email' => 'existing@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'khatma',
            'pledge_accepted' => true,
        ])->assertStatus(422)->assertJsonValidationErrors(['email']);
        Http::assertNotSent(fn ($req) => str_contains($req->url(), 'existing@example.com'));

        // 2. Step 2: Rejects disposable / invalid email via Hunter
        $this->postJson('/api/register', [
            'name' => 'Disp User',
            'email' => 'disposable@fake.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'khatma',
            'pledge_accepted' => true,
        ])->assertStatus(422)->assertJsonValidationErrors(['email']);

        // 3. Step 3: Successfully registers with real email & initializes cooldown
        $this->postJson('/api/register', [
            'name' => 'Real User',
            'email' => 'realuser@valid.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'khatma',
            'pledge_accepted' => true,
        ])->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'realuser@valid.com']);

        // 4. Fail-open allows registration when Hunter API is unavailable
        $this->postJson('/api/register', [
            'name' => 'Failopen User',
            'email' => 'failopen@valid.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'khatma',
            'pledge_accepted' => true,
        ])->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'failopen@valid.com']);
    }

    public function test_resend_verification_code_enforces_cooldown_and_limit()
    {
        $this->enableHunterVerification();
        Http::fake(['api.hunter.io/*' => Http::response(['data' => ['status' => 'valid', 'disposable' => false, 'mx_records' => true]], 200)]);

        $now = Carbon::create(2026, 9, 13, 12, 0, 0);
        Carbon::setTestNow($now);

        $this->postJson('/api/register', [
            'name' => 'Cooldown User',
            'email' => 'cooldown@valid.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'khatma',
            'pledge_accepted' => true,
        ])->assertStatus(201);

        // Immediate resend attempt blocked by 2-min cooldown (0s < 120s)
        $this->postJson('/api/resend-verification-code', ['email' => 'cooldown@valid.com'])->assertStatus(429);

        // Advance past cooldown for 3 allowed resends
        for ($i = 1; $i <= 3; $i++) {
            $now->addSeconds(125);
            Carbon::setTestNow($now);
            $this->postJson('/api/resend-verification-code', ['email' => 'cooldown@valid.com'])->assertStatus(200);
        }

        // 4th attempt rejected after maximum 3 repeats
        $now->addSeconds(125);
        Carbon::setTestNow($now);
        $this->postJson('/api/resend-verification-code', ['email' => 'cooldown@valid.com'])->assertStatus(429);
    }
}
