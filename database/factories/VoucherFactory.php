<?php

namespace Database\Factories;

use App\Accounting\Models\Voucher;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class VoucherFactory extends Factory
{
    protected $model = Voucher::class;

    public function definition()
    {
        $types = [
            'OPENING_BALANCE',       // Initial balance of accounts
            'CLOSING_BALANCE',       // Closing balance (optional)
            'CREDIT_OR_RECEIPT',     // Cash/bank inflow
            'DEBIT_OR_PAYMENT',      // Cash/bank outflow
            'JOURNAL_OR_NON_CASH',   // Non-cash adjustments / transfers
            'PURCHASE',              // Purchase invoice
            'SALE',                  // Sales invoice
            'DEBIT_NOTE',            // Adjustment reducing payable
            'CREDIT_NOTE',           // Adjustment reducing receivable
            'CONTRA',                // Bank/Cash transfer within accounts
        ];

        $statuses = ['PENDING', 'APPROVED', 'POSTED', 'CANCELLED'];
        $status = $this->faker->randomElement($statuses);

        // IDs should be assigned in seeder or test, not factories directly
        return [
            // Relations
            'fiscal_year_id' => null,
            'accounting_period_id' => null,
            'branch_id' => null,

            // Core fields
            'voucher_date' => $this->faker->dateTimeThisYear(),
            'voucher_type' => $this->faker->randomElement($types),
            'voucher_no' => strtoupper($this->faker->bothify('VCHR-####')),
            'reference' => $this->faker->optional()->bothify('REF-####'),
            'total_amount' => $this->faker->randomFloat(2, 1000, 50000),
            'narration' => $this->faker->sentence(),
            'status' => $status,

            // Audit fields
            'created_by' => User::factory(),  // Will auto-resolve to a user id
            'posted_by' => $status === 'POSTED' ? User::factory() : null,
            'approved_by' => $status === 'APPROVED' ? User::factory() : null,
            'rejected_by' => $status === 'CANCELLED' ? User::factory() : null,

            // Timestamps
            'posted_at' => $status === 'POSTED' ? now() : null,
            'approved_at' => $status === 'APPROVED' ? now() : null,
            'rejected_at' => $status === 'CANCELLED' ? now() : null,

            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}