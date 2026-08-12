<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Gift;
use App\Models\Need;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class NeedSeeder extends Seeder
{
    public function run(): void
    {
        // Create a couple of seeker accounts if they don't exist already.
        $seekers = User::where('role', 'seeker')->get();

        if ($seekers->isEmpty()) {
            $seeker = User::create([
                'name' => 'أحمد الشمري',
                'email' => 'ahmed@example.com',
                'password' => Hash::make(env('SEED_PASSWORD', 'SecureDemoPassword123!')),
                'role' => 'seeker',
                'city' => 'الرياض',
            ]);

            $seekers = collect([$seeker]);
        }

        $gifts = Gift::all();

        $needs = [
            [
                'gift_slug' => 'teaching-children',
                'description' => 'نحتاج معلمة لتحفيظ القرآن لأطفال الحي في المسجد بعد صلاة العصر.',
                'city' => 'الرياض، حي السلام',
                'status' => 'open',
            ],
            [
                'gift_slug' => 'gift-mushaf',
                'description' => 'نجمع تبرعات مصاحف لتوزيعها في مراكز تعليم كبار السن.',
                'city' => 'جدة، حي الروضة',
                'status' => 'open',
            ],
            [
                'gift_slug' => 'zoom-room',
                'description' => 'نحتاج إلى متطوعة لفتح غرفة زوم لتحفيظ طالبات الجامعة أسبوعياً.',
                'city' => 'الدمام',
                'status' => 'open',
            ],
            [
                'gift_slug' => 'design-media',
                'description' => 'مطلوب تصميم إعلان لحملة خيرية لجمع التبرعات لتجهيز حلقات تحفيظ جديدة.',
                'city' => 'مكة المكرمة',
                'status' => 'open',
            ],
        ];

        foreach ($needs as $needData) {
            $gift = $gifts->where('slug', $needData['gift_slug'])->first();
            if (!$gift) {
                continue;
            }

            Need::create([
                'user_id' => $seekers->random()->id,
                'gift_id' => $gift->id,
                'description' => $needData['description'],
                'city' => $needData['city'],
                'status' => $needData['status'],
            ]);
        }
    }
}