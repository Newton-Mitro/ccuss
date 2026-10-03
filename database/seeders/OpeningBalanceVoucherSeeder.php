<?php

namespace Database\Seeders;

use App\FinancialServices\Models\FinancialAccount;
use App\GeneralAccounting\Application\VoucherService;
use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\LedgerAccount;
use App\GeneralAccounting\Models\Voucher;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Seeder;

class OpeningBalanceVoucherSeeder extends Seeder
{
    public function run(): void
    {
        $organization = Organization::query()->where('code', 'ORG-001')->firstOrFail();
        $user = User::query()->where('email', 'super.admin@email.com')->firstOrFail();
        $branchId = $organization->branches()->oldest('id')->value('id');
        $period = FiscalPeriod::query()
            ->whereHas('fiscalYear', fn($query) => $query->where('organization_id', $organization->id))
            ->where('name', 'July 2025')
            ->firstOrFail();
        $cashAccount = LedgerAccount::query()
            ->where('organization_id', $organization->id)
            ->where('code', '1100')
            ->firstOrFail();
        $shareCapitalAccount = LedgerAccount::query()
            ->where('organization_id', $organization->id)
            ->where('code', '3100')
            ->firstOrFail();
        $shareFinancialAccount = FinancialAccount::query()
            ->where('organization_id', $organization->id)
            ->where('account_type', 'SHARE')
            ->oldest('id')
            ->firstOrFail();

        if (
            Voucher::query()
                ->where('organization_id', $organization->id)
                ->where('description', 'Opening balances')
                ->where('status', 'POSTED')
                ->exists()
        ) {
            return;
        }

        $voucher = app(VoucherService::class)->createDraft([
            'branch_id' => $branchId,
            'fiscal_period_id' => $period->id,
            'voucher_type' => 'OPENING',
            'voucher_date' => '2025-07-01',
            'description' => 'Opening balances',
            'entries' => [
                [
                    'account_id' => $cashAccount->id,
                    'debit' => 100000,
                    'credit' => 0,
                ],
                [
                    'account_id' => $shareCapitalAccount->id,
                    'financial_account_id' => $shareFinancialAccount->id,
                    'debit' => 0,
                    'credit' => 100000,
                ],
            ],
        ], $organization->id, $user->id);

        app(VoucherService::class)->post($voucher, $organization->id, $user->id);
        $this->command?->info('Opening balance voucher seeded.');
    }
}