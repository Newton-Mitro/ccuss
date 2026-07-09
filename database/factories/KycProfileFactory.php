<?php

namespace Database\Factories;

use App\CustomerModule\Models\Customer;
use App\CustomerModule\Models\KycProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

class KycProfileFactory extends Factory
{
    protected $model = KycProfile::class;

    public function definition(): array
    {
        $levels = [
            'minimal',
            'basic',
            'standard',
            'full',
            'enhanced',
        ];

        $level = fake()->randomElement($levels);

        $verificationValue = match ($level) {
            'minimal' => fake()->numberBetween(0, 3),
            'basic' => fake()->numberBetween(4, 5),
            'standard' => fake()->numberBetween(6, 8),
            'full' => fake()->numberBetween(9, 10),
            'enhanced' => fake()->numberBetween(11, 15),
        };

        return [
            'customer_id' => Customer::factory(),

            'verification_value' => $verificationValue,

            'kyc_level' => $level,
        ];
    }

    public function minimal(): static
    {
        return $this->state(fn() => [
            'kyc_level' => 'minimal',
            'verification_value' => fake()->numberBetween(0, 3),
        ]);
    }

    public function basic(): static
    {
        return $this->state(fn() => [
            'kyc_level' => 'basic',
            'verification_value' => fake()->numberBetween(4, 5),
        ]);
    }

    public function standard(): static
    {
        return $this->state(fn() => [
            'kyc_level' => 'standard',
            'verification_value' => fake()->numberBetween(6, 8),
        ]);
    }

    public function full(): static
    {
        return $this->state(fn() => [
            'kyc_level' => 'full',
            'verification_value' => fake()->numberBetween(9, 10),
        ]);
    }

    public function enhanced(): static
    {
        return $this->state(fn() => [
            'kyc_level' => 'enhanced',
            'verification_value' => fake()->numberBetween(11, 15),
        ]);
    }
}