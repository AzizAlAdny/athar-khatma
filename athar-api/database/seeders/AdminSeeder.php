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
        // Create admin user with secure password from environment
        User::create([
            'name' => 'Admin User',
            'email' => env('ADMIN_EMAIL', 'admin@example.com'),
            'password' => Hash::make(env('ADMIN_PASSWORD', 'SecureAdminPassword123!')),
            'role' => 'admin',
            'city' => 'System',
            'bio' => 'System administrator',
        ]);

        $this->command->info('Admin user created successfully.');
        $this->command->warn('Email: ' . env('ADMIN_EMAIL', 'admin@example.com'));
        $this->command->warn('Password: ' . env('ADMIN_PASSWORD', 'SecureAdminPassword123!'));
        $this->command->warn('Please change the default password after first login.');
    }
}
