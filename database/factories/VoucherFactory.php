<?php

namespace Database\Factories;

use App\Accounting\Models\Voucher;
use App\UserRolePermissions\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class VoucherFactory extends Factory
{
    protected $model = Voucher::class;

    public function definition()
    {
        $types = [
            'CREDIT_OR_RECEIPT',
            'DEBIT_OR_PAYMENT',
            'JOURNAL_OR_NON_CASH',
            'PURCHASE',
            'SALE',
            'DEBIT_NOTE',
            'CREDIT_NOTE',
            'PETTY_CASH',
            'CONTRA',
        ];

        $statuses = ['DRAFT', 'APPROVED', 'POSTED', 'CANCELLED'];
        $status = $this->faker->randomElement($statuses);

        $creator = User::factory();
        $actor = User::factory(); // used for posted/approved/rejected

        return [
            // Relations (assign explicitly when needed)
            'fiscal_year_id' => null,
            'fiscal_period_id' => null,
            'branch_id' => null,

            // Core fields
            'voucher_date' => $this->faker->dateTimeThisYear(),
            'voucher_type' => $this->faker->randomElement($types),
            'voucher_no' => strtoupper($this->faker->bothify('VCHR-####')),
            'reference' => $this->faker->optional()->bothify('REF-####'),
            'narration' => $this->faker->sentence(),
            'status' => $status,

            // Audit fields
            'created_by' => $creator,
            'posted_by' => $actor,
            'approved_by' => $status === 'APPROVED' ? $actor : null,
            'rejected_by' => $status === 'CANCELLED' ? $actor : $actor,

            // Timestamps based on lifecycle
            'posted_at' => $status === 'POSTED' ? now() : null,
            'approved_at' => $status === 'APPROVED' ? now() : null,
            'rejected_at' => $status === 'CANCELLED' ? now() : null,

            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}