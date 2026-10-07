<?php

namespace Database\Factories;

use App\Enums\TestStatus;
use App\Models\Test;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TestFactory extends Factory
{
    protected $model = Test::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'token' => Test::generateToken(),
            'start_at' => fake()->optional(0.7)->dateTimeBetween('now', '+30 days'),
            'end_at' => fake()->optional(0.5)->dateTimeBetween('+30 days', '+60 days'),
            'duration_minutes' => fake()->randomElement([30, 60, 90, 120]),
            'status' => fake()->randomElement(TestStatus::cases()),
            'show_result' => fake()->boolean(80),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn () => ['status' => TestStatus::DRAFT]);
    }

    public function published(): static
    {
        return $this->state(fn () => ['status' => TestStatus::PUBLISHED]);
    }

    public function archived(): static
    {
        return $this->state(fn () => ['status' => TestStatus::ARCHIVED]);
    }
}
