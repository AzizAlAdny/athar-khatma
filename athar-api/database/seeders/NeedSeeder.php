<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Gift;
use App\Models\SeekerNeed;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class NeedSeeder extends Seeder
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
    ];

    private function getNeighborhoodCoordinates($city, $neighborhood)
    {
        if (!isset($this->cityData[$city]) || !$neighborhood) {
            return ['lat' => 24.8142, 'lng' => 46.6111];
        }

        foreach ($this->cityData[$city] as $hood) {
            if ($hood['name'] === $neighborhood) {
                return ['lat' => $hood['lat'], 'lng' => $hood['lng']];
            }
        }

        return ['lat' => 24.8142, 'lng' => 46.6111];
    }

    public function run(): void
    {
        // Seed Seeker user with email Fhdahfhdah@gmail.com
        $seeker = User::updateOrCreate(
            ['email' => 'Fhdahfhdah@gmail.com'],
            [
                'name' => 'فهدة',
                'display_name' => 'فهدة',
                'email_verified_at' => now(),
                'password' => Hash::make(env('SEED_PASSWORD', 'SecureDemoPassword123!')),
                'role' => 'seeker',
                'city' => 'الرياض',
                'neighborhood' => 'حي الملقى',
                'latitude' => 24.8142,
                'longitude' => 46.6111,
                'bio' => 'باحثة عن الأثر القرآني ومهتمة بدعم وطلب المبادرات والخدمات القرآنية في المجتمع.',
                'pledge_accepted' => true,
            ]
        );

        // Clear existing needs for clean idempotent re-seeding
        $seeker->seekerNeeds()->delete();

        $gifts = Gift::all();

        $needs = [
            [
                'gift_slug' => 'teaching-children',
                'description' => 'نحتاج معلمة متطوعة لتحفيظ وتجويد القرآن لأطفال الحي في المسجد بعد صلاة العصر.',
                'city' => 'الرياض',
                'neighborhood' => 'حي الروضة',
                'status' => 'open',
            ],
            [
                'gift_slug' => 'gift-mushaf',
                'description' => 'نجمع تبرعات مصاحف لتوزيعها في مراكز تعليم كبار السن ودور التحفيظ.',
                'city' => 'الرياض',
                'neighborhood' => 'حي الملقى',
                'status' => 'open',
            ],
            [
                'gift_slug' => 'zoom-room',
                'description' => 'نحتاج إلى متطوعة لفتح غرفة زوم لتحفيظ طالبات الجامعة ومراجعة الحفظ أسبوعياً.',
                'city' => 'الرياض',
                'neighborhood' => 'حي الصحافة',
                'status' => 'open',
            ],
            [
                'gift_slug' => 'design-media',
                'description' => 'مطلوب تصميم إعلان وبوسترات رقمية لحملة خيرية لتحفيز حفظ القرآن وتلاوته.',
                'city' => 'الرياض',
                'neighborhood' => 'حي الياسمين',
                'status' => 'open',
            ],
            [
                'gift_slug' => 'teaching-elderly',
                'description' => 'نبحث عن خاتمة متطوعة لتصحيح التلاوة وتلقين القرآن الكريم لكبيرات السن في دار التحفيظ.',
                'city' => 'الرياض',
                'neighborhood' => 'حي النرجس',
                'status' => 'open',
            ],
            [
                'gift_slug' => 'teaching-workers',
                'description' => 'مبادرة لتعليم سورة الفاتحة وقصار السور ومبادئ الصلاة للعاملات المنزليات بلغة مبسطة.',
                'city' => 'الرياض',
                'neighborhood' => 'حي السليمانية',
                'status' => 'open',
            ],
        ];

        foreach ($needs as $needData) {
            $gift = $gifts->where('slug', $needData['gift_slug'])->first();
            if (!$gift) {
                continue;
            }

            $coordinates = $this->getNeighborhoodCoordinates($needData['city'], $needData['neighborhood']);

            SeekerNeed::create([
                'user_id' => $seeker->id,
                'gift_id' => $gift->id,
                'description' => $needData['description'],
                'city' => $needData['city'],
                'neighborhood' => $needData['neighborhood'],
                'latitude' => $coordinates['lat'],
                'longitude' => $coordinates['lng'],
                'status' => $needData['status'],
            ]);
        }

        $this->command->info('Seeker user and all SeekerNeeds seeded successfully: Fhdahfhdah@gmail.com');
    }
}

