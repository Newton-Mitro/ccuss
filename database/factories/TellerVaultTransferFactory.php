<?php

namespace Database\Factories;

use App\BranchTreasuryModule\Models\TellerSession;
use App\BranchTreasuryModule\Models\TellerVaultTransfer;
use App\BranchTreasuryModule\Models\Vault;
use Illuminate\Database\Eloquent\Factories\Factory;

class TellerVaultTransferFactory extends Factory
{
    protected $model = TellerVaultTransfer::class;

    public function definition(): array
    {
        return [
            'vault_id' => Vault::factory(),
            'teller_session_id' => TellerSession::factory(),
            'amount' => $this->faker->randomFloat(2, 500, 30000),
            'type' => $this->faker->randomElement(['CASH_TO_TELLER', 'CASH_TO_VAULT']),
            'transfer_date' => now(),
        ];
    }
}