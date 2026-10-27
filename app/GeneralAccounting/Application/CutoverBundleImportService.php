<?php

namespace App\GeneralAccounting\Application;

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Models\DepositProduct;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialTransaction;
use App\FinancialServices\Models\LoanProduct;
use App\FinancialServices\Models\LoanSchedule;
use App\FinancialServices\Models\LoanScheduleComponent;
use App\FinancialServices\Models\RecurringDepositInstallment;
use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\LedgerAccount;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Models\BankAccount;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\CashCount;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Models\PettyCashFund;
use App\TreasuryAndCash\Models\Teller;
use App\TreasuryAndCash\Models\TellerSession;
use App\TreasuryAndCash\Models\Vault;
use App\TreasuryAndCash\Models\VaultSession;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;
use RuntimeException;
use ZipArchive;

class CutoverBundleImportService
{
    private const FILES = [
        'customers.csv' => ['customer_no', 'type', 'name', 'identification_type', 'identification_number', 'branch_code', 'primary_phone', 'primary_email', 'dob', 'gender', 'status'],
        'accounts.csv' => ['account_no', 'customer_no', 'branch_code', 'account_type', 'product_code', 'opening_balance', 'ledger_account_code', 'status', 'opened_at', 'membership_no', 'member_since', 'principal_amount', 'disbursed_amount', 'contractual_rate', 'interest_calculation', 'interest_frequency', 'term_value', 'term_unit', 'repayment_frequency', 'scheduled_principal_amount', 'grace_days', 'started_at', 'maturity_date', 'maturity_amount', 'maturity_instruction', 'installment_amount', 'installment_frequency', 'total_installments', 'paid_installments'],
        'loan_schedules.csv' => ['account_no', 'installment_no', 'due_date', 'opening_principal', 'scheduled_principal', 'scheduled_interest', 'scheduled_fee', 'scheduled_protection_fee', 'total_due', 'total_paid', 'principal_paid', 'interest_paid', 'fee_paid', 'protection_fee_paid'],
        'loan_arrears.csv' => ['account_no', 'installment_no', 'as_of_date', 'days_overdue', 'principal_overdue', 'interest_overdue', 'fee_overdue', 'total_overdue'],
        'recurring_installments.csv' => ['account_no', 'installment_no', 'due_date', 'amount_due', 'amount_paid', 'fine_amount', 'status', 'paid_at'],
        'bank_accounts.csv' => ['financial_account_no', 'branch_code', 'account_name', 'account_number', 'routing_number', 'account_type', 'is_reconcilable', 'status'],
        'cash_locations.csv' => ['code', 'name', 'type', 'branch_code', 'financial_account_no', 'user_email', 'maximum_cash', 'maximum_balance', 'custodian_email', 'fund_limit', 'current_balance', 'method'],
    ];

    public function __construct(private readonly OpeningBalanceService $openingBalanceService) {}

    public function templates(): array
    {
        $samples = $this->sampleRows();
        $templates = [];
        foreach (self::FILES as $filename => $headers) {
            $stream = fopen('php://temp', 'r+');
            fputcsv($stream, $headers);
            foreach ($samples[$filename] ?? [] as $sample) {
                fputcsv($stream, array_map(fn (string $header): string => (string) ($sample[$header] ?? ''), $headers));
            }
            rewind($stream);
            $templates[] = [
                'name' => $filename,
                'contents' => stream_get_contents($stream),
            ];
            fclose($stream);
        }

        $templates[] = [
            'name' => 'README.txt',
            'contents' => "CUTOVER IMPORT SAMPLE DATA\n\n".
                "The CSV rows in this ZIP are illustrative examples, not your organization's data.\n".
                "Replace every EXAMPLE-* identifier, GL-* ledger code, SAMPLE-* product code, and teller@example.invalid email with actual configured records before importing.\n".
                "Keep all CSV filenames and headers unchanged. Remove sample rows you do not need. Keep account_no, customer_no, product_code, branch_code, and installment references consistent across files.\n".
                "The selected import cutover date defaults to 2026-10-28. Loan arrears as_of_date must match the date selected in the import screen.\n".
                "Preconfigure branches, deposit/loan products, staff users, and GL accounts first. The importer does not create products, users, branches, or ledger mappings.\n".
                "Only current active records and balances are imported; old transaction history is not.\n",
        ];

        return $templates;
    }

    private function sampleRows(): array
    {
        $account = static function (string $accountNo, string $type, string $balance, string $ledger, array $extra = []): array {
            return [
                'account_no' => $accountNo,
                'customer_no' => in_array($type, ['SAVINGS', 'SHARE', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT', 'LOAN'], true) ? 'EXAMPLE-MEMBER-001' : '',
                'branch_code' => 'EXAMPLE-BRANCH',
                'account_type' => $type,
                'product_code' => $extra['product_code'] ?? '',
                'opening_balance' => $balance,
                'ledger_account_code' => $ledger,
                'status' => 'ACTIVE',
                'opened_at' => '2025-01-01',
                ...$extra,
            ];
        };

        $installments = [];
        for ($number = 1; $number <= 12; $number++) {
            $paid = $number <= 3 ? '10.00' : '0.00';
            $installments[] = [
                'account_no' => 'EXAMPLE-RDP-001',
                'installment_no' => (string) $number,
                'due_date' => \Illuminate\Support\Carbon::parse('2026-07-28')->addMonths($number - 1)->toDateString(),
                'amount_due' => '10.00',
                'amount_paid' => $paid,
                'fine_amount' => '0.00',
                'status' => $number <= 3 ? 'PAID' : 'PENDING',
                'paid_at' => $number <= 3 ? '2026-'.sprintf('%02d', 7 + $number - 1).'-28 12:00:00' : '',
            ];
        }

        return [
            'customers.csv' => [[
                'customer_no' => 'EXAMPLE-MEMBER-001',
                'type' => 'INDIVIDUAL',
                'name' => 'Example Member',
                'identification_type' => 'NATIONAL_IDENTIFICATION_NUMBER',
                'identification_number' => 'EXAMPLE-NID-001',
                'branch_code' => 'EXAMPLE-BRANCH',
                'primary_phone' => '+8801000000000',
                'primary_email' => 'member@example.invalid',
                'dob' => '1990-01-01',
                'gender' => 'OTHER',
                'status' => 'ACTIVE',
            ]],
            'accounts.csv' => [
                $account('EXAMPLE-SAV-001', 'SAVINGS', '2500.00', 'GL-SAVINGS-CONTROL', ['product_code' => 'SAMPLE-SAVINGS']),
                $account('EXAMPLE-SHR-001', 'SHARE', '500.00', 'GL-SHARE-CAPITAL', ['product_code' => 'SAMPLE-SHARE', 'membership_no' => 'EXAMPLE-MEMBERSHIP-001', 'member_since' => '2025-01-01']),
                $account('EXAMPLE-FDR-001', 'FIXED_DEPOSIT', '1000.00', 'GL-FIXED-DEPOSIT', ['product_code' => 'SAMPLE-FIXED', 'principal_amount' => '1000.00', 'contractual_rate' => '8.00', 'term_value' => '12', 'term_unit' => 'MONTH', 'started_at' => '2025-10-28', 'maturity_date' => '2026-10-28', 'maturity_amount' => '1080.00', 'maturity_instruction' => 'PAYOUT']),
                $account('EXAMPLE-RDP-001', 'RECURRING_DEPOSIT', '120.00', 'GL-RECURRING-DEPOSIT', ['product_code' => 'SAMPLE-RECURRING', 'installment_amount' => '10.00', 'installment_frequency' => 'MONTHLY', 'total_installments' => '12', 'paid_installments' => '3', 'started_at' => '2026-07-28', 'maturity_date' => '2027-06-28']),
                $account('EXAMPLE-LOAN-001', 'LOAN', '800.00', 'GL-LOANS-RECEIVABLE', ['product_code' => 'SAMPLE-LOAN', 'principal_amount' => '1000.00', 'disbursed_amount' => '1000.00', 'contractual_rate' => '12.00', 'interest_calculation' => 'REDUCING_BALANCE', 'interest_frequency' => 'MONTHLY', 'term_value' => '12', 'term_unit' => 'MONTH', 'repayment_frequency' => 'MONTHLY', 'scheduled_principal_amount' => '100.00', 'grace_days' => '0', 'maturity_date' => '2027-01-01']),
                $account('EXAMPLE-CASH-VAULT', 'CASH', '5000.00', 'GL-CASH-ON-HAND'),
                $account('EXAMPLE-CASH-TELLER', 'CASH', '1000.00', 'GL-CASH-ON-HAND'),
                $account('EXAMPLE-CASH-PETTY', 'CASH', '200.00', 'GL-CASH-ON-HAND'),
                $account('EXAMPLE-BANK-001', 'BANK', '20000.00', 'GL-BANK'),
            ],
            'loan_schedules.csv' => [
                ['account_no' => 'EXAMPLE-LOAN-001', 'installment_no' => '1', 'due_date' => '2026-09-28', 'opening_principal' => '1000.00', 'scheduled_principal' => '300.00', 'scheduled_interest' => '20.00', 'scheduled_fee' => '0.00', 'scheduled_protection_fee' => '0.00', 'total_due' => '320.00', 'total_paid' => '0.00', 'principal_paid' => '0.00', 'interest_paid' => '0.00', 'fee_paid' => '0.00', 'protection_fee_paid' => '0.00'],
                ['account_no' => 'EXAMPLE-LOAN-001', 'installment_no' => '2', 'due_date' => '2026-11-28', 'opening_principal' => '700.00', 'scheduled_principal' => '500.00', 'scheduled_interest' => '20.00', 'scheduled_fee' => '0.00', 'scheduled_protection_fee' => '0.00', 'total_due' => '520.00', 'total_paid' => '0.00', 'principal_paid' => '0.00', 'interest_paid' => '0.00', 'fee_paid' => '0.00', 'protection_fee_paid' => '0.00'],
            ],
            'loan_arrears.csv' => [[
                'account_no' => 'EXAMPLE-LOAN-001',
                'installment_no' => '1',
                'as_of_date' => '2026-10-28',
                'days_overdue' => '30',
                'principal_overdue' => '300.00',
                'interest_overdue' => '20.00',
                'fee_overdue' => '0.00',
                'total_overdue' => '320.00',
            ]],
            'recurring_installments.csv' => $installments,
            'bank_accounts.csv' => [[
                'financial_account_no' => 'EXAMPLE-BANK-001',
                'branch_code' => 'EXAMPLE-BRANCH',
                'account_name' => 'Example Operating Bank',
                'account_number' => 'EXAMPLE-BANK-ACCOUNT',
                'routing_number' => 'EXAMPLE-ROUTING',
                'account_type' => 'CURRENT',
                'is_reconcilable' => 'true',
                'status' => 'ACTIVE',
            ]],
            'cash_locations.csv' => [
                ['code' => 'EXAMPLE-VAULT', 'name' => 'Example Vault', 'type' => 'VAULT', 'branch_code' => 'EXAMPLE-BRANCH', 'financial_account_no' => 'EXAMPLE-CASH-VAULT', 'maximum_balance' => '100000.00'],
                ['code' => 'EXAMPLE-TELLER', 'name' => 'Example Teller', 'type' => 'TELLER', 'branch_code' => 'EXAMPLE-BRANCH', 'financial_account_no' => 'EXAMPLE-CASH-TELLER', 'user_email' => 'teller@example.invalid', 'maximum_cash' => '10000.00'],
                ['code' => 'EXAMPLE-PETTY', 'name' => 'Example Petty Cash', 'type' => 'PETTY_CASH', 'branch_code' => 'EXAMPLE-BRANCH', 'financial_account_no' => 'EXAMPLE-CASH-PETTY', 'custodian_email' => 'teller@example.invalid', 'fund_limit' => '500.00', 'current_balance' => '200.00', 'method' => 'IMPREST'],
                ['code' => 'EXAMPLE-OTHER', 'name' => 'Example Other Cash Location', 'type' => 'OTHER', 'branch_code' => 'EXAMPLE-BRANCH'],
            ],
        ];
    }

    public function import(
        UploadedFile $file,
        int $organizationId,
        int $userId,
        int $fiscalPeriodId,
        int $offsetAccountId,
        string $cutoverDate,
    ): array {
        $rows = $this->readBundle($file);
        $period = FiscalPeriod::query()
            ->whereHas('fiscalYear', fn ($query) => $query->where('organization_id', $organizationId))
            ->findOrFail($fiscalPeriodId);

        if ($period->status !== 'OPEN') {
            throw new RuntimeException('Cutover imports require an open fiscal period.');
        }
        if ($cutoverDate < $period->start_date->toDateString() || $cutoverDate > $period->end_date->toDateString()) {
            throw new InvalidArgumentException('The cutover date must be within the selected fiscal period.');
        }
        if ($rows['customers.csv'] === [] && $rows['accounts.csv'] === [] && $rows['bank_accounts.csv'] === [] && $rows['cash_locations.csv'] === []) {
            throw new InvalidArgumentException('The bundle contains no customers, accounts, or treasury locations to import.');
        }

        return DB::transaction(function () use ($rows, $organizationId, $userId, $fiscalPeriodId, $offsetAccountId, $cutoverDate): array {
            return $this->applyBundle($rows, $organizationId, $userId, $fiscalPeriodId, $offsetAccountId, $cutoverDate);
        });
    }

    private function applyBundle(array $rows, int $organizationId, int $userId, int $fiscalPeriodId, int $offsetAccountId, string $cutoverDate): array
    {
        $branches = Branch::query()->where('organization_id', $organizationId)->get()->keyBy('code');
        $customers = Customer::query()->where('organization_id', $organizationId)->get()->keyBy('customer_no');
        $identificationNumbers = [];
        foreach ($rows['customers.csv'] as $row) {
            $line = $row['_line'];
            $this->requireValue($row, 'customer_no', $line);
            $this->requireValue($row, 'name', $line);
            $this->requireValue($row, 'identification_number', $line);
            $this->requireValue($row, 'branch_code', $line);
            if ($customers->has($row['customer_no'])) {
                throw new InvalidArgumentException("customers.csv line {$line}: customer number {$row['customer_no']} already exists.");
            }
            if (isset($identificationNumbers[$row['identification_number']])
                || Customer::query()->where('identification_number', $row['identification_number'])->exists()) {
                throw new InvalidArgumentException("customers.csv line {$line}: identification number already exists.");
            }
            $identificationNumbers[$row['identification_number']] = true;
            $branch = $branches->get($row['branch_code']);
            if (! $branch) {
                throw new InvalidArgumentException("customers.csv line {$line}: branch {$row['branch_code']} was not found in this organization.");
            }
            $customer = Customer::create([
                'organization_id' => $organizationId,
                'branch_id' => $branch->id,
                'customer_no' => $row['customer_no'],
                'type' => $this->enumValue($row, 'type', ['INDIVIDUAL', 'ORGANIZATION'], $line),
                'name' => $row['name'],
                'identification_type' => $this->enumValue($row, 'identification_type', ['NATIONAL_IDENTIFICATION_NUMBER', 'BIRTH_REGISTRATION_NUMBER', 'REGISTRATION_NO', 'PASSPORT', 'DRIVING_LICENSE'], $line),
                'identification_number' => $row['identification_number'],
                'primary_phone' => $this->nullable($row['primary_phone']),
                'primary_email' => $this->nullable($row['primary_email']),
                'dob' => $this->nullable($row['dob']),
                'gender' => $this->enumOptional($row, 'gender', ['MALE', 'FEMALE', 'OTHER'], $line),
                'status' => $this->enumValue($row, 'status', ['ACTIVE'], $line),
            ]);
            $customers->put($customer->customer_no, $customer);
        }

        $accounts = collect();
        $openingEntries = [];
        $financialEntries = [];
        foreach ($rows['accounts.csv'] as $row) {
            $line = $row['_line'];
            foreach (['account_no', 'branch_code', 'account_type', 'opening_balance', 'ledger_account_code'] as $field) {
                $this->requireValue($row, $field, $line);
            }
            if (FinancialAccount::query()->where('organization_id', $organizationId)->where('account_no', $row['account_no'])->exists()) {
                throw new InvalidArgumentException("accounts.csv line {$line}: account number {$row['account_no']} already exists.");
            }
            if ($accounts->has($row['account_no'])) {
                throw new InvalidArgumentException("accounts.csv line {$line}: account number {$row['account_no']} appears more than once.");
            }
            $branch = $branches->get($row['branch_code']);
            if (! $branch) {
                throw new InvalidArgumentException("accounts.csv line {$line}: branch {$row['branch_code']} was not found in this organization.");
            }
            $type = strtoupper($row['account_type']);
            $allowed = ['SAVINGS', 'SHARE', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT', 'LOAN', 'CASH', 'BANK'];
            if (! in_array($type, $allowed, true)) {
                throw new InvalidArgumentException("accounts.csv line {$line}: unsupported account type {$type}.");
            }
            $amount = $this->money($row['opening_balance'], "accounts.csv line {$line}: opening_balance");
            $customer = null;
            if (in_array($type, ['SAVINGS', 'SHARE', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT', 'LOAN'], true)) {
                $this->requireValue($row, 'customer_no', $line);
                $customer = $customers->get($row['customer_no']);
                if (! $customer) {
                    throw new InvalidArgumentException("accounts.csv line {$line}: customer {$row['customer_no']} is not in this bundle or organization.");
                }
            }

            $product = null;
            if ($this->nullable($row['product_code']) !== null) {
                $product = $type === 'LOAN'
                    ? LoanProduct::query()->where('organization_id', $organizationId)->where('code', $row['product_code'])->first()
                    : DepositProduct::query()->where('organization_id', $organizationId)->where('code', $row['product_code'])->first();
                if (! $product || ! $product->status) {
                    throw new InvalidArgumentException("accounts.csv line {$line}: active preconfigured product {$row['product_code']} was not found for {$type}.");
                }
                $expectedCategory = $type === 'LOAN' ? 'LOAN' : $type;
                if ($product->category !== $expectedCategory) {
                    throw new InvalidArgumentException("accounts.csv line {$line}: product {$row['product_code']} is not a {$type} product.");
                }
            }
            if (in_array($type, ['SAVINGS', 'SHARE', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT', 'LOAN'], true) && ! $product) {
                throw new InvalidArgumentException("accounts.csv line {$line}: a preconfigured product_code is required for {$type}.");
            }

            $ledger = LedgerAccount::query()->where('organization_id', $organizationId)->where('status', true)->where('code', $row['ledger_account_code'])->first();
            if (! $ledger) {
                throw new InvalidArgumentException("accounts.csv line {$line}: active ledger account {$row['ledger_account_code']} was not found.");
            }
            $isDebit = $type === 'LOAN' || in_array($type, ['CASH', 'BANK'], true) || $product?->balance_type === 'ASSET';
            $expectedNormal = $isDebit ? 'DEBIT' : 'CREDIT';
            $expectedType = $isDebit ? 'ASSET' : ($type === 'SHARE' ? 'EQUITY' : 'LIABILITY');
            if ($ledger->normal_balance !== $expectedNormal || $ledger->type !== $expectedType) {
                throw new InvalidArgumentException("accounts.csv line {$line}: {$type} requires a {$expectedNormal}-normal {$expectedType} ledger account.");
            }

            $account = FinancialAccount::create([
                'organization_id' => $organizationId,
                'branch_id' => $branch->id,
                'product_type' => $product ? $product::class : null,
                'product_id' => $product?->id,
                'holder_type' => $customer ? Customer::class : null,
                'holder_id' => $customer?->id,
                'account_no' => $row['account_no'],
                'name' => $customer?->name ?? $row['account_no'],
                'account_type' => $type,
                'status' => $this->enumValue($row, 'status', ['ACTIVE'], $line),
                'balance' => $amount,
                'available_balance' => $type === 'LOAN' ? 0 : $amount,
                'opened_at' => $this->nullable($row['opened_at']) ?? $cutoverDate,
                'last_operated_at' => $cutoverDate,
            ]);
            $this->createAccountDetails($account, $row, $amount, $line, $cutoverDate);
            $accounts->put($account->account_no, $account);

            if ($amount > 0) {
                $openingEntries[] = ['account_id' => $ledger->id, 'amount' => $amount, 'description' => "Cutover opening {$type} {$account->account_no}"];
                $financialEntries[] = [
                    'financial_account_id' => $account->id,
                    'direction' => $isDebit ? 'DEBIT' : 'CREDIT',
                    'amount' => $amount,
                    'balance_after' => $amount,
                    'description' => 'Opening balance at cutover',
                    'line_no' => count($financialEntries) + 1,
                ];
            }
        }

        $this->createLoanSchedules($rows, $accounts, $cutoverDate);
        $this->createRecurringInstallments($rows['recurring_installments.csv'], $accounts);
        $this->createBankAccounts($rows['bank_accounts.csv'], $organizationId, $branches, $accounts);
        $this->createCashLocations($rows['cash_locations.csv'], $organizationId, $branches, $accounts, $userId, $cutoverDate);

        $transaction = null;
        $voucher = null;
        if ($openingEntries !== []) {
            $transaction = FinancialTransaction::create([
                'organization_id' => $organizationId,
                'transaction_no' => 'CUTOVER-'.Str::uuid(),
                'idempotency_key' => Str::uuid(),
                'transaction_type' => 'OPENING_BALANCE',
                'transaction_date' => $cutoverDate,
                'amount' => collect($financialEntries)->sum('amount'),
                'currency' => 'BDT',
                'status' => 'POSTED',
                'description' => 'Cutover bundle opening balances',
                'created_by' => $userId,
                'posted_by' => $userId,
                'posted_at' => now(),
            ]);
            $transaction->entries()->createMany($financialEntries);
            $voucher = $this->openingBalanceService->apply(
                $openingEntries,
                $organizationId,
                $userId,
                $fiscalPeriodId,
                $offsetAccountId,
                $cutoverDate,
                $transaction->id,
            );
        }

        return [
            'customers' => count($rows['customers.csv']),
            'accounts' => count($rows['accounts.csv']),
            'bank_accounts' => count($rows['bank_accounts.csv']),
            'cash_locations' => count($rows['cash_locations.csv']),
            'voucher' => $voucher,
        ];
    }

    private function createAccountDetails(FinancialAccount $account, array $row, float $balance, int $line, string $cutoverDate): void
    {
        switch ($account->account_type) {
            case 'SAVINGS':
                $account->savingAccount()->create();
                break;
            case 'SHARE':
                $account->shareAccount()->create([
                    'membership_no' => $this->nullable($row['membership_no']) ?? $account->account_no,
                    'member_since' => $this->nullable($row['member_since']) ?? $cutoverDate,
                    'membership_status' => 'ACTIVE',
                ]);
                break;
            case 'FIXED_DEPOSIT':
                $account->fixedDeposit()->create([
                    'principal_amount' => $this->positive($row, 'principal_amount', $line),
                    'contractual_rate' => $this->number($row, 'contractual_rate', $line),
                    'term_value' => $this->positiveInteger($row, 'term_value', $line),
                    'term_unit' => $this->enumValue($row, 'term_unit', ['DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR'], $line),
                    'started_at' => $this->requiredDate($row, 'started_at', $line),
                    'maturity_date' => $this->requiredDate($row, 'maturity_date', $line),
                    'maturity_amount' => $this->nullable($row['maturity_amount']),
                    'maturity_instruction' => $this->enumValue($row, 'maturity_instruction', ['PAYOUT', 'RENEW_PRINCIPAL', 'RENEW_PRINCIPAL_AND_INTEREST'], $line),
                ]);
                break;
            case 'RECURRING_DEPOSIT':
                $account->recurringDeposit()->create([
                    'installment_amount' => $this->positive($row, 'installment_amount', $line),
                    'installment_frequency' => $this->enumValue($row, 'installment_frequency', ['WEEKLY', 'MONTHLY', 'QUARTERLY'], $line),
                    'total_installments' => $this->positiveInteger($row, 'total_installments', $line),
                    'paid_installments' => $this->nonNegativeInteger($row, 'paid_installments', $line),
                    'started_at' => $this->requiredDate($row, 'started_at', $line),
                    'maturity_date' => $this->requiredDate($row, 'maturity_date', $line),
                    'contractual_rate' => $this->nullable($row['contractual_rate']),
                    'maturity_amount' => $this->nullable($row['maturity_amount']),
                ]);
                break;
            case 'LOAN':
                $loan = $account->loanAccount()->create([
                    'loan_no' => $account->account_no,
                    'principal_amount' => $this->positive($row, 'principal_amount', $line),
                    'disbursed_amount' => $this->positive($row, 'disbursed_amount', $line),
                    'contractual_rate' => $this->number($row, 'contractual_rate', $line),
                    'interest_calculation' => $this->enumValue($row, 'interest_calculation', ['SIMPLE', 'FLAT', 'REDUCING_BALANCE'], $line),
                    'interest_frequency' => $this->enumValue($row, 'interest_frequency', ['DAILY', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'MATURITY'], $line),
                    'term_value' => $this->positiveInteger($row, 'term_value', $line),
                    'term_unit' => $this->enumValue($row, 'term_unit', ['DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR'], $line),
                    'scheduled_principal_amount' => $this->nullable($row['scheduled_principal_amount']),
                    'repayment_frequency' => $this->enumValue($row, 'repayment_frequency', ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY'], $line),
                    'grace_days' => $this->nonNegativeInteger($row, 'grace_days', $line),
                    'approved_at' => $this->nullable($row['opened_at']) ?? $cutoverDate,
                    'disbursed_at' => $this->nullable($row['opened_at']) ?? $cutoverDate,
                    'maturity_date' => $this->requiredDate($row, 'maturity_date', $line),
                    'status' => 'ACTIVE',
                ]);
                break;
        }
    }

    private function createLoanSchedules(array $rows, $accounts, string $cutoverDate): void
    {
        $schedules = [];
        $scheduleDates = [];
        foreach ($rows['loan_schedules.csv'] as $row) {
            $line = $row['_line'];
            $account = $accounts->get($row['account_no']);
            if (! $account || $account->account_type !== 'LOAN') {
                throw new InvalidArgumentException("loan_schedules.csv line {$line}: account {$row['account_no']} must be a loan in accounts.csv.");
            }

            $dueDate = $this->requiredDate($row, 'due_date', $line);
            $number = $this->positiveInteger($row, 'installment_no', $line);
            $key = $account->id.':'.$number;
            if (isset($schedules[$key])) {
                throw new InvalidArgumentException("loan_schedules.csv line {$line}: installment {$number} is duplicated.");
            }
            $due = $this->money($row['total_due'], "loan_schedules.csv line {$line}: total_due");
            $paid = $this->money($row['total_paid'] ?: '0', "loan_schedules.csv line {$line}: total_paid");
            if ($paid > $due) {
                throw new InvalidArgumentException("loan_schedules.csv line {$line}: total_paid cannot exceed total_due.");
            }
            $status = $paid >= $due
                ? 'PAID'
                : ($dueDate < $cutoverDate ? 'OVERDUE' : ($paid === 0.0 ? 'PENDING' : 'PARTIAL'));
            $schedule = $account->loanAccount->schedules()->create([
                'schedule_version' => 1,
                'installment_no' => $number,
                'due_date' => $dueDate,
                'opening_principal' => $this->money($row['opening_principal'], "loan_schedules.csv line {$line}: opening_principal"),
                'scheduled_principal' => $this->money($row['scheduled_principal'], "loan_schedules.csv line {$line}: scheduled_principal"),
                'scheduled_interest' => $this->money($row['scheduled_interest'], "loan_schedules.csv line {$line}: scheduled_interest"),
                'scheduled_fee' => $this->money($row['scheduled_fee'], "loan_schedules.csv line {$line}: scheduled_fee"),
                'scheduled_protection_fee' => $this->money($row['scheduled_protection_fee'], "loan_schedules.csv line {$line}: scheduled_protection_fee"),
                'total_due' => $due,
                'total_paid' => $paid,
                'status' => $status,
                'generation_inputs' => ['source' => 'cutover_import'],
            ]);
            $components = [
                'PRINCIPAL' => ['scheduled_principal', 'principal_paid'],
                'INTEREST' => ['scheduled_interest', 'interest_paid'],
                'FEE' => ['scheduled_fee', 'fee_paid'],
                'PROTECTION_FEE' => ['scheduled_protection_fee', 'protection_fee_paid'],
            ];
            foreach ($components as $type => [$dueKey, $paidKey]) {
                $componentDue = $this->money($row[$dueKey], "loan_schedules.csv line {$line}: {$dueKey}");
                $componentPaid = $this->money($row[$paidKey] ?: '0', "loan_schedules.csv line {$line}: {$paidKey}");
                if ($componentPaid > $componentDue) {
                    throw new InvalidArgumentException("loan_schedules.csv line {$line}: {$paidKey} cannot exceed {$dueKey}.");
                }
                if ($componentDue > 0) {
                    LoanScheduleComponent::create([
                        'loan_schedule_id' => $schedule->id,
                        'type' => $type,
                        'amount_due' => $componentDue,
                        'amount_paid' => $componentPaid,
                        'status' => $componentPaid === 0.0 ? 'PENDING' : ($componentPaid >= $componentDue ? 'PAID' : 'PARTIAL'),
                    ]);
                }
            }
            $componentDueTotal = collect($components)->sum(fn (array $keys): float => (float) $row[$keys[0]]);
            $componentPaidTotal = collect($components)->sum(fn (array $keys): float => (float) ($row[$keys[1]] ?: 0));
            if (round($componentDueTotal, 2) !== $due || round($componentPaidTotal, 2) !== $paid) {
                throw new InvalidArgumentException("loan_schedules.csv line {$line}: component totals must equal total_due and total_paid.");
            }
            $schedules[$key] = $schedule;
            $scheduleDates[$key] = ['due_date' => $dueDate, 'total_due' => $due, 'total_paid' => $paid];
        }
        foreach ($accounts->where('account_type', 'LOAN') as $account) {
            $loanSchedules = $account->loanAccount->schedules;
            if ((float) $account->balance > 0 && $loanSchedules->isEmpty()) {
                throw new InvalidArgumentException("Loan {$account->account_no} has an opening principal but no remaining repayment schedule.");
            }
            $scheduledPrincipal = $loanSchedules->sum(fn (LoanSchedule $schedule): float => (float) $schedule->scheduled_principal
                - (float) $schedule->components->firstWhere('type', 'PRINCIPAL')?->amount_paid);
            if (round($scheduledPrincipal, 2) !== round((float) $account->balance, 2)) {
                throw new InvalidArgumentException("Loan {$account->account_no}: unpaid scheduled principal must equal its opening loan balance.");
            }
        }
        $arrearsKeys = [];
        foreach ($rows['loan_arrears.csv'] as $row) {
            $line = $row['_line'];
            $account = $accounts->get($row['account_no']);
            $schedule = $account?->loanAccount?->schedules()->where('installment_no', $row['installment_no'])->first();
            if (! $schedule) {
                throw new InvalidArgumentException("loan_arrears.csv line {$line}: matching loan schedule installment was not found.");
            }
            $principal = $this->money($row['principal_overdue'], "loan_arrears.csv line {$line}: principal_overdue");
            $interest = $this->money($row['interest_overdue'], "loan_arrears.csv line {$line}: interest_overdue");
            $fee = $this->money($row['fee_overdue'], "loan_arrears.csv line {$line}: fee_overdue");
            $total = $this->money($row['total_overdue'], "loan_arrears.csv line {$line}: total_overdue");
            if ($total <= 0 || round($principal + $interest + $fee, 2) !== $total) {
                throw new InvalidArgumentException("loan_arrears.csv line {$line}: total_overdue must equal principal + interest + fees.");
            }
            if ($this->requiredDate($row, 'as_of_date', $line) !== $cutoverDate) {
                throw new InvalidArgumentException("loan_arrears.csv line {$line}: as_of_date must equal the selected cutover date.");
            }
            $key = $account->id.':'.$schedule->installment_no;
            if (isset($arrearsKeys[$key])) {
                throw new InvalidArgumentException("loan_arrears.csv line {$line}: this loan installment has duplicate arrears rows.");
            }
            $arrearsKeys[$key] = true;
            $principalComponent = $schedule->components()->where('type', 'PRINCIPAL')->first();
            $interestComponent = $schedule->components()->where('type', 'INTEREST')->first();
            $feeComponents = $schedule->components()->whereIn('type', ['FEE', 'PROTECTION_FEE'])->get();
            if ($principal > (float) ($principalComponent?->amount_due ?? 0) - (float) ($principalComponent?->amount_paid ?? 0)
                || $interest > (float) ($interestComponent?->amount_due ?? 0) - (float) ($interestComponent?->amount_paid ?? 0)
                || $fee > $feeComponents->sum(fn (LoanScheduleComponent $component): float => (float) $component->amount_due - (float) $component->amount_paid)) {
                throw new InvalidArgumentException("loan_arrears.csv line {$line}: arrears cannot exceed the unpaid installment components.");
            }
            $schedule->loanAccount->arrears()->create([
                'loan_schedule_id' => $schedule->id,
                'as_of_date' => $cutoverDate,
                'days_overdue' => $this->nonNegativeInteger($row, 'days_overdue', $line),
                'principal_overdue' => $principal,
                'interest_overdue' => $interest,
                'fee_overdue' => $fee,
                'total_overdue' => $total,
                'status' => 'OPEN',
            ]);
        }
        foreach ($scheduleDates as $key => $scheduleDate) {
            if ($scheduleDate['due_date'] < $cutoverDate
                && $scheduleDate['total_paid'] < $scheduleDate['total_due']
                && ! isset($arrearsKeys[$key])) {
                throw new InvalidArgumentException("Loan installment {$key} is overdue at cutover and needs an entry in loan_arrears.csv.");
            }
        }
    }

    private function createRecurringInstallments(array $rows, $accounts): void
    {
        $seen = [];
        $counts = [];
        $paidCounts = [];
        foreach ($rows as $row) {
            $line = $row['_line'];
            $account = $accounts->get($row['account_no']);
            if (! $account || $account->account_type !== 'RECURRING_DEPOSIT') {
                throw new InvalidArgumentException("recurring_installments.csv line {$line}: account {$row['account_no']} must be a recurring deposit in accounts.csv.");
            }
            $number = $this->positiveInteger($row, 'installment_no', $line);
            $key = $account->id.':'.$number;
            if (isset($seen[$key])) {
                throw new InvalidArgumentException("recurring_installments.csv line {$line}: installment {$number} is duplicated.");
            }
            $seen[$key] = true;
            $due = $this->money($row['amount_due'], "recurring_installments.csv line {$line}: amount_due");
            $paid = $this->money($row['amount_paid'] ?: '0', "recurring_installments.csv line {$line}: amount_paid");
            $fine = $this->money($row['fine_amount'] ?: '0', "recurring_installments.csv line {$line}: fine_amount");
            if ($due <= 0 || $paid > $due) {
                throw new InvalidArgumentException("recurring_installments.csv line {$line}: amount_due must be positive and amount_paid cannot exceed it.");
            }
            $status = $this->enumValue($row, 'status', ['PENDING', 'PARTIAL', 'PAID', 'MISSED', 'WAIVED'], $line);
            if (($status === 'PENDING' && $paid !== 0.0)
                || ($status === 'PARTIAL' && ($paid <= 0 || $paid >= $due))
                || ($status === 'PAID' && $paid !== $due)
                || (in_array($status, ['MISSED', 'WAIVED'], true) && $paid > 0)) {
                throw new InvalidArgumentException("recurring_installments.csv line {$line}: status does not match the amount_paid value.");
            }
            RecurringDepositInstallment::create([
                'recurring_deposit_id' => $account->recurringDeposit->id,
                'installment_no' => $number,
                'due_date' => $this->requiredDate($row, 'due_date', $line),
                'amount_due' => $due,
                'amount_paid' => $paid,
                'fine_amount' => $fine,
                'status' => $status,
                'paid_at' => $this->nullable($row['paid_at']),
            ]);
            $counts[$account->id] = ($counts[$account->id] ?? 0) + 1;
            if ($status === 'PAID') {
                $paidCounts[$account->id] = ($paidCounts[$account->id] ?? 0) + 1;
            }
        }
        foreach ($accounts->where('account_type', 'RECURRING_DEPOSIT') as $account) {
            $deposit = $account->recurringDeposit;
            if (($counts[$account->id] ?? 0) !== (int) $deposit->total_installments
                || ($paidCounts[$account->id] ?? 0) !== (int) $deposit->paid_installments) {
                throw new InvalidArgumentException("Recurring deposit {$account->account_no}: import all installment rows and ensure the PAID count matches paid_installments.");
            }
        }
    }

    private function createBankAccounts(array $rows, int $organizationId, $branches, $accounts): void
    {
        $numbers = [];
        foreach ($rows as $row) {
            $line = $row['_line'];
            foreach (['financial_account_no', 'branch_code', 'account_name', 'account_number', 'account_type', 'is_reconcilable', 'status'] as $field) {
                $this->requireValue($row, $field, $line);
            }
            $account = $accounts->get($row['financial_account_no']);
            if (! $account || $account->account_type !== 'BANK') {
                throw new InvalidArgumentException("bank_accounts.csv line {$line}: financial_account_no must refer to a BANK account in accounts.csv.");
            }
            $branch = $branches->get($row['branch_code']);
            if (! $branch) {
                throw new InvalidArgumentException("bank_accounts.csv line {$line}: branch {$row['branch_code']} was not found.");
            }
            if (isset($numbers[$row['account_number']]) || BankAccount::query()
                ->where('organization_id', $organizationId)
                ->where('account_number', $row['account_number'])
                ->exists()) {
                throw new InvalidArgumentException("bank_accounts.csv line {$line}: bank account number {$row['account_number']} already exists.");
            }
            $numbers[$row['account_number']] = true;
            BankAccount::create([
                'organization_id' => $organizationId,
                'branch_id' => $branch->id,
                'financial_account_id' => $account->id,
                'account_name' => $row['account_name'],
                'account_number' => $row['account_number'],
                'routing_number' => $this->nullable($row['routing_number']),
                'account_type' => $this->enumValue($row, 'account_type', ['CURRENT', 'SAVINGS', 'FDR', 'OTHER'], $line),
                'opening_balance' => $account->balance,
                'is_reconcilable' => $this->booleanValue($row, 'is_reconcilable', $line),
                'status' => $this->enumValue($row, 'status', ['ACTIVE'], $line),
            ]);
        }
    }

    private function createCashLocations(array $rows, int $organizationId, $branches, $accounts, int $userId, string $cutoverDate): void
    {
        $days = [];
        foreach ($rows as $row) {
            $line = $row['_line'];
            $this->requireValue($row, 'code', $line);
            $this->requireValue($row, 'name', $line);
            $this->requireValue($row, 'branch_code', $line);
            $this->requireValue($row, 'type', $line);
            $branch = $branches->get($row['branch_code']);
            if (! $branch) {
                throw new InvalidArgumentException("cash_locations.csv line {$line}: branch {$row['branch_code']} was not found.");
            }
            $type = $this->enumValue($row, 'type', ['VAULT', 'TELLER', 'PETTY_CASH', 'OTHER'], $line);
            if (CashLocation::query()->where('organization_id', $organizationId)->where('code', $row['code'])->exists()) {
                throw new InvalidArgumentException("cash_locations.csv line {$line}: location code {$row['code']} already exists.");
            }
            $financialAccount = $this->nullable($row['financial_account_no']) ? $accounts->get($row['financial_account_no']) : null;
            if ($financialAccount && $financialAccount->account_type !== 'CASH') {
                throw new InvalidArgumentException("cash_locations.csv line {$line}: linked financial account must have type CASH.");
            }
            if (in_array($type, ['VAULT', 'TELLER', 'PETTY_CASH'], true) && ! $financialAccount) {
                throw new InvalidArgumentException("cash_locations.csv line {$line}: {$type} locations require a linked CASH financial account.");
            }
            if ($financialAccount && CashLocation::query()->where('financial_account_id', $financialAccount->id)->exists()) {
                throw new InvalidArgumentException("cash_locations.csv line {$line}: financial account {$financialAccount->account_no} is already assigned to a cash location.");
            }
            if ($type === 'PETTY_CASH') {
                $currentBalance = $this->money($row['current_balance'], "cash_locations.csv line {$line}: current_balance");
                if (round($currentBalance, 2) !== round((float) $financialAccount->balance, 2)) {
                    throw new InvalidArgumentException("cash_locations.csv line {$line}: current_balance must match the linked CASH account opening balance.");
                }
            }
            $location = CashLocation::create([
                'organization_id' => $organizationId,
                'branch_id' => $branch->id,
                'financial_account_id' => $financialAccount?->id,
                'code' => $row['code'],
                'name' => $row['name'],
                'type' => $type,
                'is_active' => true,
            ]);
            if ($type === 'VAULT') {
                $vault = Vault::create([
                    'cash_location_id' => $location->id,
                    'code' => $row['code'],
                    'name' => $row['name'],
                    'maximum_balance' => $this->nullable($row['maximum_balance']),
                ]);
                $branchDay = $days[$branch->id] ??= $this->openCutoverDay($organizationId, $branch->id, $userId, $cutoverDate);
                VaultSession::create([
                    'branch_day_id' => $branchDay->id,
                    'vault_id' => $vault->id,
                    'opened_by' => $userId,
                    'status' => 'OPEN',
                    'opening_cash' => $financialAccount->balance,
                    'expected_cash' => $financialAccount->balance,
                    'opened_at' => $cutoverDate.' 00:00:00',
                    'opening_note' => 'Opening cash imported at cutover.',
                ]);
                CashCount::create([
                    'branch_day_id' => $branchDay->id,
                    'cash_location_id' => $location->id,
                    'type' => 'OPENING',
                    'total_amount' => $financialAccount->balance,
                    'counted_by' => $userId,
                    'counted_at' => $cutoverDate.' 00:00:00',
                    'note' => 'Opening cash imported at cutover.',
                ]);
            } elseif ($type === 'TELLER') {
                $this->requireValue($row, 'user_email', $line);
                $user = User::query()->where('organization_id', $organizationId)->where('email', $row['user_email'])->first();
                if (! $user) {
                    throw new InvalidArgumentException("cash_locations.csv line {$line}: teller user {$row['user_email']} was not found in this organization.");
                }
                $teller = Teller::create([
                    'cash_location_id' => $location->id,
                    'user_id' => $user->id,
                    'code' => $row['code'],
                    'name' => $row['name'],
                    'maximum_cash' => $this->nullable($row['maximum_cash']),
                ]);
                $branchDay = $days[$branch->id] ??= $this->openCutoverDay($organizationId, $branch->id, $userId, $cutoverDate);
                TellerSession::create([
                    'branch_day_id' => $branchDay->id,
                    'teller_id' => $teller->id,
                    'opened_by' => $userId,
                    'status' => 'OPEN',
                    'opening_cash' => $financialAccount->balance,
                    'expected_cash' => $financialAccount->balance,
                    'opened_at' => $cutoverDate.' 00:00:00',
                    'opening_note' => 'Opening cash imported at cutover.',
                ]);
                CashCount::create([
                    'branch_day_id' => $branchDay->id,
                    'cash_location_id' => $location->id,
                    'type' => 'OPENING',
                    'total_amount' => $financialAccount->balance,
                    'counted_by' => $userId,
                    'counted_at' => $cutoverDate.' 00:00:00',
                    'note' => 'Opening cash imported at cutover.',
                ]);
            } elseif ($type === 'PETTY_CASH') {
                $custodian = $this->nullable($row['custodian_email'])
                    ? User::query()->where('organization_id', $organizationId)->where('email', $row['custodian_email'])->first()
                    : null;
                if ($this->nullable($row['custodian_email']) && ! $custodian) {
                    throw new InvalidArgumentException("cash_locations.csv line {$line}: petty-cash custodian {$row['custodian_email']} was not found.");
                }
                PettyCashFund::create([
                    'cash_location_id' => $location->id,
                    'custodian_id' => $custodian?->id,
                    'code' => $row['code'],
                    'name' => $row['name'],
                    'fund_limit' => $this->positive($row, 'fund_limit', $line),
                    'current_balance' => $this->money($row['current_balance'], "cash_locations.csv line {$line}: current_balance"),
                    'method' => $this->enumValue($row, 'method', ['IMPREST', 'VARIABLE'], $line),
                    'status' => 'ACTIVE',
                ]);
            }
        }
    }

    private function openCutoverDay(int $organizationId, int $branchId, int $userId, string $date): BranchDay
    {
        $day = BranchDay::query()->where('branch_id', $branchId)->whereDate('business_date', $date)->first();
        if ($day && $day->status !== 'OPEN') {
            throw new InvalidArgumentException("Branch {$branchId} already has a closed cutover business day.");
        }
        if ($day && (TellerSession::query()->where('branch_day_id', $day->id)->exists()
            || VaultSession::query()->where('branch_day_id', $day->id)->exists())) {
            throw new InvalidArgumentException("Branch {$branchId} already has cash sessions on the cutover date.");
        }

        return $day ?? BranchDay::create([
            'organization_id' => $organizationId,
            'branch_id' => $branchId,
            'business_date' => $date,
            'status' => 'OPEN',
            'opened_at' => $date.' 00:00:00',
            'opened_by' => $userId,
            'opening_note' => 'Cutover business day opened by import.',
        ]);
    }

    private function readBundle(UploadedFile $file): array
    {
        if (! class_exists(ZipArchive::class)) {
            throw new RuntimeException('ZIP import is unavailable because PHP ZIP support is not installed.');
        }
        $zip = new ZipArchive;
        if ($zip->open($file->getRealPath()) !== true) {
            throw new InvalidArgumentException('The uploaded file is not a valid ZIP archive.');
        }
        try {
            if ($zip->numFiles !== count(self::FILES) + 1) {
                throw new InvalidArgumentException('The ZIP must contain the seven CSV files and README.txt from the downloaded template.');
            }
            $allowedFiles = [...array_keys(self::FILES), 'README.txt'];
            for ($fileIndex = 0; $fileIndex < $zip->numFiles; $fileIndex++) {
                $name = $zip->getNameIndex($fileIndex);
                if (! in_array($name, $allowedFiles, true)) {
                    throw new InvalidArgumentException("The ZIP contains unexpected file {$name}.");
                }
            }
            $rows = [];
            $totalSize = 0;
            foreach (self::FILES as $name => $requiredHeaders) {
                $index = $zip->locateName($name, ZipArchive::FL_NOCASE);
                if ($index === false) {
                    throw new InvalidArgumentException("The ZIP is missing required file {$name}.");
                }
                $stat = $zip->statIndex($index);
                $totalSize += (int) ($stat['size'] ?? 0);
                if ($totalSize > 100 * 1024 * 1024) {
                    throw new InvalidArgumentException('Uncompressed ZIP contents cannot exceed 100 MB.');
                }
                $content = $zip->getFromIndex($index);
                if ($content === false) {
                    throw new InvalidArgumentException("Could not read {$name} from the ZIP.");
                }
                $rows[$name] = $this->parseCsv($content, $name, $requiredHeaders);
            }

            return $rows;
        } finally {
            $zip->close();
        }
    }

    private function parseCsv(string $content, string $filename, array $requiredHeaders): array
    {
        $stream = fopen('php://temp', 'r+');
        fwrite($stream, $content);
        rewind($stream);
        try {
            $header = fgetcsv($stream, null, ',', '"', '');
            if (! is_array($header)) {
                throw new InvalidArgumentException("{$filename} is empty; include its template header.");
            }
            $header[0] = ltrim((string) $header[0], "\xEF\xBB\xBF");
            $header = array_map(fn ($value) => strtolower(trim((string) $value)), $header);
            if (count($header) !== count(array_unique($header)) || array_diff($requiredHeaders, $header) !== []) {
                throw new InvalidArgumentException("{$filename} headers do not match the provided template.");
            }
            $rows = [];
            $line = 1;
            while (($values = fgetcsv($stream, null, ',', '"', '')) !== false) {
                $line++;
                if ($values === [null] || collect($values)->every(fn ($value) => trim((string) $value) === '')) {
                    continue;
                }
                if (count($values) !== count($header)) {
                    throw new InvalidArgumentException("{$filename} line {$line}: the number of columns does not match the header.");
                }
                $row = array_combine($header, array_map(fn ($value) => trim((string) $value), $values));
                $row['_line'] = $line;
                $rows[] = $row;
                if (count($rows) > 10000) {
                    throw new InvalidArgumentException("{$filename} cannot contain more than 10,000 rows.");
                }
            }

            return $rows;
        } finally {
            fclose($stream);
        }
    }

    private function requireValue(array $row, string $key, int $line): string
    {
        if (! isset($row[$key]) || $row[$key] === '') {
            throw new InvalidArgumentException("CSV line {$line}: {$key} is required.");
        }

        return $row[$key];
    }

    private function enumValue(array $row, string $key, array $allowed, int $line): string
    {
        $value = strtoupper($this->requireValue($row, $key, $line));
        if (! in_array($value, $allowed, true)) {
            throw new InvalidArgumentException("CSV line {$line}: {$key} must be one of ".implode(', ', $allowed).'.');
        }

        return $value;
    }

    private function enumOptional(array $row, string $key, array $allowed, int $line): ?string
    {
        if ($this->nullable($row[$key] ?? null) === null) {
            return null;
        }

        return $this->enumValue($row, $key, $allowed, $line);
    }

    private function positive(array $row, string $key, int $line): float
    {
        $value = $this->money($this->requireValue($row, $key, $line), "CSV line {$line}: {$key}");
        if ($value <= 0) {
            throw new InvalidArgumentException("CSV line {$line}: {$key} must be greater than zero.");
        }

        return $value;
    }

    private function number(array $row, string $key, int $line): float
    {
        $value = $this->requireValue($row, $key, $line);
        if (! preg_match('/^\d+(?:\.\d{1,6})?$/D', $value)) {
            throw new InvalidArgumentException("CSV line {$line}: {$key} must be a non-negative number.");
        }

        return (float) $value;
    }

    private function money(string $value, string $label): float
    {
        if (! preg_match('/^\d+(?:\.\d{1,2})?$/D', $value)) {
            throw new InvalidArgumentException("{$label} must be a non-negative amount with up to two decimals.");
        }

        return round((float) $value, 2);
    }

    private function positiveInteger(array $row, string $key, int $line): int
    {
        $value = $this->requireValue($row, $key, $line);
        if (! ctype_digit($value) || (int) $value < 1) {
            throw new InvalidArgumentException("CSV line {$line}: {$key} must be a positive whole number.");
        }

        return (int) $value;
    }

    private function nonNegativeInteger(array $row, string $key, int $line): int
    {
        $value = $this->nullable($row[$key] ?? null) ?? '0';
        if (! ctype_digit($value)) {
            throw new InvalidArgumentException("CSV line {$line}: {$key} must be a non-negative whole number.");
        }

        return (int) $value;
    }

    private function requiredDate(array $row, string $key, int $line): string
    {
        $value = $this->requireValue($row, $key, $line);
        try {
            $valid = \Illuminate\Support\Carbon::createFromFormat('!Y-m-d', $value)->format('Y-m-d') === $value;
        } catch (\Throwable) {
            $valid = false;
        }
        if (! $valid) {
            throw new InvalidArgumentException("CSV line {$line}: {$key} must use YYYY-MM-DD.");
        }

        return $value;
    }

    private function booleanValue(array $row, string $key, int $line): bool
    {
        $value = strtolower($this->requireValue($row, $key, $line));
        if (! in_array($value, ['1', '0', 'true', 'false', 'yes', 'no'], true)) {
            throw new InvalidArgumentException("CSV line {$line}: {$key} must be true or false.");
        }

        return in_array($value, ['1', 'true', 'yes'], true);
    }

    private function nullable(?string $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }
}
