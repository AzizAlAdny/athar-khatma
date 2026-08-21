<?php

namespace Tests\Feature;

use App\Models\Gift;
use App\Models\KhatmaGift;
use App\Models\SeekerNeed;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_seeder_creates_expected_users_and_records(): void
    {
        $this->seed(DatabaseSeeder::class);

        // Check only 3 users exist
        $users = User::all();
        $this->assertCount(3, $users);

        $admin = User::where('email', 'katmaweb@outlook.com')->first();
        $this->assertNotNull($admin);
        $this->assertEquals('admin', $admin->role);

        $khatma = User::where('email', 'khatmaweb@gmail.com')->first();
        $this->assertNotNull($khatma);
        $this->assertEquals('khatma', $khatma->role);

        $seeker = User::where('email', 'Fhdahfhdah@gmail.com')->first();
        $this->assertNotNull($seeker);
        $this->assertEquals('seeker', $seeker->role);

        // All SeekerNeeds must belong to the seeker user
        $seekerNeeds = SeekerNeed::all();
        $this->assertNotEmpty($seekerNeeds);
        foreach ($seekerNeeds as $need) {
            $this->assertEquals($seeker->id, $need->user_id);
        }

        // All Khatma gifts must belong to khatmas owned by the khatma user
        $khatmaGifts = KhatmaGift::with('khatma')->get();
        $this->assertNotEmpty($khatmaGifts);
        foreach ($khatmaGifts as $khatmaGift) {
            $this->assertEquals($khatma->id, $khatmaGift->khatma->user_id);
        }

        // Running seed again is idempotent
        $this->seed(DatabaseSeeder::class);
        $this->assertCount(3, User::all());
    }
}
