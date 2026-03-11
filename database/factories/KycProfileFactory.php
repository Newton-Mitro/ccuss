<?php

namespace Database\Factories;

use App\CostomerModule\Models\KycProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

class KycProfileFactory extends Factory
{
    protected $model = KycProfile::class;

    public function definition(): array
    {
        $kycLevels = ['BASIC', 'FULL', 'ENHANCED'];
        $riskLevels = ['LOW', 'MEDIUM', 'HIGH'];
        $verificationStatuses = ['PENDING', 'APPROVED', 'REJECTED'];

        return [
            'kyc_level' => $this->faker->randomElement($kycLevels),
            'risk_level' => $this->faker->randomElement($riskLevels),
            'verification_status' => $this->faker->randomElement($verificationStatuses),
            'verified_by' => null, // can be a user ID if needed
            'verified_at' => null,
            'remarks' => $this->faker->optional()->sentence(),
        ];
    }

    /** Mark profile as approved */
    public function approved(): self
    {
        return $this->state(fn(array $attributes) => [
            'verification_status' => 'APPROVED',
            'verified_at' => now(),
        ]);
    }

    /** Mark profile as rejected */
    public function rejected(): self
    {
        return $this->state(fn(array $attributes) => [
            'verification_status' => 'REJECTED',
            'verified_at' => now(),
        ]);
    }

    protected static function newFactory()
    {
        return KycProfileFactory::new();
    }
}