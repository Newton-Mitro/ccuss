<?php

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Application\FinancialTransactionService;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialTransaction;
use App\FinancialServices\Models\LoanProduct;
use App\GeneralAccounting\Application\AccountGroupService;
use App\GeneralAccounting\Application\CutoverBundleImportService;
use App\GeneralAccounting\Application\FiscalPeriodService;
use App\GeneralAccounting\Application\FiscalYearService;
use App\GeneralAccounting\Application\LedgerAccountService;
use App\GeneralAccounting\Application\MemberOpeningBalanceImportService;
use App\GeneralAccounting\Application\OpeningBalanceService;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\TellerSession;
use App\TreasuryAndCash\Models\VaultSession;
use Illuminate\Http\UploadedFile;

function grantOpeningBalanceImportPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'opening_balance_import_test'],
        ['name' => 'Opening Balance Import Test'],
    );
    $permission = Permission::firstOrCreate(
        ['slug' => 'accounting.opening_balances.create'],
        [
            'module' => 'accounting_opening_balances',
            'name' => 'Create Opening Balances',
            'action' => 'create',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

it('serves the member balance importer and CSV template to authorized users', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    grantOpeningBalanceImportPermission($user);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('opening-balances.member-import'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('general-accounting/opening-balances/member-import'));

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('opening-balances.member-import.template'))
        ->assertSuccessful()
        ->assertHeader('content-type', 'text/csv; charset=UTF-8');

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('opening-balances.cutover-import'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('general-accounting/opening-balances/cutover-import'));

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('opening-balances.cutover-import.template'))
        ->assertSuccessful()
        ->assertHeader('content-type', 'application/zip');

    $templates = app(CutoverBundleImportService::class)->templates();
    expect($templates)->toHaveCount(8)
        ->and(collect($templates)->firstWhere('name', 'customers.csv')['contents'])->toContain('EXAMPLE-MEMBER-001')
        ->and(collect($templates)->firstWhere('name', 'loan_schedules.csv')['contents'])->toContain('EXAMPLE-LOAN-001')
        ->and(collect($templates)->firstWhere('name', 'README.txt')['contents'])->toContain('illustrative examples');
});

it('forbids users without opening balance create permission from member imports', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('opening-balances.member-import'))
        ->assertForbidden();
});

it('creates a balanced opening balance voucher for the active period', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    $fiscalYear = app(FiscalYearService::class)->create([
        'organization_id' => $organization->id,
        'name' => '2025-2026',
        'start_date' => '2025-07-01',
        'end_date' => '2026-06-30',
    ]);
    $period = app(FiscalPeriodService::class)->create($fiscalYear, [
        'name' => 'July 2025',
        'start_date' => '2025-07-01',
        'end_date' => '2025-07-31',
        'status' => 'OPEN',
    ]);

    $assetGroup = app(AccountGroupService::class)->create([
        'organization_id' => $organization->id,
        'code' => '1000',
        'name' => 'Assets',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
    ]);
    $equityGroup = app(AccountGroupService::class)->create([
        'organization_id' => $organization->id,
        'code' => '3000',
        'name' => 'Equity',
        'type' => 'EQUITY',
        'normal_balance' => 'CREDIT',
    ]);

    $cash = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $assetGroup->id,
        'code' => '1100',
        'name' => 'Cash',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
        'status' => true,
        'is_cash_account' => true,
    ]);
    $capital = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $equityGroup->id,
        'code' => '3100',
        'name' => 'Capital',
        'type' => 'EQUITY',
        'normal_balance' => 'CREDIT',
        'status' => true,
    ]);

    $voucher = app(OpeningBalanceService::class)->apply([
        ['account_id' => $cash->id, 'amount' => 2500],
    ], $organization->id, $user->id, $period->id, $capital->id);

    expect($voucher->voucher_type)->toBe('OPENING')
        ->and($voucher->status)->toBe('POSTED')
        ->and($voucher->entries)->toHaveCount(2)
        ->and((float) $voucher->entries->sum('debit'))->toBe(2500.0)
        ->and((float) $voucher->entries->sum('credit'))->toBe(2500.0);
});

it('balances opening voucher offsets using only the debit-credit difference', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    $fiscalYear = app(FiscalYearService::class)->create([
        'organization_id' => $organization->id,
        'name' => '2025-2026',
        'start_date' => '2025-07-01',
        'end_date' => '2026-06-30',
    ]);
    $period = app(FiscalPeriodService::class)->create($fiscalYear, [
        'name' => 'July 2025',
        'start_date' => '2025-07-01',
        'end_date' => '2025-07-31',
        'status' => 'OPEN',
    ]);
    $assetGroup = app(AccountGroupService::class)->create([
        'organization_id' => $organization->id,
        'code' => '1000',
        'name' => 'Assets',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
    ]);
    $liabilityGroup = app(AccountGroupService::class)->create([
        'organization_id' => $organization->id,
        'code' => '2000',
        'name' => 'Liabilities',
        'type' => 'LIABILITY',
        'normal_balance' => 'CREDIT',
    ]);
    $equityGroup = app(AccountGroupService::class)->create([
        'organization_id' => $organization->id,
        'code' => '3000',
        'name' => 'Equity',
        'type' => 'EQUITY',
        'normal_balance' => 'CREDIT',
    ]);
    $cash = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $assetGroup->id,
        'code' => '1100',
        'name' => 'Cash',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
        'status' => true,
    ]);
    $savings = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $liabilityGroup->id,
        'code' => '2100',
        'name' => 'Savings Deposits',
        'type' => 'LIABILITY',
        'normal_balance' => 'CREDIT',
        'status' => true,
    ]);
    $capital = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $equityGroup->id,
        'code' => '3100',
        'name' => 'Capital',
        'type' => 'EQUITY',
        'normal_balance' => 'CREDIT',
        'status' => true,
    ]);

    $voucher = app(OpeningBalanceService::class)->apply([
        ['account_id' => $cash->id, 'amount' => 2500],
        ['account_id' => $savings->id, 'amount' => 1000],
    ], $organization->id, $user->id, $period->id, $capital->id);

    expect($voucher->entries)->toHaveCount(3)
        ->and((float) $voucher->entries->sum('debit'))->toBe(2500.0)
        ->and((float) $voucher->entries->sum('credit'))->toBe(2500.0)
        ->and((float) $voucher->entries->firstWhere('account_id', $capital->id)->credit)->toBe(1500.0);
});

it('imports member account balances and posts a balanced opening voucher atomically', function () {
    $organization = Organization::factory()->create(['code' => 'ORG-001']);
    Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create(['organization_id' => $organization->id]);
    $customer = Customer::factory()->create(['organization_id' => $organization->id]);
    $fiscalYear = app(FiscalYearService::class)->create([
        'organization_id' => $organization->id,
        'name' => '2025-2026',
        'start_date' => '2025-07-01',
        'end_date' => '2026-06-30',
    ]);
    $period = app(FiscalPeriodService::class)->create($fiscalYear, [
        'name' => 'July 2025',
        'start_date' => '2025-07-01',
        'end_date' => '2025-07-31',
        'status' => 'OPEN',
    ]);
    $liabilityGroup = app(AccountGroupService::class)->create([
        'organization_id' => $organization->id,
        'code' => '2000',
        'name' => 'Liabilities',
        'type' => 'LIABILITY',
        'normal_balance' => 'CREDIT',
    ]);
    $equityGroup = app(AccountGroupService::class)->create([
        'organization_id' => $organization->id,
        'code' => '3000',
        'name' => 'Equity',
        'type' => 'EQUITY',
        'normal_balance' => 'CREDIT',
    ]);
    $savingsControl = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $liabilityGroup->id,
        'code' => '2100',
        'name' => 'Savings Deposits',
        'type' => 'LIABILITY',
        'normal_balance' => 'CREDIT',
        'status' => true,
    ]);
    $capital = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $equityGroup->id,
        'code' => '3100',
        'name' => 'Capital',
        'type' => 'EQUITY',
        'normal_balance' => 'CREDIT',
        'status' => true,
    ]);
    $memberEquity = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $equityGroup->id,
        'code' => '3200',
        'name' => 'Member Share Capital',
        'type' => 'EQUITY',
        'normal_balance' => 'CREDIT',
        'status' => true,
    ]);
    $savingsAccount = FinancialAccount::create([
        'organization_id' => $organization->id,
        'holder_type' => Customer::class,
        'holder_id' => $customer->id,
        'account_no' => 'SAV-LEGACY-001',
        'account_type' => 'SAVINGS',
        'status' => 'ACTIVE',
    ]);
    $savingsAccount->savingAccount()->create(['minimum_balance' => 0]);
    $shareAccount = FinancialAccount::create([
        'organization_id' => $organization->id,
        'holder_type' => Customer::class,
        'holder_id' => $customer->id,
        'account_no' => 'SHR-LEGACY-001',
        'account_type' => 'SHARE',
        'status' => 'ACTIVE',
    ]);
    $shareAccount->shareAccount()->create([
        'membership_no' => 'MEM-LEGACY-001',
        'membership_status' => 'ACTIVE',
    ]);
    $fixedDepositAccount = FinancialAccount::create([
        'organization_id' => $organization->id,
        'holder_type' => Customer::class,
        'holder_id' => $customer->id,
        'account_no' => 'FDR-LEGACY-001',
        'account_type' => 'FIXED_DEPOSIT',
        'status' => 'ACTIVE',
    ]);
    $fixedDepositAccount->fixedDeposit()->create([
        'principal_amount' => 100,
        'contractual_rate' => 5,
        'term_value' => 12,
        'term_unit' => 'MONTH',
        'started_at' => '2025-01-01',
        'maturity_date' => '2026-01-01',
    ]);
    $recurringDepositAccount = FinancialAccount::create([
        'organization_id' => $organization->id,
        'holder_type' => Customer::class,
        'holder_id' => $customer->id,
        'account_no' => 'RDP-LEGACY-001',
        'account_type' => 'RECURRING_DEPOSIT',
        'status' => 'ACTIVE',
    ]);
    $recurringDepositAccount->recurringDeposit()->create([
        'installment_amount' => 25,
        'installment_frequency' => 'MONTHLY',
        'total_installments' => 12,
        'started_at' => '2025-01-01',
        'maturity_date' => '2026-01-01',
    ]);

    expect(fn () => app(MemberOpeningBalanceImportService::class)->import(
        UploadedFile::fake()->createWithContent(
            'invalid-opening.csv',
            "account_no,opening_balance,ledger_account_code\nSAV-LEGACY-001,1250.00,2100\nMISSING-ACCOUNT,50.00,2100\n",
        ),
        $organization->id,
        $user->id,
        $period->id,
        $capital->id,
        '2025-07-10',
    ))->toThrow(InvalidArgumentException::class, 'was not found');

    expect((float) $savingsAccount->fresh()->balance)->toBe(0.0)
        ->and(FinancialTransaction::query()->exists())->toBeFalse();

    $result = app(MemberOpeningBalanceImportService::class)->import(
        UploadedFile::fake()->createWithContent(
            'opening.csv',
            "account_no,opening_balance,ledger_account_code\nSAV-LEGACY-001,1250.00,2100\nSHR-LEGACY-001,250.00,3200\nFDR-LEGACY-001,100.00,2100\nRDP-LEGACY-001,50.00,2100\n",
        ),
        $organization->id,
        $user->id,
        $period->id,
        $capital->id,
        '2025-07-10',
    );

    $savingsAccount->refresh();
    $transaction = FinancialTransaction::query()->where('transaction_type', 'OPENING_BALANCE')->firstOrFail();
    $voucher = $result['voucher']->fresh('entries');

    expect($result['count'])->toBe(4)
        ->and($savingsAccount->status)->toBe('ACTIVE')
        ->and((float) $savingsAccount->balance)->toBe(1250.0)
        ->and((float) $savingsAccount->available_balance)->toBe(1250.0)
        ->and((float) $shareAccount->fresh()->balance)->toBe(250.0)
        ->and($transaction->status)->toBe('POSTED')
        ->and((float) $fixedDepositAccount->fresh()->balance)->toBe(100.0)
        ->and((float) $recurringDepositAccount->fresh()->balance)->toBe(50.0)
        ->and($transaction->entries)->toHaveCount(4)
        ->and($transaction->entries->every(fn ($entry) => $entry->direction === 'CREDIT'))->toBeTrue()
        ->and($voucher->voucher_date->toDateString())->toBe('2025-07-10')
        ->and((float) $voucher->entries->sum('debit'))->toBe(1650.0)
        ->and((float) $voucher->entries->sum('credit'))->toBe(1650.0);

    app(FinancialTransactionService::class)->reverse($transaction, $organization->id);

    expect($savingsAccount->fresh()->balance)->toBe('0.0000')
        ->and($shareAccount->fresh()->balance)->toBe('0.0000')
        ->and($fixedDepositAccount->fresh()->balance)->toBe('0.0000')
        ->and($recurringDepositAccount->fresh()->balance)->toBe('0.0000')
        ->and($transaction->fresh()->voucher->status)->toBe('REVERSED');
});

it('imports a cutover ZIP account and posts its opening journal', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create([
        'organization_id' => $organization->id,
        'code' => 'CUTOVER',
    ]);
    $user = User::factory()->create(['organization_id' => $organization->id]);
    $fiscalYear = app(FiscalYearService::class)->create([
        'organization_id' => $organization->id,
        'name' => '2026-2027',
        'start_date' => '2026-07-01',
        'end_date' => '2027-06-30',
    ]);
    $period = app(FiscalPeriodService::class)->create($fiscalYear, [
        'name' => 'October 2026',
        'start_date' => '2026-10-01',
        'end_date' => '2026-10-31',
        'status' => 'OPEN',
    ]);
    $assetGroup = app(AccountGroupService::class)->create([
        'organization_id' => $organization->id,
        'code' => '1000',
        'name' => 'Assets',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
    ]);
    $equityGroup = app(AccountGroupService::class)->create([
        'organization_id' => $organization->id,
        'code' => '3000',
        'name' => 'Equity',
        'type' => 'EQUITY',
        'normal_balance' => 'CREDIT',
    ]);
    $cashLedger = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $assetGroup->id,
        'code' => '1100',
        'name' => 'Cash',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
        'status' => true,
        'is_cash_account' => true,
    ]);
    $bankLedger = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $assetGroup->id,
        'code' => '1200',
        'name' => 'Bank',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
        'status' => true,
    ]);
    $loanLedger = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $assetGroup->id,
        'code' => '1300',
        'name' => 'Loans Receivable',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
        'status' => true,
    ]);
    LoanProduct::query()->create([
        'organization_id' => $organization->id,
        'code' => 'LOAN-STD',
        'name' => 'Standard Loan',
        'balance_type' => 'ASSET',
        'interest_rate' => 12,
        'interest_calculation' => 'REDUCING_BALANCE',
        'interest_frequency' => 'MONTHLY',
        'status' => true,
    ]);
    $offset = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $equityGroup->id,
        'code' => '3100',
        'name' => 'Opening Equity',
        'type' => 'EQUITY',
        'normal_balance' => 'CREDIT',
        'status' => true,
    ]);

    $importer = app(CutoverBundleImportService::class);
    $archivePath = tempnam(sys_get_temp_dir(), 'cutover-test-');
    $zip = new ZipArchive;
    expect($zip->open($archivePath, ZipArchive::OVERWRITE))->toBeTrue();
    foreach ($importer->templates() as $template) {
        $contents = $template['contents'];
        if ($template['name'] === 'accounts.csv') {
            $headers = explode(',', strtok($contents, "\n"));
            $rows = [];
            foreach ([
                ['CASH-LEGACY-001', 'CASH', '500.00', $cashLedger->code],
                ['CASH-LEGACY-002', 'CASH', '100.00', $cashLedger->code],
                ['BANK-LEGACY-001', 'BANK', '400.00', $bankLedger->code],
                ['LOAN-LEGACY-001', 'LOAN', '100.00', $loanLedger->code],
            ] as [$accountNo, $type, $balance, $ledgerCode]) {
                $rows[] = array_merge(array_fill_keys($headers, ''), [
                    'account_no' => $accountNo,
                    'branch_code' => $branch->code,
                    'account_type' => $type,
                    'opening_balance' => $balance,
                    'ledger_account_code' => $ledgerCode,
                    'status' => 'ACTIVE',
                    ...($type === 'LOAN' ? [
                        'customer_no' => 'MEM-CUTOVER-001',
                        'product_code' => 'LOAN-STD',
                        'opened_at' => '2026-01-01',
                        'principal_amount' => '120.00',
                        'disbursed_amount' => '120.00',
                        'contractual_rate' => '12',
                        'interest_calculation' => 'REDUCING_BALANCE',
                        'interest_frequency' => 'MONTHLY',
                        'term_value' => '12',
                        'term_unit' => 'MONTH',
                        'repayment_frequency' => 'MONTHLY',
                        'grace_days' => '0',
                        'maturity_date' => '2027-10-28',
                    ] : []),
                ]);
            }
            $stream = fopen('php://temp', 'r+');
            fputcsv($stream, $headers);
            foreach ($rows as $values) {
                fputcsv($stream, array_values($values));
            }
            rewind($stream);
            $contents = stream_get_contents($stream);
            fclose($stream);
        } elseif ($template['name'] === 'loan_schedules.csv') {
            $headers = explode(',', strtok($contents, "\n"));
            $values = array_merge(array_fill_keys($headers, ''), [
                'account_no' => 'LOAN-LEGACY-001',
                'installment_no' => '1',
                'due_date' => '2026-11-28',
                'opening_principal' => '120.00',
                'scheduled_principal' => '100.00',
                'scheduled_interest' => '10.00',
                'scheduled_fee' => '0',
                'scheduled_protection_fee' => '0',
                'total_due' => '110.00',
                'total_paid' => '0',
                'principal_paid' => '0',
                'interest_paid' => '0',
                'fee_paid' => '0',
                'protection_fee_paid' => '0',
            ]);
            $stream = fopen('php://temp', 'r+');
            fputcsv($stream, $headers);
            fputcsv($stream, array_values($values));
            rewind($stream);
            $contents = stream_get_contents($stream);
            fclose($stream);
        } elseif (in_array($template['name'], ['loan_arrears.csv', 'recurring_installments.csv'], true)) {
            $contents = substr($template['contents'], 0, strpos($template['contents'], "\n") + 1);
        } elseif ($template['name'] === 'customers.csv') {
            $headers = explode(',', strtok($contents, "\n"));
            $values = array_merge(array_fill_keys($headers, ''), [
                'customer_no' => 'MEM-CUTOVER-001',
                'type' => 'INDIVIDUAL',
                'name' => 'Cutover Member',
                'identification_type' => 'NATIONAL_IDENTIFICATION_NUMBER',
                'identification_number' => 'CUTOVER-NID-001',
                'branch_code' => $branch->code,
                'status' => 'ACTIVE',
            ]);
            $stream = fopen('php://temp', 'r+');
            fputcsv($stream, $headers);
            fputcsv($stream, array_values($values));
            rewind($stream);
            $contents = stream_get_contents($stream);
            fclose($stream);
        } elseif ($template['name'] === 'bank_accounts.csv') {
            $headers = explode(',', strtok($contents, "\n"));
            $values = array_merge(array_fill_keys($headers, ''), [
                'financial_account_no' => 'BANK-LEGACY-001',
                'branch_code' => $branch->code,
                'account_name' => 'Legacy Operating',
                'account_number' => 'BANK-001',
                'account_type' => 'CURRENT',
                'is_reconcilable' => 'true',
                'status' => 'ACTIVE',
            ]);
            $stream = fopen('php://temp', 'r+');
            fputcsv($stream, $headers);
            fputcsv($stream, array_values($values));
            rewind($stream);
            $contents = stream_get_contents($stream);
            fclose($stream);
        } elseif ($template['name'] === 'cash_locations.csv') {
            $headers = explode(',', strtok($contents, "\n"));
            $values = array_merge(array_fill_keys($headers, ''), [
                'code' => 'VAULT-LEGACY-001',
                'name' => 'Main Vault',
                'type' => 'VAULT',
                'branch_code' => $branch->code,
                'financial_account_no' => 'CASH-LEGACY-001',
                'maximum_balance' => '10000',
            ]);
            $stream = fopen('php://temp', 'r+');
            fputcsv($stream, $headers);
            fputcsv($stream, array_values($values));
            $tellerValues = array_merge(array_fill_keys($headers, ''), [
                'code' => 'TELLER-LEGACY-001',
                'name' => 'Main Teller',
                'type' => 'TELLER',
                'branch_code' => $branch->code,
                'financial_account_no' => 'CASH-LEGACY-002',
                'user_email' => $user->email,
            ]);
            fputcsv($stream, array_values($tellerValues));
            rewind($stream);
            $contents = stream_get_contents($stream);
            fclose($stream);
        }
        $zip->addFromString($template['name'], $contents);
    }
    $zip->close();
    $upload = UploadedFile::fake()->createWithContent('cutover.zip', file_get_contents($archivePath));
    unlink($archivePath);

    $result = $importer->import(
        $upload,
        $organization->id,
        $user->id,
        $period->id,
        $offset->id,
        '2026-10-28',
    );

    $account = FinancialAccount::query()->where('account_no', 'CASH-LEGACY-001')->firstOrFail();
    expect($result['customers'])->toBe(1)
        ->and($result['accounts'])->toBe(4)
        ->and($result['bank_accounts'])->toBe(1)
        ->and($result['cash_locations'])->toBe(2)
        ->and((float) $account->balance)->toBe(500.0)
        ->and((float) $result['voucher']->entries->sum('debit'))->toBe(1100.0)
        ->and((float) $result['voucher']->entries->sum('credit'))->toBe(1100.0)
        ->and(FinancialTransaction::query()->where('transaction_type', 'OPENING_BALANCE')->exists())->toBeTrue();
    expect(Customer::query()->where('customer_no', 'MEM-CUTOVER-001')->exists())->toBeTrue();
    expect(FinancialAccount::query()->where('account_no', 'LOAN-LEGACY-001')->value('balance'))->toBe('100.0000')
        ->and(\App\FinancialServices\Models\LoanSchedule::query()->count())->toBe(1);
    expect(BranchDay::query()->where('branch_id', $branch->id)->whereDate('business_date', '2026-10-28')->exists())->toBeTrue()
        ->and(VaultSession::query()->where('opening_cash', 500)->exists())->toBeTrue()
        ->and(TellerSession::query()->where('opening_cash', 100)->exists())->toBeTrue();
});

it('requires an offset account when creating opening balances', function () {
    $organization = Organization::factory()->create();
    $user = User::factory()->create(['organization_id' => $organization->id]);
    $fiscalYear = app(FiscalYearService::class)->create([
        'organization_id' => $organization->id,
        'name' => '2025-2026',
        'start_date' => '2025-07-01',
        'end_date' => '2026-06-30',
    ]);
    $period = app(FiscalPeriodService::class)->create($fiscalYear, [
        'name' => 'July 2025',
        'start_date' => '2025-07-01',
        'end_date' => '2025-07-31',
        'status' => 'OPEN',
    ]);

    $assetGroup = app(AccountGroupService::class)->create([
        'organization_id' => $organization->id,
        'code' => '1000',
        'name' => 'Assets',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
    ]);
    $cash = app(LedgerAccountService::class)->create([
        'organization_id' => $organization->id,
        'account_group_id' => $assetGroup->id,
        'code' => '1100',
        'name' => 'Cash',
        'type' => 'ASSET',
        'normal_balance' => 'DEBIT',
        'status' => true,
        'is_cash_account' => true,
    ]);

    expect(fn () => app(OpeningBalanceService::class)->apply([
        ['account_id' => $cash->id, 'amount' => 500],
    ], $organization->id, $user->id, $period->id))->toThrow(InvalidArgumentException::class, 'offset account');
});
