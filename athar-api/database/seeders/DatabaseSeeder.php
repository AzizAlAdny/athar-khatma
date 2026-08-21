<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Allowed seed users
        $allowedEmails = [
            'katmaweb@outlook.com',
            'khatmaweb@gmail.com',
            'Fhdahfhdah@gmail.com',
            'fhdahfhdah@gmail.com',
        ];

        $adminEmail = env('ADMIN_EMAIL', 'katmaweb@outlook.com');
        if (!in_array($adminEmail, $allowedEmails)) {
            $allowedEmails[] = $adminEmail;
        }

        // Remove all other users and cascade their relations
        User::whereNotIn('email', $allowedEmails)->delete();

        $this->call([
            GiftSeeder::class,
            AdminSeeder::class,
            DemoDataSeeder::class,
            NeedSeeder::class,
        ]);
    }
}