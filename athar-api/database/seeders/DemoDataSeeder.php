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

        // Seed Khatma user with email khatmaweb@gmail.com
        $khatmaUser = User::updateOrCreate(
            ['email' => 'khatmaweb@gmail.com'],
            [
                'name' => 'خاتمة',
                'display_name' => 'خاتمة',
                'email_verified_at' => now(),
                'password' => Hash::make(env('SEED_PASSWORD', 'SecureDemoPassword123!')),
                'role' => 'khatma',
                'city' => 'الرياض',
                'neighborhood' => 'حي الصحافة',
                'latitude' => 24.8055,
                'longitude' => 46.6375,
                'bio' => 'خاتمة للقرآن الكريم مهتمة بترك أثر طيب والمساهمة في المبادرات والخدمات القرآنية المجتمعية.',
                'pledge_accepted' => true,
            ]
        );

        // Clear existing khatmas for this user for clean idempotent re-seeding
        $khatmaUser->khatmas()->delete();

        // Khatma records and all Khatma gifts for user Khatma
        $khatmasData = [
            [
                'completion_date' => now()->subDays(10)->toDateString(),
                'type' => 'فردية',
                'impact_score' => 60,
                'status' => 'active',
                'gifts' => [
                    [
                        'slug' => 'teaching-children',
                        'description' => 'تقديم جلسات تحفيظ وتجويد أسبوعية للأطفال والناشئة في مسجد الحي.',
                        'status' => 'pending',
                        'points_earned' => 25,
                    ],
                    [
                        'slug' => 'zoom-room',
                        'description' => 'استضافة حلقات قرآنية وتسميع عبر منصة زوم أسبوعياً.',
                        'status' => 'pending',
                        'points_earned' => 20,
                    ],
                    [
                        'slug' => 'design-media',
                        'description' => 'تصميم مونتاج وإعلانات وبوسترات رقمية للمبادرات القرآنية.',
                        'status' => 'pending',
                        'points_earned' => 15,
                    ],
                ],
            ],
            [
                'completion_date' => now()->subMonths(3)->toDateString(),
                'type' => 'جماعية',
                'impact_score' => 85,
                'status' => 'completed',
                'gifts' => [
                    [
                        'slug' => 'teaching-elderly',
                        'description' => 'جلسات تحفيظ وتلقين وتصحيح التلاوة لكبيرات السن في دار التحفيظ.',
                        'status' => 'completed',
                        'points_earned' => 30,
                    ],
                    [
                        'slug' => 'gift-mushaf',
                        'description' => 'توزيع مصاحف مفسرة كصدقة جارية على الطالبات والمستفيدات.',
                        'status' => 'completed',
                        'points_earned' => 30,
                    ],
                    [
                        'slug' => 'content-writing',
                        'description' => 'كتابة وصياغة محتوى إبداعي وتدبري لبرامج تعظيم القرآن.',
                        'status' => 'completed',
                        'points_earned' => 25,
                    ],
                ],
            ],
            [
                'completion_date' => now()->subMonths(7)->toDateString(),
                'type' => 'فردية',
                'impact_score' => 45,
                'status' => 'active',
                'gifts' => [
                    [
                        'slug' => 'teaching-workers',
                        'description' => 'تعليم سورة الفاتحة وقصار السور ومبادئ القراءة للعاملات المنزليات.',
                        'status' => 'pending',
                        'points_earned' => 25,
                    ],
                    [
                        'slug' => 'zoom-room',
                        'description' => 'حلقة مراجعة وتثبيت الحفظ عن بعد لطالبات الجامعة.',
                        'status' => 'pending',
                        'points_earned' => 20,
                    ],
                ],
            ],
        ];

        foreach ($khatmasData as $data) {
            $khatma = $khatmaUser->khatmas()->create([
                'completion_date' => $data['completion_date'],
                'impact_score' => $data['impact_score'],
                'status' => $data['status'],
            ]);

            foreach ($data['gifts'] as $giftItem) {
                $gift = $gifts->where('slug', $giftItem['slug'])->first() ?? $gifts->first();
                if ($gift) {
                    $khatma->khatmaGifts()->create([
                        'gift_id' => $gift->id,
                        'description' => $giftItem['description'],
                        'status' => $giftItem['status'],
                        'points_earned' => $giftItem['points_earned'],
                    ]);
                }
            }
        }

        $this->command->info('Khatma user and all Khatma gifts seeded successfully: khatmaweb@gmail.com');
    }
}

