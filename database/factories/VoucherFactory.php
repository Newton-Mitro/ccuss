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
        $types = ['CASH_RECEIPT', 'CASH_PAYMENT', 'JOURNAL'];
        $status = ['DRAFT', 'APPROVED', 'POSTED', 'CANCELLED'];
        $creatorId = User::factory();

        return [
            'fiscal_year_id' => null, // assign manually
            'fiscal_period_id' => null, // assign manually
            'branch_id' => null, // optional
            'voucher_date' => $this->faker->dateTimeThisYear(),
            'voucher_type' => $this->faker->randomElement($types),
            'voucher_no' => strtoupper($this->faker->bothify('VCHR-####')),
            'reference' => $this->faker->optional()->bothify('REF-####'),
            'created_by' => $creatorId,
            'approved_by' => null,
            'approved_at' => null,
            'narration' => $this->faker->sentence(),
            'status' => $this->faker->randomElement($status),
        ];
    }
}
