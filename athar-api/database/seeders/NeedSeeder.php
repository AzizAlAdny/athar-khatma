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

    private function getNeighborhoodCoordinates($city, $neighborhood)
    {
        if (!isset($this->cityData[$city]) || !$neighborhood) {
            return ['lat' => null, 'lng' => null];
        }

        foreach ($this->cityData[$city] as $hood) {
            if ($hood['name'] === $neighborhood) {
                return ['lat' => $hood['lat'], 'lng' => $hood['lng']];
            }
        }

        return ['lat' => null, 'lng' => null];
    }

    public function run(): void
    {
        // Create a couple of seeker accounts if they don't exist already.
        $seekers = User::where('role', 'seeker')->get();

        if ($seekers->isEmpty()) {
            $neighborhood = $this->cityData['الرياض'][0];
            $seeker = User::create([
                'name' => 'أحمد الشمري',
                'display_name' => 'أحمد الشمري',
                'email' => 'ahmed.alshehri@example.com',
                'email_verified_at' => now(),
                'password' => Hash::make(env('SEED_PASSWORD', 'SecureDemoPassword123!')),
                'role' => 'seeker',
                'city' => 'الرياض',
                'neighborhood' => $neighborhood['name'],
                'latitude' => $neighborhood['lat'],
                'longitude' => $neighborhood['lng'],
                'bio' => 'باحث عن الأثر ومهتم بدعم المبادرات المجتمعية في مدينة الرياض.',
                'pledge_accepted' => true,
            ]);

            $seekers = collect([$seeker]);
        }

        $gifts = Gift::all();

        $needs = [
            [
                'gift_slug' => 'teaching-children',
                'description' => 'نحتاج معلمة لتحفيظ القرآن لأطفال الحي في المسجد بعد صلاة العصر.',
                'city' => 'الرياض',
                'neighborhood' => 'حي الروضة',
                'status' => 'open',
            ],
            [
                'gift_slug' => 'gift-mushaf',
                'description' => 'نجمع تبرعات مصاحف لتوزيعها في مراكز تعليم كبار السن.',
                'city' => 'الرياض',
                'neighborhood' => 'حي الملقى',
                'status' => 'open',
            ],
            [
                'gift_slug' => 'zoom-room',
                'description' => 'نحتاج إلى متطوعة لفتح غرفة زوم لتحفيظ طالبات الجامعة أسبوعياً.',
                'city' => 'الرياض',
                'neighborhood' => 'حي الصحافة',
                'status' => 'open',
            ],
            [
                'gift_slug' => 'design-media',
                'description' => 'مطلوب تصميم إعلان لحملة خيرية لجمع التبرعات لتجهيز حلقات تحفيظ جديدة.',
                'city' => 'الرياض',
                'neighborhood' => 'حي الياسمين',
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
                'user_id' => $seekers->random()->id,
                'gift_id' => $gift->id,
                'description' => $needData['description'],
                'city' => $needData['city'],
                'neighborhood' => $needData['neighborhood'],
                'latitude' => $coordinates['lat'],
                'longitude' => $coordinates['lng'],
                'status' => $needData['status'],
            ]);
        }
    }
}
