<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminEmail = env('ADMIN_EMAIL', 'katmaweb@outlook.com');
        $adminPassword = env('ADMIN_PASSWORD', 'SecureAdminPassword123!');

        // Create or update admin user
        User::updateOrCreate(
            ['email' => $adminEmail],
            [
                'name' => 'مدير النظام',
                'display_name' => 'مدير النظام',
                'password' => Hash::make($adminPassword),
                'role' => 'admin',
                'city' => 'الرياض',
                'neighborhood' => 'حي العليا',
                'latitude' => 24.7136,
                'longitude' => 46.6753,
                'bio' => 'مدير نظام منصة أثر وختمة',
                'email_verified_at' => now(),
                'pledge_accepted' => true,
            ]
        );

        $this->command->info('Admin user created successfully.');
        $this->command->warn('Email: ' . $adminEmail);
        $this->command->warn('Password: ' . $adminPassword);
    }
}

