<?php

namespace Database\Factories;

use App\BranchTreasuryModule\Models\CashAuditLog;
use App\BranchTreasuryModule\Models\TellerSession;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CashAuditLogFactory extends Factory
{
    protected $model = CashAuditLog::class;

    public function definition(): array
    {
        return [
            'teller_session_id' => TellerSession::factory(),
            'user_id' => User::factory(),
            'action' => $this->faker->randomElement(['OPEN_SESSION', 'CLOSE_SESSION', 'TRANSFER']),
            'details' => $this->faker->sentence(),
            'action_time' => now(),
        ];
    }
}