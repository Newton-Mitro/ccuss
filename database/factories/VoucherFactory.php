<?php

namespace Database\Factories;

use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\FiscalYear;
use App\GeneralAccounting\Models\Voucher;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class VoucherFactory extends Factory
{
    protected $model = Voucher::class;

    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'branch_id' => null,
            'fiscal_year_id' => FiscalYear::factory(),
            'fiscal_period_id' => FiscalPeriod::factory(),
            'voucher_no' => 'JV-' . fake()->unique()->numerify('######'),
            'voucher_type' => 'JOURNAL',
            'voucher_date' => '2025-07-15',
            'description' => fake()->sentence(),
            'status' => 'DRAFT',
            'created_by' => User::factory(),
            'posted_by' => null,
            'posted_at' => null,
        ];
    }

    public function posted(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'POSTED',
            'posted_by' => $attributes['created_by'],
            'posted_at' => now(),
        ]);
    }
}
