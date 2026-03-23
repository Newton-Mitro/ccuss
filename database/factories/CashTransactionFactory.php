<?php

namespace Database\Factories;

use App\BranchTreasuryModule\Models\CashTransaction;
use App\BranchTreasuryModule\Models\TellerSession;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CashTransactionFactory extends Factory
{
    protected $model = CashTransaction::class;

    public function definition(): array
    {
        return [
            'teller_session_id' => TellerSession::factory(),
            'amount' => $this->faker->randomFloat(2, 100, 20000),
            'type' => $this->faker->randomElement(['CASH_IN', 'CASH_OUT']),
            'source_type' => User::class,
            'source_id' => User::factory(),
            'reference' => $this->faker->uuid(),
            'transaction_date' => now(),
            'remarks' => $this->faker->sentence(),
        ];
    }
}