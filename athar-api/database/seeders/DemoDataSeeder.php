<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Gift;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $gifts = Gift::all();

        $users = [
            [
                'name' => 'سارة أحمد',
                'city' => 'الرياض',
                'lat' => 24.7136,
                'lng' => 46.6753,
            ],
            [
                'name' => 'نورة العتيبي',
                'city' => 'جدة',
                'lat' => 21.4858,
                'lng' => 39.1925,
            ],
            [
                'name' => 'فاطمة الدوسري',
                'city' => 'الدمام',
                'lat' => 26.4207,
                'lng' => 50.0888,
            ],
            [
                'name' => 'مريم القحطاني',
                'city' => 'مكة المكرمة',
                'lat' => 21.3891,
                'lng' => 39.8579,
            ],
            [
                'name' => 'ليلى الحربي',
                'city' => 'المدينة المنورة',
                'lat' => 24.5247,
                'lng' => 39.5692,
            ],
            [
                'name' => 'خولة السبيعي',
                'city' => 'الرياض',
                'lat' => 24.7494,
                'lng' => 46.6530,
            ],
        ];

        foreach ($users as $data) {
            $email = strtolower(str_replace(' ', '.', $data['name'])) . '@example.com';

            $user = User::create([
                'name' => $data['name'],
                'email' => $email,
                'password' => Hash::make(env('SEED_PASSWORD', 'SecureDemoPassword123!')),
                'role' => 'khatma',
                'city' => $data['city'],
                'latitude' => $data['lat'],
                'longitude' => $data['lng'],
                'bio' => 'خاتمة للقرآن الكريم مهتمة بترك أثر طيب في مدينة ' . $data['city'],
            ]);

            // Multiple khatmas per user so Map aggregation & glow levels are properly exercised.
            $khatmas = [
                [
                    'completion_date' => now()->subMonths(rand(1, 3))->toDateString(),
                    'type' => 'فردية',
                    'impact_score' => rand(10, 40),
                    'service_count' => rand(1, 2),
                ],
                [
                    'completion_date' => now()->subMonths(rand(4, 8))->toDateString(),
                    'type' => 'جماعية',
                    'impact_score' => rand(30, 70),
                    'service_count' => rand(2, 4),
                ],
                [
                    'completion_date' => now()->subMonths(rand(9, 14))->toDateString(),
                    'type' => 'فردية',
                    'impact_score' => rand(20, 80),
                    'service_count' => rand(1, 3),
                ],
            ];

            foreach ($khatmas as $khatmaData) {
                $khatma = $user->khatmas()->create([
                    'completion_date' => $khatmaData['completion_date'],
                    'type' => $khatmaData['type'],
                    'impact_score' => $khatmaData['impact_score'],
                    'status' => 'active',
                ]);

                for ($i = 0; $i < $khatmaData['service_count']; $i++) {
                    $khatma->services()->create([
                        'gift_id' => $gifts->random()->id,
                        'description' => 'تقديم خدمة مجتمعية تطوعية لنشر بركة القرآن.',
                        'status' => 'completed',
                        'points_earned' => 20,
                    ]);
                }
            }
        }
    }
}