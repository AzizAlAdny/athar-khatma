<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Gift;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    private $cityData = [
        'الرياض' => [
            ['name' => 'حي الملقى', 'lat' => 24.8142, 'lng' => 46.6111],
            ['name' => 'حي الصحافة', 'lat' => 24.8055, 'lng' => 46.6375],
            ['name' => 'حي الياسمين', 'lat' => 24.8217, 'lng' => 46.6567],
            ['name' => 'حي النرجس', 'lat' => 24.8450, 'lng' => 46.6800],
            ['name' => 'حي الروضة', 'lat' => 24.7300, 'lng' => 46.7700],
            ['name' => 'حي السليمانية', 'lat' => 24.7000, 'lng' => 46.7000],
            ['name' => 'حي العليا', 'lat' => 24.7136, 'lng' => 46.6753],
            ['name' => 'حي المروج', 'lat' => 24.7600, 'lng' => 46.6600],
            ['name' => 'حي النفل', 'lat' => 24.7800, 'lng' => 46.6600],
            ['name' => 'حي الغدير', 'lat' => 24.7700, 'lng' => 46.6500],
        ],
        'جدة' => [
            ['name' => 'حي البلد', 'lat' => 21.4833, 'lng' => 39.1833],
            ['name' => 'حي الحمراء', 'lat' => 21.5282, 'lng' => 39.1626],
            ['name' => 'حي الشاطئ', 'lat' => 21.6033, 'lng' => 39.1166],
            ['name' => 'حي الروضة', 'lat' => 21.5732, 'lng' => 39.1483],
            ['name' => 'حي العزيزية', 'lat' => 21.5499, 'lng' => 39.1776],
            ['name' => 'حي السلامة', 'lat' => 21.5833, 'lng' => 39.1500],
            ['name' => 'حي المحيمدية', 'lat' => 21.6167, 'lng' => 39.1333],
            ['name' => 'حي الفيصلية', 'lat' => 21.5667, 'lng' => 39.1833],
            ['name' => 'حي أبحر الشمالية', 'lat' => 21.7333, 'lng' => 39.1167],
            ['name' => 'حي المروة', 'lat' => 21.6333, 'lng' => 39.2000],
        ],
        'الدمام' => [
            ['name' => 'حي الشاطئ الشرقي', 'lat' => 26.4731, 'lng' => 50.1288],
            ['name' => 'حي الريان', 'lat' => 26.4180, 'lng' => 50.1130],
            ['name' => 'حي الفيصلية', 'lat' => 26.3985, 'lng' => 50.0760],
            ['name' => 'حي الروضة', 'lat' => 26.4420, 'lng' => 50.0880],
            ['name' => 'حي المزروعية', 'lat' => 26.4520, 'lng' => 50.1220],
            ['name' => 'حي النور', 'lat' => 26.4000, 'lng' => 50.0333],
            ['name' => 'حي الاتصالات', 'lat' => 26.4167, 'lng' => 50.0833],
            ['name' => 'حي الزهور', 'lat' => 26.4333, 'lng' => 50.1167],
            ['name' => 'حي الحمراء', 'lat' => 26.4667, 'lng' => 50.1000],
            ['name' => 'حي المباركية', 'lat' => 26.4500, 'lng' => 50.1333],
        ],
        'مكة المكرمة' => [
            ['name' => 'حي أجياد', 'lat' => 21.4179, 'lng' => 39.8292],
            ['name' => 'حي العزيزية', 'lat' => 21.4166, 'lng' => 39.8650],
            ['name' => 'حي منى', 'lat' => 21.4150, 'lng' => 39.8930],
            ['name' => 'حي المسفلة', 'lat' => 21.4110, 'lng' => 39.8230],
            ['name' => 'حي الشبيكة', 'lat' => 21.4210, 'lng' => 39.8180],
            ['name' => 'حي بطحاء قريش', 'lat' => 21.3667, 'lng' => 39.8333],
            ['name' => 'حي الشرائع', 'lat' => 21.4500, 'lng' => 39.9500],
            ['name' => 'حي النوارية', 'lat' => 21.5500, 'lng' => 39.7833],
            ['name' => 'حي الرصيفة', 'lat' => 21.4000, 'lng' => 39.7833],
            ['name' => 'حي الزايدي', 'lat' => 21.3833, 'lng' => 39.7333],
        ],
        'المدينة المنورة' => [
            ['name' => 'حي المنطقة المركزية', 'lat' => 24.4686, 'lng' => 39.6142],
            ['name' => 'حي قباء', 'lat' => 24.4392, 'lng' => 39.6172],
            ['name' => 'حي قربان', 'lat' => 24.4536, 'lng' => 39.6231],
            ['name' => 'حي بضاعة', 'lat' => 24.4727, 'lng' => 39.6092],
            ['name' => 'حي العيون', 'lat' => 24.5200, 'lng' => 39.5950],
            ['name' => 'حي سيد الشهداء', 'lat' => 24.4917, 'lng' => 39.6125],
            ['name' => 'حي العزيزية', 'lat' => 24.4667, 'lng' => 39.5333],
            ['name' => 'حي الهجرة', 'lat' => 24.4000, 'lng' => 39.6167],
            ['name' => 'حي الدويخلة', 'lat' => 24.4833, 'lng' => 39.6500],
            ['name' => 'حي الخالدية', 'lat' => 24.4500, 'lng' => 39.6500],
        ],
    ];

    private function getRandomNeighborhood($city)
    {
        if (!isset($this->cityData[$city])) {
            return ['name' => null, 'lat' => null, 'lng' => null];
        }

        $neighborhoods = $this->cityData[$city];
        return $neighborhoods[array_rand($neighborhoods)];
    }

    private function generateEnglishEmail($name)
    {
        // Convert Arabic to English equivalent names for email
        $arabicToEnglish = [
            'سارة أحمد' => 'sarah.ahmed',
            'نورة العتيبي' => 'noura.aloteibi',
            'فاطمة الدوسري' => 'fatima.aldossari',
            'مريم القحطاني' => 'mariam.alqahtani',
            'ليلى الحربي' => 'layla.alharbi',
            'خولة السبيعي' => 'khawla.alsubaei',
        ];

        return ($arabicToEnglish[$name] ?? strtolower(str_replace(' ', '.', $name))) . '@example.com';
    }

    public function run(): void
    {
        $gifts = Gift::all();

        $users = [
            [
                'name' => 'سارة أحمد',
                'city' => 'الرياض',
            ],
            [
                'name' => 'نورة العتيبي',
                'city' => 'جدة',
            ],
            [
                'name' => 'فاطمة الدوسري',
                'city' => 'الدمام',
            ],
            [
                'name' => 'مريم القحطاني',
                'city' => 'مكة المكرمة',
            ],
            [
                'name' => 'ليلى الحربي',
                'city' => 'المدينة المنورة',
            ],
            [
                'name' => 'خولة السبيعي',
                'city' => 'الرياض',
            ],
        ];

        foreach ($users as $data) {
            $email = $this->generateEnglishEmail($data['name']);
            $neighborhood = $this->getRandomNeighborhood($data['city']);

            $user = User::create([
                'name' => $data['name'],
                'email' => $email,
                'password' => Hash::make(env('SEED_PASSWORD', 'SecureDemoPassword123!')),
                'role' => 'khatma',
                'city' => $data['city'],
                'neighborhood' => $neighborhood['name'],
                'latitude' => $neighborhood['lat'],
                'longitude' => $neighborhood['lng'],
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
