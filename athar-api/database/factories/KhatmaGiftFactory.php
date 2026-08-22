<?php

namespace Database\Factories;

use App\Models\KhatmaGift;
use App\Models\Khatma;
use App\Models\Gift;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<KhatmaGift>
 */
class KhatmaGiftFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'khatma_id' => Khatma::factory(),
            'gift_id' => Gift::factory(),
            'status' => 'pending',
        ];
    }
}
