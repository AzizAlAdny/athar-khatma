<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GiftSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $gifts = [
            [
                'name' => 'تحفيظ كبيرات السن',
                'slug' => 'teaching-elderly',
                'category' => 'teaching',
                'icon' => 'user-round',
                'description' => 'تقديم جلسات تحفيظ ومراجعة للقرآن الكريم لكبيرات السن.',
            ],
            [
                'name' => 'تحفيظ صغار',
                'slug' => 'teaching-children',
                'category' => 'teaching',
                'icon' => 'baby',
                'description' => 'تعليم وتحفيظ القرآن الكريم للأطفال والناشئة.',
            ],
            [
                'name' => 'تعليم خادمات',
                'slug' => 'teaching-workers',
                'category' => 'teaching',
                'icon' => 'users',
                'description' => 'تعليم مبادئ القرآن الكريم واللغة العربية للعاملات المنزليات.',
            ],
            [
                'name' => 'فتح غرفة زوم',
                'slug' => 'zoom-room',
                'category' => 'tech',
                'icon' => 'video',
                'description' => 'استضافة حلقات قرآنية عبر منصة زوم.',
            ],
            [
                'name' => 'تصميم مونتاج أو إعلانات',
                'slug' => 'design-media',
                'category' => 'design',
                'icon' => 'pen-tool',
                'description' => 'تقديم خدمات التصميم والمونتاج للمبادرات القرآنية.',
            ],
            [
                'name' => 'كتابة محتوى',
                'slug' => 'content-writing',
                'category' => 'content',
                'icon' => 'edit-3',
                'description' => 'صياغة وكتابة محتوى إبداعي للمشاريع الخيرية.',
            ],
            [
                'name' => 'إهداء مصحف',
                'slug' => 'gift-mushaf',
                'category' => 'charity',
                'icon' => 'book-open',
                'description' => 'توزيع المصاحف كصدقة جارية.',
            ],
        ];

        foreach ($gifts as $gift) {
            DB::table('gifts')->insert(array_merge($gift, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}