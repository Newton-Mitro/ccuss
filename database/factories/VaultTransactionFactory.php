<?php

namespace Database\Factories;

use App\BranchTreasuryModule\Models\Teller;
use App\BranchTreasuryModule\Models\Vault;
use App\BranchTreasuryModule\Models\VaultTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;

class VaultTransactionFactory extends Factory
{
    protected $model = VaultTransaction::class;

    public function definition(): array
    {
        return [
            'vault_id' => Vault::factory(),
            'teller_id' => Teller::factory(),
            'amount' => $this->faker->randomFloat(2, 1000, 50000),
            'type' => $this->faker->randomElement(['IN', 'OUT']),
            'reference' => $this->faker->uuid(),
            'transaction_date' => now(),
            'remarks' => $this->faker->sentence(),
        ];
    }
}