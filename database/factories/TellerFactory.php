<?php

namespace Database\Factories;

use App\BranchTreasuryModule\Models\Teller;
use App\SubledgerModule\Models\Account;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TellerFactory extends Factory
{
    protected $model = Teller::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'branch_id' => Branch::factory(),
            'account_id' => Account::factory(),
            'code' => strtoupper($this->faker->unique()->bothify('TLR###')),
            'name' => $this->faker->name(),
            'max_cash_limit' => 500000,
            'max_transaction_limit' => 100000,
            'is_active' => true,
        ];
    }
}