<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\VisitorMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class VisitorTest extends TestCase
{
    use RefreshDatabase;

    public function test_visitor_can_register_with_message_and_gets_auto_verified()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'سارة العتيبي',
            'display_name' => 'سارة (مشرفة الوزارة)',
            'email' => 'sarah.visitor@example.com',
            'phone_number' => '0512345679',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'visitor',
            'city' => 'الرياض',
            'neighborhood' => 'حي الملقى',
            'pledge_accepted' => true,
            'visitor_message' => 'منصة رائدة ومجهود قرآني مبارك، بارك الله في جهودكم.',
            'organization' => 'وزارة التعليم',
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'message',
            'user' => ['id', 'name', 'email', 'role'],
            'token',
        ]);

        $this->assertEquals('visitor', $response->json('user.role'));
        $this->assertNotEmpty($response->json('token'));

        $this->assertDatabaseHas('users', [
            'email' => 'sarah.visitor@example.com',
            'role' => 'visitor',
            'bio' => 'منصة رائدة ومجهود قرآني مبارك، بارك الله في جهودكم.',
        ]);

        $user = User::where('email', 'sarah.visitor@example.com')->first();
        $this->assertNotNull($user->email_verified_at);

        $this->assertDatabaseHas('visitor_messages', [
            'user_id' => $user->id,
            'message' => 'منصة رائدة ومجهود قرآني مبارك، بارك الله في جهودكم.',
            'organization' => 'وزارة التعليم',
        ]);
    }

    public function test_visitor_can_register_without_city_neighborhood_and_pledge()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'ريم التميمي',
            'email' => 'reem.guest@example.com',
            'phone_number' => '0598765432',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'visitor',
            'visitor_message' => 'انطباع رائع ومبادرة مباركة لخدمة المجتمع.',
            'organization' => 'وزارة التعليم',
        ]);

        $response->assertStatus(201);
        $this->assertEquals('visitor', $response->json('user.role'));

        $user = User::where('email', 'reem.guest@example.com')->first();
        $this->assertNotNull($user);
        $this->assertNull($user->city);
        $this->assertNull($user->neighborhood);
    }

    public function test_visitor_messages_can_be_retrieved_publicly()
    {
        $user = User::factory()->create(['role' => 'visitor', 'name' => 'نورة المنصور']);
        VisitorMessage::create([
            'user_id' => $user->id,
            'message' => 'أثر عظيم في خدمة القرآن الكريم.',
            'organization' => 'الشؤون الإسلامية',
            'is_featured' => true,
        ]);

        $response = $this->getJson('/api/visitor-messages');
        $response->assertStatus(200);
        $response->assertJsonFragment([
            'message' => 'أثر عظيم في خدمة القرآن الكريم.',
            'organization' => 'الشؤون الإسلامية',
        ]);
    }

    public function test_authenticated_visitor_can_post_new_message()
    {
        $user = User::factory()->create(['role' => 'visitor']);
        $token = $user->createToken('auth_token', ['read', 'visitor:create'])->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/visitor-messages', [
            'message' => 'كلمة إضافية مشجعة لفريق العمل المتميز.',
            'organization' => 'زائرة كريمة',
        ]);

        $response->assertStatus(201);
        $response->assertJson([
            'message' => 'شكراً لكِ! تم تسجيل كلمتكِ الكريمة بنجاح، ونسعد بأثركِ معنا.',
        ]);

        $this->assertDatabaseHas('visitor_messages', [
            'user_id' => $user->id,
            'message' => 'كلمة إضافية مشجعة لفريق العمل المتميز.',
        ]);
    }

    public function test_admin_stats_includes_visitor_count()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->count(3)->create(['role' => 'visitor']);

        $token = $admin->createToken('auth_token', ['*'])->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/stats');
        $response->assertStatus(200);
        $response->assertJson([
            'visitor_users' => 3,
        ]);
    }
}
