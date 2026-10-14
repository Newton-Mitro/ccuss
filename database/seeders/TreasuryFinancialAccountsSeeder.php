<?php

namespace Database\Seeders;

use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialTransaction;
use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\FiscalYear;
use App\GeneralAccounting\Models\LedgerAccount;
use App\GeneralAccounting\Models\Voucher;
use App\SystemAdministration\Models\Organization;
use App\TreasuryAndCash\Models\Bank;
use App\TreasuryAndCash\Models\BankAccount;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Ramsey\Uuid\Uuid;

class TreasuryFinancialAccountsSeeder extends Seeder
{
    private const OPENING_DATE = '2025-07-01';

    public function run(): void
    {
        $organization = Organization::query()->where('code', 'ORG-001')->firstOrFail();
        $branchId = $organization->branches()->oldest('id')->value('id');
        $ledgerAccounts = LedgerAccount::query()
            ->where('organization_id', $organization->id)
            ->whereIn('code', ['1110', '1120', '1130', '1200', '1210'])
            ->get()
            ->keyBy('code');

        DB::transaction(function () use ($organization, $branchId, $ledgerAccounts): void {
            foreach ([
                [
                    'bank_code' => 'DBBL',
                    'bank_name' => 'Dutch-Bangla Bank PLC',
                    'bank_short_name' => 'DBBL',
                    'financial_account_no' => 'BANK-DBBL-001',
                    'financial_account_name' => 'Dutch-Bangla Bank Operating Account',
                    'account_number' => 'DBBL-CCUSS-001',
                    'account_name' => 'CCUSS Operating Account',
                    'routing_number' => '090274639',
                    'opening_balance' => 500000,
                ],
                [
                    'bank_code' => 'SONALI',
                    'bank_name' => 'Sonali Bank PLC',
                    'bank_short_name' => 'Sonali',
                    'financial_account_no' => 'BANK-SONALI-001',
                    'financial_account_name' => 'Sonali Bank Reserve Account',
                    'account_number' => 'SONALI-CCUSS-001',
                    'account_name' => 'CCUSS Reserve Account',
                    'routing_number' => '200100101',
                    'opening_balance' => 300000,
                ],
            ] as $bankDefinition) {
                $bank = Bank::query()->updateOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'code' => $bankDefinition['bank_code'],
                    ],
                    [
                        'name' => $bankDefinition['bank_name'],
                        'short_name' => $bankDefinition['bank_short_name'],
                        'status' => true,
                    ],
                );

                $financialAccount = FinancialAccount::query()->updateOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'account_no' => $bankDefinition['financial_account_no'],
                    ],
                    [
                        'branch_id' => $branchId,
                        'product_type' => null,
                        'product_id' => null,
                        'name' => $bankDefinition['financial_account_name'],
                        'account_type' => 'BANK',
                        'status' => 'ACTIVE',
                        'balance' => $bankDefinition['opening_balance'],
                        'available_balance' => $bankDefinition['opening_balance'],
                        'opened_at' => self::OPENING_DATE,
                        'metadata' => ['seeded' => true, 'bank_code' => $bank->code],
                    ],
                );

                BankAccount::query()->updateOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'account_number' => $bankDefinition['account_number'],
                    ],
                    [
                        'branch_id' => $branchId,
                        'bank_id' => $bank->id,
                        'financial_account_id' => $financialAccount->id,
                        'account_name' => $bankDefinition['account_name'],
                        'routing_number' => $bankDefinition['routing_number'],
                        'account_type' => 'CURRENT',
                        'opening_balance' => $bankDefinition['opening_balance'],
                        'is_reconcilable' => true,
                        'status' => 'ACTIVE',
                    ],
                );

                $this->seedOpeningMovement(
                    $organization,
                    $branchId,
                    $financialAccount,
                    $bankDefinition['opening_balance'],
                    'DEPOSIT',
                    'DEBIT',
                    $ledgerAccounts->get('1200'),
                    $ledgerAccounts->get('1210'),
                    $bankDefinition['financial_account_no'],
                );
            }

            foreach ([
                ['CASH-VAULT-001', 'Main Vault Cash Account', 'CASH', 'Main Vault', 1000000, '1110'],
                ['CASH-TELLER-001', 'Main Teller Cash Account', 'CASH', 'Main Teller', 100000, '1120'],
                ['CASH-PETTY-001', 'Operations Petty Cash Account', 'CASH', 'Operations Petty Cash', 10000, '1130'],
            ] as [$accountNo, $name, $accountType, $cashLocation, $amount, $ledgerCode]) {
                $account = FinancialAccount::query()->updateOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'account_no' => $accountNo,
                    ],
                    [
                        'branch_id' => $branchId,
                        'product_type' => null,
                        'product_id' => null,
                        'name' => $name,
                        'account_type' => $accountType,
                        'status' => 'ACTIVE',
                        'balance' => $amount,
                        'available_balance' => $amount,
                        'opened_at' => self::OPENING_DATE,
                        'metadata' => ['seeded' => true, 'cash_location' => $cashLocation],
                    ],
                );

                $this->seedOpeningMovement(
                    $organization,
                    $branchId,
                    $account,
                    $amount,
                    'DEPOSIT',
                    'DEBIT',
                    $ledgerAccounts->get($ledgerCode),
                    $ledgerAccounts->get('1210'),
                    $accountNo,
                );
            }
        });

        $this->command?->info('Treasury financial accounts, transactions, and vouchers seeded.');
    }

    private function seedOpeningMovement(
        Organization $organization,
        int $branchId,
        FinancialAccount $financialAccount,
        float $amount,
        string $transactionType,
        string $financialDirection,
        ?LedgerAccount $debitLedgerAccount,
        ?LedgerAccount $creditLedgerAccount,
        string $accountNo,
        ?FinancialAccount $creditFinancialAccount = null,
    ): void {
        if (!$debitLedgerAccount || !$creditLedgerAccount) {
            throw new \RuntimeException("Missing seeded ledger account for {$accountNo}.");
        }

        $idempotencyKey = Uuid::uuid5(
            Uuid::NAMESPACE_DNS,
            $organization->id . ':' . $financialAccount->id . ':' . $financialAccount->account_type,
        )->toString();
        $transactionNo = 'FT-OPEN-' . str_pad($financialAccount->id, 8, '0', STR_PAD_LEFT);
        $transaction = FinancialTransaction::query()->updateOrCreate(
            [
                'organization_id' => $organization->id,
                'transaction_no' => $transactionNo,
            ],
            [
                'idempotency_key' => $idempotencyKey,
                'branch_id' => $branchId,
                'transaction_type' => $transactionType,
                'transaction_date' => self::OPENING_DATE,
                'amount' => $amount,
                'currency' => 'BDT',
                'status' => 'POSTED',
                'reference' => $accountNo,
                'description' => "Opening {$transactionType} for {$financialAccount->name}",
                'posted_at' => now(),
            ],
        );

        $transactionEntry = $transaction->entries()->firstOrCreate(
            [
                'financial_account_id' => $financialAccount->id,
                'direction' => $financialDirection,
            ],
            [
                'amount' => $amount,
                'description' => "Opening {$transactionType} for {$financialAccount->name}",
                'line_no' => 1,
            ],
        );
        $transactionEntry->fill([
            'amount' => $amount,
            'description' => "Opening {$transactionType} for {$financialAccount->name}",
        ])->save();

        if ($creditFinancialAccount) {
            $creditEntry = $transaction->entries()->firstOrCreate(
                [
                    'financial_account_id' => $creditFinancialAccount->id,
                    'direction' => 'CREDIT',
                ],
                [
                    'amount' => $amount,
                    'description' => "Opening {$transactionType} offset for {$creditFinancialAccount->name}",
                    'line_no' => 2,
                ],
            );
            $creditEntry->fill([
                'amount' => $amount,
                'description' => "Opening {$transactionType} offset for {$creditFinancialAccount->name}",
            ])->save();
        }

        $fiscalYear = FiscalYear::query()
            ->where('organization_id', $organization->id)
            ->where('is_current', true)
            ->firstOrFail();
        $fiscalPeriod = FiscalPeriod::query()
            ->where('fiscal_year_id', $fiscalYear->id)
            ->where('status', 'OPEN')
            ->firstOrFail();
        $voucher = Voucher::query()->updateOrCreate(
            [
                'organization_id' => $organization->id,
                'financial_transaction_id' => $transaction->id,
            ],
            [
                'branch_id' => $branchId,
                'fiscal_year_id' => $fiscalYear->id,
                'fiscal_period_id' => $fiscalPeriod->id,
                'voucher_no' => 'VOU-OPEN-' . str_pad($financialAccount->id, 8, '0', STR_PAD_LEFT),
                'voucher_type' => 'OPENING',
                'voucher_date' => self::OPENING_DATE,
                'description' => "Opening {$transactionType} for {$financialAccount->name}",
                'status' => 'POSTED',
                'posted_by' => null,
                'posted_at' => now(),
            ],
        );

        $debitEntry = $voucher->entries()->firstOrCreate(
            [
                'account_id' => $debitLedgerAccount->id,
                'line_no' => 1,
            ],
            [
                'branch_id' => $branchId,
                'debit' => $amount,
                'credit' => 0,
                'reference' => $accountNo,
                'description' => $financialAccount->name,
            ],
        );
        $debitEntry->fill([
            'branch_id' => $branchId,
            'debit' => $amount,
            'credit' => 0,
            'reference' => $accountNo,
            'description' => $financialAccount->name,
        ])->save();

        $creditEntry = $voucher->entries()->firstOrCreate(
            [
                'account_id' => $creditLedgerAccount->id,
                'line_no' => 2,
            ],
            [
                'branch_id' => $branchId,
                'debit' => 0,
                'credit' => $amount,
                'reference' => $accountNo,
                'description' => $creditFinancialAccount?->name ?? $creditLedgerAccount->name,
            ],
        );
        $creditEntry->fill([
            'branch_id' => $branchId,
            'debit' => 0,
            'credit' => $amount,
            'reference' => $accountNo,
            'description' => $creditFinancialAccount?->name ?? $creditLedgerAccount->name,
        ])->save();
    }
}