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
            'MINIMAL',
            'BASIC',
            'STANDARD',
            'FULL',
            'ENHANCED',
        ];

        $level = fake()->randomElement($levels);

        $verificationValue = match ($level) {
            'MINIMAL' => fake()->numberBetween(0, 3),
            'BASIC' => fake()->numberBetween(4, 5),
            'STANDARD' => fake()->numberBetween(6, 8),
            'FULL' => fake()->numberBetween(9, 10),
            'ENHANCED' => fake()->numberBetween(11, 15),
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
            'kyc_level' => 'MINIMAL',
            'verification_value' => fake()->numberBetween(0, 3),
        ]);
    }

    public function basic(): static
    {
        return $this->state(fn() => [
            'kyc_level' => 'BASIC',
            'verification_value' => fake()->numberBetween(4, 5),
        ]);
    }

    public function standard(): static
    {
        return $this->state(fn() => [
            'kyc_level' => 'STANDARD',
            'verification_value' => fake()->numberBetween(6, 8),
        ]);
    }

    public function full(): static
    {
        return $this->state(fn() => [
            'kyc_level' => 'FULL',
            'verification_value' => fake()->numberBetween(9, 10),
        ]);
    }

    public function enhanced(): static
    {
        return $this->state(fn() => [
            'kyc_level' => 'ENHANCED',
            'verification_value' => fake()->numberBetween(11, 15),
        ]);
    }
}