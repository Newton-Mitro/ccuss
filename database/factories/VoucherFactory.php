<?php

namespace Database\Factories;

use App\FinanceAndAccounting\Models\Voucher;
use App\SystemAdministration\Models\User;
use App\SystemAdministration\Models\Branch;
use App\FinanceAndAccounting\Models\FiscalYear;
use App\FinanceAndAccounting\Models\AccountingPeriod;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

class VoucherFactory extends Factory
{
    protected $model = Voucher::class;

    public function definition(): array
    {
        $types = [
            'OPENING_BALANCE',
            'CLOSING_BALANCE',
            'CREDIT_OR_RECEIPT',
            'DEBIT_OR_PAYMENT',
            'JOURNAL_OR_NON_CASH',
            'PURCHASE',
            'SALE',
            'DEBIT_NOTE',
            'CREDIT_NOTE',
            'CONTRA',
        ];

        $statuses = ['pending', 'approved', 'POSTED', 'cancelled'];
        $status = fake()->randomElement($statuses);

        // Create organization
        $organization = Organization::factory()->create();

        // Relations within the same organization
        $fiscalYear = FiscalYear::factory()->create(['organization_id' => $organization->id]);
        $accountingPeriod = AccountingPeriod::factory()->create([
            'organization_id' => $organization->id,
            'fiscal_year_id' => $fiscalYear->id,
        ]);
        $branch = Branch::factory()->create(['organization_id' => $organization->id]);

        // Users for audit fields
        $creator = User::factory()->create();
        $poster = $status === 'POSTED' ? User::factory()->create() : null;
        $approver = $status === 'approved' ? User::factory()->create() : null;
        $rejector = $status === 'cancelled' ? User::factory()->create() : null;

        return [
            'organization_id' => $organization->id,
            'fiscal_year_id' => $fiscalYear->id,
            'accounting_period_id' => $accountingPeriod->id,
            'branch_id' => $branch->id,

            'voucher_date' => fake()->dateTimeThisYear(),
            'voucher_type' => fake()->randomElement($types),
            'voucher_no' => strtoupper(fake()->bothify('VCHR-####')),
            'reference' => fake()->optional()->bothify('REF-####'),
            'total_amount' => fake()->randomFloat(2, 1000, 50000),
            'narration' => fake()->sentence(),
            'status' => $status,

            'created_by' => $creator->id,
            'posted_by' => $poster?->id,
            'approved_by' => $approver?->id,
            'rejected_by' => $rejector?->id,

            'posted_at' => $status === 'POSTED' ? now() : null,
            'approved_at' => $status === 'approved' ? now() : null,
            'rejected_at' => $status === 'cancelled' ? now() : null,

            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}