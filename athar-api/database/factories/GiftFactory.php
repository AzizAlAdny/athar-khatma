<?php

namespace Database\Factories;

use App\Models\Gift;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Gift>
 */
class GiftFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->word(),
            'slug' => fake()->slug(),
            'category' => fake()->word(),
            'description' => fake()->sentence(),
            'icon' => fake()->word(),
        ];
    }
}
