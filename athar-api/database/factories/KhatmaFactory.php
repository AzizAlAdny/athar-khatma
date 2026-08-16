<?php

namespace Database\Factories;

use App\Models\Khatma;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Khatma>
 */
class KhatmaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'completion_date' => fake()->dateTimeBetween('+1 week', '+1 month'),
            'status' => 'active',
            'impact_score' => fake()->numberBetween(10, 100),
        ];
    }
}
