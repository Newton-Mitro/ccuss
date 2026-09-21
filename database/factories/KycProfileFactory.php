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
        ];

        $level = fake()->randomElement($levels);

        return [
            'customer_id' => Customer::factory(),
            'primary_verified' => 0,
            'other_verified' => 0,
            'kyc_level' => $level,
        ];
    }

    public function minimal(): static
    {
        return $this->state(fn() => [
            'kyc_level' => 'MINIMAL',
            'primary_verified' => 0,
            'other_verified' => 0,
        ]);
    }

    public function basic(): static
    {
        return $this->state(fn() => [
            'kyc_level' => 'BASIC',
            'primary_verified' => 0,
            'other_verified' => 0,
        ]);
    }

    public function standard(): static
    {
        return $this->state(fn() => [
            'kyc_level' => 'STANDARD',
            'primary_verified' => 0,
            'other_verified' => 0,
        ]);
    }

    public function full(): static
    {
        return $this->state(fn() => [
            'kyc_level' => 'FULL',
            'primary_verified' => 0,
            'other_verified' => 0,
        ]);
    }

    public function enhanced(): static
    {
        return $this->state(fn() => [
            'kyc_level' => 'ENHANCED',
            'primary_verified' => 0,
            'other_verified' => 0,
        ]);
    }
}