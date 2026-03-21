<?php

namespace Database\Factories;

use App\CustomerModule\Models\KycProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

class KycProfileFactory extends Factory
{
    protected $model = KycProfile::class;

    public function definition(): array
    {
        $kycLevels = ['BASIC', 'FULL', 'ENHANCED'];
        $riskLevels = ['LOW', 'MEDIUM', 'HIGH'];

        return [
            'kyc_level' => fake()->randomElement($kycLevels),
            'risk_level' => fake()->randomElement($riskLevels),
        ];
    }

    protected static function newFactory()
    {
        return KycProfileFactory::new();
    }
}