<?php

namespace Tests\Feature;

use App\Mail\PasswordResetEmail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_with_valid_credentials()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone_number' => '0512345678',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'khatma',
            'pledge_accepted' => true,
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure(['message', 'user' => ['id', 'name', 'email', 'role']]);
        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'role' => 'khatma',
            'pledge_accepted' => true,
        ]);
    }

    public function test_registration_fails_with_invalid_email()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'invalid-email',
            'phone_number' => '0512345678',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'khatma',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    public function test_registration_fails_with_weak_password()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone_number' => '0512345678',
            'password' => '123',
            'password_confirmation' => '123',
            'role' => 'khatma',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
    }

    public function test_registration_fails_with_duplicate_email()
    {
        User::factory()->create(['email' => 'test@example.com']);

        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone_number' => '0512345678',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'khatma',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    public function test_user_can_login_with_valid_credentials()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('Password123!'),
            'email_verified_at' => now(),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'user' => [
                'id',
                'name',
                'email',
                'role',
            ],
        ]);
    }

    public function test_login_fails_with_invalid_credentials()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('Password123!'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'WrongPassword!',
        ]);

        $response->assertStatus(401);
    }

    public function test_user_can_logout()
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $response = $this->actingAs($user)->postJson('/api/logout');

        $response->assertStatus(200);
    }

    public function test_protected_route_requires_authentication()
    {
        $response = $this->getJson('/api/user');

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_access_protected_route()
    {
        $user = User::factory()->create(['email_verified_at' => now()]);

        $response = $this->actingAs($user)->getJson('/api/user');

        $response->assertStatus(200);
        $response->assertJson([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    public function test_invalid_token_is_rejected()
    {
        $response = $this->withToken('invalid-token')->getJson('/api/user');

        $response->assertStatus(401);
    }

    public function test_registration_rejects_admin_role()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone_number' => '0512345678',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'admin',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['role']);
    }

    public function test_registration_accepts_khatma_role()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone_number' => '0512345678',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'khatma',
            'pledge_accepted' => true,
        ]);

        $response->assertStatus(201);
    }

    public function test_registration_accepts_seeker_role()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'test2@example.com',
            'phone_number' => '0587654321',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'seeker',
            'pledge_accepted' => true,
        ]);

        $response->assertStatus(201);
    }

    public function test_user_can_request_password_reset()
    {
        Mail::fake();

        $user = User::factory()->create([
            'email' => 'resetuser@example.com',
            'name' => 'Reset User',
        ]);

        $response = $this->postJson('/api/forgot-password', [
            'email' => 'resetuser@example.com',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.',
        ]);

        $this->assertDatabaseHas('password_reset_tokens', [
            'email' => 'resetuser@example.com',
        ]);

        Mail::assertSent(PasswordResetEmail::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email);
        });
    }

    public function test_password_reset_for_nonexistent_email_returns_success_message()
    {
        Mail::fake();

        $response = $this->postJson('/api/forgot-password', [
            'email' => 'nonexistent@example.com',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'إذا كان البريد الإلكتروني مسجلاً، تم إرسال رابط إعادة تعيين كلمة المرور.',
        ]);

        Mail::assertNothingSent();
    }

    public function test_user_can_reset_password_with_valid_token()
    {
        $user = User::factory()->create([
            'email' => 'resetuser2@example.com',
            'password' => Hash::make('OldPassword123!'),
        ]);

        $plainToken = Str::random(60);
        DB::table('password_reset_tokens')->insert([
            'email' => $user->email,
            'token' => Hash::make($plainToken),
            'created_at' => now(),
        ]);

        $response = $this->postJson('/api/reset-password', [
            'email' => $user->email,
            'token' => $plainToken,
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'تم إعادة تعيين كلمة المرور بنجاح.',
        ]);

        $this->assertTrue(Hash::check('NewPassword123!', $user->fresh()->password));
        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => $user->email,
        ]);
    }

    public function test_password_reset_handles_mail_failure_gracefully()
    {
        Mail::shouldReceive('to->send')->andThrow(new \Exception('Mail service unavailable'));

        User::factory()->create([
            'email' => 'resetfail@example.com',
            'name' => 'Reset Fail User',
        ]);

        $response = $this->postJson('/api/forgot-password', [
            'email' => 'resetfail@example.com',
        ]);

        $response->assertStatus(500);
        $response->assertJson([
            'message' => 'تعذر إرسال بريد إعادة تعيين كلمة المرور حالياً، يرجى المحاولة لاحقاً أو التواصل مع الدعم الفني.',
        ]);
    }
}
