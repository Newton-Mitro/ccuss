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
use Illuminate\Support\Facades\DB;

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
        $ledgerAccounts = LedgerAccount::query()
            ->where('organization_id', $organization->id)
            ->where('status', true)
            ->get()
            ->keyBy('code');
        $entries = [];
        $debitTotal = 0.0;
        $creditTotal = 0.0;

        foreach (FinancialAccount::query()
            ->where('organization_id', $organization->id)
            ->whereJsonContains('metadata->seeded', true)
            ->get() as $financialAccount) {
            $ledgerCode = match ($financialAccount->account_type) {
                'CASH' => match ($financialAccount->account_no) {
                        'CASH-VAULT-001' => '1110',
                        'CASH-TELLER-001' => '1120',
                        'CASH-PETTY-001' => '1130',
                        default => '1100',
                    },
                'BANK' => '1200',
                'LOAN' => '1300',
                'SAVINGS' => '2100',
                'FIXED_DEPOSIT' => '2200',
                'RECURRING_DEPOSIT' => '2300',
                'SHARE' => '3100',
                default => null,
            };

            if (!$ledgerCode) {
                continue;
            }

            $movement = DB::table('financial_transaction_entries as entries')
                ->join('financial_transactions as transactions', 'transactions.id', '=', 'entries.financial_transaction_id')
                ->where('transactions.organization_id', $organization->id)
                ->where('transactions.status', 'POSTED')
                ->where('entries.financial_account_id', $financialAccount->id)
                ->selectRaw("COALESCE(SUM(CASE WHEN entries.direction = 'DEBIT' THEN entries.amount ELSE 0 END), 0) as debit_total")
                ->selectRaw("COALESCE(SUM(CASE WHEN entries.direction = 'CREDIT' THEN entries.amount ELSE 0 END), 0) as credit_total")
                ->first();
            $debitNormal = in_array($financialAccount->account_type, ['CASH', 'BANK', 'LOAN'], true);
            $netMovement = $debitNormal
                ? (float) $movement->debit_total - (float) $movement->credit_total
                : (float) $movement->credit_total - (float) $movement->debit_total;
            $residual = round((float) $financialAccount->balance - $netMovement, 4);

            if (abs($residual) < 0.0001) {
                continue;
            }

            $ledgerAccount = $ledgerAccounts->get($ledgerCode);
            if (!$ledgerAccount) {
                throw new \RuntimeException("Missing opening-balance ledger account {$ledgerCode}.");
            }

            $debit = $debitNormal ? max($residual, 0) : max(-$residual, 0);
            $credit = $debitNormal ? max(-$residual, 0) : max($residual, 0);
            $entries[] = [
                'account_id' => $ledgerAccount->id,
                'description' => 'Opening balance for ' . $financialAccount->account_no,
                'debit' => $debit,
                'credit' => $credit,
                'reference' => $financialAccount->account_no,
            ];
            $debitTotal += $debit;
            $creditTotal += $credit;
        }

        $offset = round($debitTotal - $creditTotal, 4);
        if (abs($offset) >= 0.0001) {
            $retainedEarnings = $ledgerAccounts->get('3300');
            if (!$retainedEarnings) {
                throw new \RuntimeException('Missing retained earnings ledger account 3300.');
            }

            $entries[] = [
                'account_id' => $retainedEarnings->id,
                'description' => 'Opening balance offset',
                'debit' => max(-$offset, 0),
                'credit' => max($offset, 0),
            ];
        }

        $existingVoucher = Voucher::query()
            ->where('organization_id', $organization->id)
            ->where('description', 'Opening balances')
            ->first();

        if ($existingVoucher) {
            $existingVoucher->entries()->delete();
            $existingVoucher->update([
                'branch_id' => $branchId,
                'fiscal_year_id' => $period->fiscal_year_id,
                'fiscal_period_id' => $period->id,
                'voucher_type' => 'OPENING',
                'voucher_date' => '2025-07-01',
                'status' => 'POSTED',
                'posted_by' => $user->id,
                'posted_at' => now(),
            ]);
            $existingVoucher->entries()->createMany($entries);
        } else {
            $voucher = app(VoucherService::class)->createDraft([
                'branch_id' => $branchId,
                'fiscal_period_id' => $period->id,
                'voucher_type' => 'OPENING',
                'voucher_date' => '2025-07-01',
                'description' => 'Opening balances',
                'entries' => $entries,
            ], $organization->id, $user->id);

            app(VoucherService::class)->post($voucher, $organization->id, $user->id);
        }

        $this->command?->info('Opening balance voucher seeded.');
    }
}