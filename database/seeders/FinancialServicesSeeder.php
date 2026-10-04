<?php

namespace Database\Seeders;

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialAccountAuthorizedPerson;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\FinancialProductAccountMapping;
use App\FinancialServices\Models\FinancialProductPolicy;
use App\FinancialServices\Models\FinancialTransaction;
use App\FinancialServices\Models\FinancialTransactionEntry;
use App\FinancialServices\Models\FixedDeposit;
use App\FinancialServices\Models\LoanAccount;
use App\FinancialServices\Models\LoanApplication;
use App\FinancialServices\Models\RecurringDeposit;
use App\FinancialServices\Models\RecurringDepositInstallment;
use App\FinancialServices\Models\ShareAccount;
use App\FinancialServices\Application\LoanScheduleService;
use App\GeneralAccounting\Application\FinancialTransactionAccountingService;
use App\GeneralAccounting\Models\LedgerAccount;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Models\Bank;
use App\TreasuryAndCash\Models\BankAccount;
use App\TreasuryAndCash\Models\Cheque;
use App\TreasuryAndCash\Models\ChequeBook;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class FinancialServicesSeeder extends Seeder
{
    public function run(): void
    {
        $organization = Organization::query()->where('code', 'ORG-001')->firstOrFail();

        $branchId = $organization->branches()->oldest('id')->value('id');

        DB::transaction(function () use ($organization, $branchId) {
            $savingsOpeningAmount = 1000;
            $shareOpeningAmount = 5000;
            $legacySavingsBalance = 25000;
            $legacyFixedDepositPrincipal = 100000;

            $seedCustomer = Customer::query()
                ->where('organization_id', $organization->id)
                ->orderBy('id')
                ->first();

            if (!$seedCustomer) {
                $seedCustomer = Customer::factory()->create([
                    'organization_id' => $organization->id,
                    'branch_id' => $branchId,
                    'type' => 'INDIVIDUAL',
                    'status' => 'ACTIVE',
                ]);
            }

            $createSavingsChequeBook = function (FinancialAccount $account) use ($organization, $branchId, $seedCustomer): void {
                $hasBookFinancialAccount = Schema::hasColumn('cheque_books', 'financial_account_id');
                $hasChequesFinancialAccount = Schema::hasColumn('cheques', 'financial_account_id');
                $hasBankAccountColumn = Schema::hasColumn('cheque_books', 'bank_account_id');

                $bank = Bank::query()->firstOrCreate(
                    ['organization_id' => $organization->id, 'code' => 'BANK-CORE'],
                    [
                        'name' => 'Core Bank',
                        'short_name' => 'CORE',
                        'status' => true,
                    ],
                );

                $bankAccount = BankAccount::query()->firstOrCreate(
                    ['organization_id' => $organization->id, 'account_number' => 'BANK-CORE-001'],
                    [
                        'branch_id' => $branchId,
                        'bank_id' => $bank->id,
                        'financial_account_id' => $account->id,
                        'account_name' => $account->name . ' Cheque Account',
                        'routing_number' => '0001',
                        'account_type' => 'SAVINGS',
                        'opening_balance' => 0,
                        'is_reconcilable' => true,
                        'status' => 'ACTIVE',
                    ],
                );

                $bookQuery = $hasBookFinancialAccount
                    ? ['financial_account_id' => $account->id, 'book_no' => 'SAV-CHECKBOOK-' . $account->id]
                    : ['book_no' => 'SAV-CHECKBOOK-' . $account->id];

                $bookData = [
                    'prefix' => 'SAV',
                    'start_number' => 1001,
                    'end_number' => 1015,
                    'current_number' => 1001,
                    'leaf_count' => 15,
                    'issued_date' => now()->toDateString(),
                    'status' => 'IN_USE',
                ];

                if ($hasBankAccountColumn) {
                    $bookData['bank_account_id'] = $bankAccount->id;
                }

                if ($hasBookFinancialAccount) {
                    $bookData['financial_account_id'] = $account->id;
                }

                $book = ChequeBook::query()->firstOrCreate($bookQuery, $bookData);

                $existingCheques = $book->cheques()->count();
                if ($existingCheques === 0) {
                    foreach (range(1001, 1015) as $number) {
                        $status = $number <= 1004 ? 'ISSUED' : 'UNUSED';
                        $amount = $number <= 1003 ? [2500, 3750, 5000][$number - 1001] ?? 2000 : null;

                        $chequeData = [
                            'cheque_book_id' => $book->id,
                            'cheque_no' => 'SAV-' . $number,
                            'status' => $status,
                            'issue_date' => now()->toDateString(),
                            'cheque_date' => now()->toDateString(),
                            'amount' => $amount,
                            'payee' => $status === 'ISSUED' ? $seedCustomer->name : null,
                            'memo' => 'Seeded savings cheque book',
                        ];

                        if ($hasChequesFinancialAccount) {
                            $chequeData['financial_account_id'] = $account->id;
                        }

                        Cheque::query()->create($chequeData);
                    }
                }
            };

            $products = [
                ['SAV-REG', 'Regular Savings', 'SAVINGS', 'LIABILITY', '3.000000', 'SIMPLE', 'MONTHLY', 100],
                ['SAV-MINOR', 'Minor Savings', 'SAVINGS', 'LIABILITY', '4.000000', 'SIMPLE', 'MONTHLY', 50],
                ['SHR-MEM', 'Member Share Capital', 'SHARE', 'EQUITY', '0.000000', 'NONE', 'NONE', 1000],
                ['FDR-12M', 'Twelve Month Fixed Deposit', 'FIXED_DEPOSIT', 'LIABILITY', '8.500000', 'COMPOUND', 'MATURITY', 10000],
                ['RD-24M', 'Twenty Four Month Recurring Deposit', 'RECURRING_DEPOSIT', 'LIABILITY', '7.000000', 'COMPOUND', 'MONTHLY', 500],
                ['LN-GEN', 'General Loan', 'LOAN', 'ASSET', '12.000000', 'REDUCING_BALANCE', 'MONTHLY', 0],
            ];

            foreach ($products as [$code, $name, $category, $balanceType, $rate, $calculation, $frequency, $minimumOpening]) {
                $product = FinancialProduct::query()->updateOrCreate(
                    ['organization_id' => $organization->id, 'code' => $code],
                    [
                        'name' => $name,
                        'category' => $category,
                        'balance_type' => $balanceType,
                        'settings' => [
                            'credit_union' => true,
                            'requires_kyc' => true,
                            'minimum_opening_amount' => $minimumOpening,
                            'joint_holders_allowed' => in_array($category, ['SAVINGS', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT'], true),
                        ],
                        'is_system' => true,
                        'status' => true,
                    ],
                );

                $termValue = match ($category) {
                    'FIXED_DEPOSIT' => 12,
                    'RECURRING_DEPOSIT' => 24,
                    'LOAN' => 12,
                    default => 1,
                };

                DB::table('financial_product_terms')->updateOrInsert(
                    ['financial_product_id' => $product->id, 'code' => 'BASE'],
                    [
                        'name' => 'Base term',
                        'tenure_value' => $termValue,
                        'tenure_unit' => 'MONTH',
                        'interest_rate' => $rate,
                        'interest_calculation' => $calculation,
                        'interest_frequency' => $frequency,
                        'minimum_amount' => $minimumOpening ?: null,
                        'maximum_amount' => null,
                        'rules' => json_encode([]),
                        'status' => true,
                        'effective_from' => '2025-07-01',
                        'updated_at' => now(),
                        'created_at' => now(),
                    ],
                );

                FinancialProductPolicy::query()->updateOrCreate(
                    ['financial_product_id' => $product->id],
                    [
                        'minimum_opening_amount' => $minimumOpening,
                        'minimum_deposit_amount' => $category === 'LOAN' ? null : $minimumOpening,
                        'maximum_loan_amount' => $category === 'LOAN' ? 500000 : null,
                        'loan_to_value_percent' => $category === 'LOAN' ? 80 : null,
                        'eligibility_rules' => [
                            'kyc_level' => $category === 'LOAN' ? 'FULL' : 'BASIC',
                            'organization_customers_allowed' => true,
                        ],
                        'tenure_rules' => $category === 'LOAN' ? ['minimum_months' => 6, 'maximum_months' => 60] : null,
                        'repayment_rules' => $category === 'LOAN' ? ['frequency' => 'MONTHLY', 'allocation' => ['FEE', 'INTEREST', 'PRINCIPAL']] : null,
                        'status' => 'ACTIVE',
                        'version' => '1.0',
                        'effective_from' => '2025-07-01',
                    ],
                );

                $liabilityAccount = match ($category) {
                    'SAVINGS' => '2100',
                    'FIXED_DEPOSIT' => '2200',
                    'RECURRING_DEPOSIT' => '2300',
                    'SHARE' => '3100',
                    default => '1300',
                };
                $mappingPairs = $category === 'LOAN'
                    ? [
                        ['DISBURSEMENT', '1300', '1110'],
                        ['REPAYMENT', '1110', '1300'],
                        ['INTEREST', '1110', '4100'],
                        ['FEE', '1110', '4200'],
                    ]
                    : [
                        ['DEPOSIT', '1110', $liabilityAccount],
                        ['WITHDRAWAL', $liabilityAccount, '1110'],
                        ['INTEREST', '5200', $liabilityAccount],
                        ['FEE', $liabilityAccount, '4200'],
                    ];

                if ($category !== 'LOAN') {
                    $mappingPairs[] = ['MIGRATION_OPENING_BALANCE', '1110', $liabilityAccount];
                }

                foreach ($mappingPairs as [$transactionType, $debitCode, $creditCode]) {
                    $debitAccount = LedgerAccount::query()->where('organization_id', $organization->id)->where('code', $debitCode)->first();
                    $creditAccount = LedgerAccount::query()->where('organization_id', $organization->id)->where('code', $creditCode)->first();
                    if ($debitAccount && $creditAccount) {
                        FinancialProductAccountMapping::query()->updateOrCreate(
                            [
                                'organization_id' => $organization->id,
                                'financial_product_id' => $product->id,
                                'source_type' => 'FINANCIAL_PRODUCT',
                                'source_code' => (string) $product->id,
                                'transaction_type' => $transactionType,
                            ],
                            ['debit_account_id' => $debitAccount->id, 'credit_account_id' => $creditAccount->id, 'status' => true],
                        );
                    }
                }
            }

            $customers = Customer::query()
                ->where('organization_id', $organization->id)
                ->where('type', 'INDIVIDUAL')
                ->orderBy('id')
                ->take(3)
                ->get();

            if ($customers->isEmpty()) {
                $customers = Customer::factory()->count(3)->create([
                    'organization_id' => $organization->id,
                    'type' => 'INDIVIDUAL',
                ]);
            }

            $janeDoe = Customer::query()
                ->where('organization_id', $organization->id)
                ->where('name', 'Jane Doe')
                ->first();

            if (!$janeDoe) {
                $janeDoe = Customer::factory()->individualFemale()->create([
                    'organization_id' => $organization->id,
                    'branch_id' => $branchId,
                    'name' => 'Jane Doe',
                    'status' => 'ACTIVE',
                ]);
            }

            $johnDoe = Customer::query()
                ->where('organization_id', $organization->id)
                ->where('name', 'John Doe')
                ->first();

            if (!$johnDoe) {
                $johnDoe = Customer::factory()->individualMale()->create([
                    'organization_id' => $organization->id,
                    'branch_id' => $branchId,
                    'name' => 'John Doe',
                    'status' => 'ACTIVE',
                ]);
            }

            $minorCustomer = Customer::query()
                ->where('organization_id', $organization->id)
                ->where('name', 'Alex Doe')
                ->first();

            if (!$minorCustomer) {
                $minorCustomer = Customer::factory()->individualMale()->create([
                    'organization_id' => $organization->id,
                    'branch_id' => $branchId,
                    'name' => 'Alex Doe',
                    'dob' => now()->subYears(12)->toDateString(),
                    'status' => 'ACTIVE',
                ]);
            }

            $organizationCustomer = Customer::query()
                ->where('organization_id', $organization->id)
                ->where('name', 'ABC Corp.')
                ->first();

            if (!$organizationCustomer) {
                $organizationCustomer = Customer::factory()->organization()->create([
                    'organization_id' => $organization->id,
                    'branch_id' => $branchId,
                    'name' => 'ABC Corp.',
                    'status' => 'ACTIVE',
                ]);
            }

            if (!$customers->contains('id', $janeDoe->id)) {
                $customers->push($janeDoe);
            }

            if (!$customers->contains('id', $johnDoe->id)) {
                $customers->push($johnDoe);
            }

            $multiProductCustomer = $janeDoe;
            foreach (FinancialProduct::query()->where('organization_id', $organization->id)->orderBy('id')->get() as $product) {
                if (in_array($product->category, ['FIXED_DEPOSIT', 'LOAN', 'RECURRING_DEPOSIT'], true)) {
                    continue;
                }

                $accountNo = match ($product->category) {
                    'SAVINGS' => 'SAV-ALL-' . $multiProductCustomer->id,
                    'SHARE' => 'SHR-ALL-' . $multiProductCustomer->id,
                    'FIXED_DEPOSIT' => 'FDR-ALL-' . $multiProductCustomer->id,
                    'RECURRING_DEPOSIT' => 'RD-ALL-' . $multiProductCustomer->id,
                    'LOAN' => 'LN-ALL-' . $multiProductCustomer->id,
                    default => 'OTH-ALL-' . $multiProductCustomer->id,
                };

                $balance = match ($product->category) {
                    'SAVINGS' => 15000,
                    'SHARE' => 2500,
                    'FIXED_DEPOSIT' => 35000,
                    'RECURRING_DEPOSIT' => 18000,
                    'LOAN' => 42000,
                    default => 0,
                };

                $account = FinancialAccount::query()->updateOrCreate(
                    ['organization_id' => $organization->id, 'account_no' => $accountNo],
                    [
                        'branch_id' => $branchId,
                        'financial_product_id' => $product->id,
                        'holder_type' => Customer::class,
                        'holder_id' => $multiProductCustomer->id,
                        'name' => $multiProductCustomer->name . ' - ' . $product->name,
                        'account_type' => $product->category,
                        'status' => 'ACTIVE',
                        'balance' => $balance,
                        'available_balance' => $balance,
                        'interest_accrued' => 0,
                        'opened_at' => '2025-07-01',
                        'metadata' => ['seeded' => true, 'multi_product_customer' => true],
                    ],
                );

                if (!$account->holders()->where('customers.id', $multiProductCustomer->id)->exists()) {
                    $account->addHolder($multiProductCustomer, 'PRIMARY');
                }

                if ($product->category === 'SAVINGS') {
                    $createSavingsChequeBook($account);
                }

                if ($product->category === 'SHARE') {
                    ShareAccount::query()->firstOrCreate(
                        ['financial_account_id' => $account->id],
                        ['member_since' => now()->subMonths(3)->toDateString(), 'membership_no' => 'SEED-MEM-' . $multiProductCustomer->id, 'membership_status' => 'ACTIVE'],
                    );
                }

                if ($product->category === 'FIXED_DEPOSIT') {
                    $productRate = (float) DB::table('financial_product_terms')
                        ->where('financial_product_id', $product->id)
                        ->where('code', 'BASE')
                        ->value('interest_rate');
                    FixedDeposit::query()->firstOrCreate(
                        ['financial_account_id' => $account->id],
                        ['principal_amount' => $balance, 'contractual_rate' => $productRate, 'term_value' => 12, 'term_unit' => 'MONTH', 'started_at' => now()->subMonths(3)->toDateString(), 'maturity_date' => now()->addMonths(9)->toDateString(), 'maturity_amount' => round($balance * (1 + ($productRate / 100)), 2), 'maturity_instruction' => 'RENEW_PRINCIPAL'],
                    );
                }

                if ($product->category === 'RECURRING_DEPOSIT') {
                    RecurringDeposit::query()->firstOrCreate(
                        ['financial_account_id' => $account->id],
                        ['installment_amount' => 1500, 'installment_frequency' => 'MONTHLY', 'total_installments' => 12, 'paid_installments' => 3, 'started_at' => now()->subMonths(3)->toDateString(), 'maturity_date' => now()->addMonths(9)->toDateString(), 'maturity_extension_days' => 0, 'grace_days' => 7],
                    );
                }
            }

            foreach (['SAVINGS', 'FIXED_DEPOSIT'] as $category) {
                $product = FinancialProduct::query()
                    ->where('organization_id', $organization->id)
                    ->where('category', $category)
                    ->orderBy('code')
                    ->firstOrFail();
                $accountNo = $category === 'SAVINGS'
                    ? 'SAV-CORP-' . $organizationCustomer->id
                    : 'FDR-CORP-' . $organizationCustomer->id;
                $balance = $category === 'SAVINGS' ? 10000 : 50000;

                $account = FinancialAccount::query()->updateOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'account_no' => $accountNo,
                    ],
                    [
                        'branch_id' => $branchId,
                        'financial_product_id' => $product->id,
                        'holder_type' => Customer::class,
                        'holder_id' => $organizationCustomer->id,
                        'name' => $organizationCustomer->name . ' - ' . $product->name,
                        'account_type' => $category,
                        'status' => 'ACTIVE',
                        'balance' => $balance,
                        'available_balance' => $category === 'SAVINGS' ? $balance : 0,
                        'opened_at' => '2025-07-01',
                        'metadata' => ['seeded' => true, 'organization_customer' => true],
                    ],
                );

                if (!$account->holders()->where('customers.id', $organizationCustomer->id)->exists()) {
                    $account->addHolder($organizationCustomer, 'PRIMARY');
                }

                foreach ([$johnDoe, $janeDoe] as $signatory) {
                    FinancialAccountAuthorizedPerson::query()->updateOrCreate(
                        [
                            'financial_account_id' => $account->id,
                            'customer_id' => $signatory->id,
                            'authorization_type' => 'SIGNATORY',
                        ],
                        [
                            'designation' => 'Company Signatory',
                            'is_active' => true,
                            'note' => 'Authorized signatory for the organization account.',
                        ],
                    );
                }

                if ($category === 'FIXED_DEPOSIT') {
                    $productRate = (float) DB::table('financial_product_terms')
                        ->where('financial_product_id', $product->id)
                        ->where('code', 'BASE')
                        ->value('interest_rate');

                    FixedDeposit::query()->updateOrCreate(
                        ['financial_account_id' => $account->id],
                        [
                            'principal_amount' => $balance,
                            'contractual_rate' => $productRate,
                            'term_value' => 12,
                            'term_unit' => 'MONTH',
                            'started_at' => '2025-07-01',
                            'maturity_date' => '2026-07-01',
                            'maturity_amount' => round($balance * (1 + ($productRate / 100)), 2),
                            'maturity_instruction' => 'RENEW_PRINCIPAL',
                        ],
                    );
                }
            }

            $loanCustomer = $janeDoe;
            FinancialAccount::query()
                ->where('organization_id', $organization->id)
                ->whereIn('account_no', [
                    'FDR-ALL-' . $loanCustomer->id,
                    'LN-ALL-' . $loanCustomer->id,
                    'RD-ALL-' . $loanCustomer->id,
                ])
                ->whereJsonContains('metadata->seeded', true)
                ->whereJsonContains('metadata->multi_product_customer', true)
                ->whereDoesntHave('transactions')
                ->delete();

            $loanProduct = FinancialProduct::query()
                ->where('organization_id', $organization->id)
                ->where('code', 'LN-GEN')
                ->firstOrFail();
            $loanApplication = LoanApplication::query()->updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'application_no' => 'APP-SEED-0001',
                ],
                [
                    'branch_id' => $branchId,
                    'customer_id' => $loanCustomer->id,
                    'financial_product_id' => $loanProduct->id,
                    'requested_amount' => 50000,
                    'approved_amount' => 50000,
                    'requested_term_months' => 24,
                    'purpose' => 'Seeded general loan for financial services workflows',
                    'status' => 'APPROVED',
                    'applied_at' => '2025-06-01',
                    'approved_at' => '2025-07-01',
                    'decision_note' => 'Seeded approved loan application',
                ],
            );
            $loanFinancialAccount = FinancialAccount::query()->updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'account_no' => 'LOAN-SEED-0001',
                ],
                [
                    'branch_id' => $branchId,
                    'financial_product_id' => $loanProduct->id,
                    'holder_type' => Customer::class,
                    'holder_id' => $loanCustomer->id,
                    'name' => $loanCustomer->name . ' General Loan',
                    'account_type' => 'LOAN',
                    'status' => 'ACTIVE',
                    'balance' => 50000,
                    'available_balance' => 50000,
                    'opened_at' => '2025-07-01',
                    'metadata' => ['seeded' => true],
                ],
            );

            $loanAccount = LoanAccount::query()->updateOrCreate(
                ['loan_no' => 'LN-SEED-0001'],
                [
                    'financial_account_id' => $loanFinancialAccount->id,
                    'loan_application_id' => $loanApplication->id,
                    'principal_amount' => 50000,
                    'disbursed_amount' => 50000,
                    'contractual_rate' => DB::table('financial_product_terms')->where('financial_product_id', $loanProduct->id)->where('code', 'BASE')->value('interest_rate'),
                    'interest_calculation' => 'REDUCING_BALANCE',
                    'interest_frequency' => 'MONTHLY',
                    'term_value' => 24,
                    'term_unit' => 'MONTH',
                    'repayment_frequency' => 'MONTHLY',
                    'grace_days' => 0,
                    'late_payment_fine_rate' => 0,
                    'approved_at' => '2025-07-01',
                    'disbursed_at' => '2025-07-01',
                    'maturity_date' => '2027-07-01',
                    'status' => 'ACTIVE',
                ],
            );
            app(LoanScheduleService::class)->generate($loanAccount, [
                'frequency' => 'MONTHLY',
                'term_months' => 24,
                'start_date' => '2025-07-01',
            ]);

            $recurringDepositProduct = FinancialProduct::query()
                ->where('organization_id', $organization->id)
                ->where('code', 'RD-24M')
                ->firstOrFail();
            $recurringDepositAccount = FinancialAccount::query()->updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'account_no' => 'RD-SEED-0001',
                ],
                [
                    'branch_id' => $branchId,
                    'financial_product_id' => $recurringDepositProduct->id,
                    'holder_type' => Customer::class,
                    'holder_id' => $loanCustomer->id,
                    'name' => $loanCustomer->name . ' Recurring Deposit',
                    'account_type' => 'RECURRING_DEPOSIT',
                    'status' => 'ACTIVE',
                    'balance' => 30000,
                    'available_balance' => 30000,
                    'opened_at' => '2025-07-01',
                    'metadata' => ['seeded' => true],
                ],
            );

            $recurringDeposit = RecurringDeposit::query()->updateOrCreate(
                ['financial_account_id' => $recurringDepositAccount->id],
                [
                    'installment_amount' => 5000,
                    'installment_frequency' => 'MONTHLY',
                    'total_installments' => 24,
                    'paid_installments' => 6,
                    'started_at' => '2025-07-01',
                    'maturity_date' => '2027-07-01',
                    'maturity_extension_days' => 0,
                    'grace_days' => 7,
                ],
            );

            foreach (range(1, 24) as $installmentNo) {
                $isPaid = $installmentNo <= 6;
                $installmentDate = now()->setDate(2025, 7, 1)->addMonths($installmentNo - 1);
                RecurringDepositInstallment::query()->updateOrCreate(
                    [
                        'recurring_deposit_id' => $recurringDeposit->id,
                        'installment_no' => $installmentNo,
                    ],
                    [
                        'due_date' => $installmentDate->toDateString(),
                        'amount_due' => 5000,
                        'amount_paid' => $isPaid ? 5000 : 0,
                        'fine_amount' => 0,
                        'status' => $isPaid ? 'PAID' : 'PENDING',
                        'paid_at' => $isPaid ? $installmentDate : null,
                    ],
                );
            }

            $savingsProduct = FinancialProduct::query()
                ->where('organization_id', $organization->id)
                ->where('category', 'SAVINGS')
                ->first();

            $cashAccount = FinancialAccount::query()->firstOrCreate(
                [
                    'organization_id' => $organization->id,
                    'account_no' => 'CASH-VAULT-001',
                ],
                [
                    'branch_id' => $branchId,
                    'financial_product_id' => null,
                    'account_type' => 'CASH',
                    'status' => 'ACTIVE',
                    'balance' => 0,
                    'available_balance' => 0,
                    'opened_at' => '2025-07-01',
                    'metadata' => ['seeded' => true, 'cash_location' => 'Main Vault'],
                ],
            );

            foreach ($customers as $index => $customer) {
                $account = FinancialAccount::query()->firstOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'account_no' => sprintf('SAV-%06d', $customer->id),
                    ],
                    [
                        'branch_id' => $branchId,
                        'financial_product_id' => $savingsProduct?->id,
                        'holder_type' => Customer::class,
                        'holder_id' => $customer->id,
                        'name' => $customer->name,
                        'account_type' => 'SAVINGS',
                        'status' => 'ACTIVE',
                        'balance' => $savingsOpeningAmount,
                        'available_balance' => $savingsOpeningAmount,
                        'interest_accrued' => 0,
                        'opened_at' => '2025-07-01',
                        'metadata' => ['seeded' => true],
                    ],
                );

                $transaction = FinancialTransaction::query()->updateOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'transaction_no' => sprintf('FT-SEED-%03d', $index + 1),
                    ],
                    [
                        'branch_id' => $branchId,
                        'transaction_type' => 'DEPOSIT',
                        'transaction_date' => now()->setDate(2025, 7, 2)->addDays($index)->startOfDay(),
                        'amount' => $savingsOpeningAmount,
                        'currency' => 'BDT',
                        'status' => 'POSTED',
                        'reference' => 'SEED-OPENING',
                        'description' => 'Seeded member savings opening deposit',
                    ],
                );

                FinancialTransactionEntry::query()->updateOrCreate(
                    ['financial_transaction_id' => $transaction->id, 'financial_account_id' => $cashAccount->id, 'direction' => 'DEBIT'],
                    ['amount' => $savingsOpeningAmount, 'balance_after' => ($index + 1) * $savingsOpeningAmount, 'description' => 'Seeded vault cash received'],
                );
                FinancialTransactionEntry::query()->updateOrCreate(
                    ['financial_transaction_id' => $transaction->id, 'financial_account_id' => $account->id, 'direction' => 'CREDIT'],
                    ['amount' => $savingsOpeningAmount, 'balance_after' => $savingsOpeningAmount, 'description' => 'Member savings balance'],
                );
                $account->update([
                    'balance' => $savingsOpeningAmount,
                    'available_balance' => $savingsOpeningAmount,
                ]);

                $savingsProduct = FinancialProduct::query()->where('code', 'SAV-REG')->where('organization_id', $organization->id)->firstOrFail();
                $account->update([
                    'opened_at' => '2025-07-01',
                    'last_operated_at' => now()->setDate(2025, 7, 2)->addDays($index)->toDateString(),
                ]);
                $guardian = $customer->type === Customer::TYPE_INDIVIDUAL
                    && $customer->dob !== null
                    && $customer->dob->age < 18
                    ? $johnDoe
                    : null;
                $account->addHolder($customer, 'PRIMARY', $guardian);
            }

            $savingsProduct = FinancialProduct::query()
                ->where('organization_id', $organization->id)
                ->where('code', 'SAV-REG')
                ->firstOrFail();
            $jointSavingsAccount = FinancialAccount::query()->updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'account_no' => sprintf('SAV-JOINT-%06d-%06d', $johnDoe->id, $janeDoe->id),
                ],
                [
                    'branch_id' => $branchId,
                    'financial_product_id' => $savingsProduct->id,
                    'holder_type' => Customer::class,
                    'holder_id' => $johnDoe->id,
                    'name' => 'John Doe and Jane Doe - Joint Savings',
                    'account_type' => 'SAVINGS',
                    'status' => 'ACTIVE',
                    'balance' => 0,
                    'available_balance' => 0,
                    'interest_accrued' => 0,
                    'opened_at' => now()->toDateString(),
                    'metadata' => ['seeded' => true, 'joint_account' => true],
                ],
            );
            $jointSavingsAccount->addHolder($johnDoe, 'PRIMARY', null, 50);
            $jointSavingsAccount->addHolder($janeDoe, 'JOINT', null, 50);

            $minorSavingsProduct = FinancialProduct::query()
                ->where('organization_id', $organization->id)
                ->where('code', 'SAV-MINOR')
                ->firstOrFail();
            $minorSavingsAccount = FinancialAccount::query()->updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'account_no' => 'SAV-MINOR-' . $minorCustomer->id,
                ],
                [
                    'branch_id' => $branchId,
                    'financial_product_id' => $minorSavingsProduct->id,
                    'holder_type' => Customer::class,
                    'holder_id' => $minorCustomer->id,
                    'name' => $minorCustomer->name . ' - ' . $minorSavingsProduct->name,
                    'account_type' => 'SAVINGS',
                    'status' => 'ACTIVE',
                    'balance' => 0,
                    'available_balance' => 0,
                    'interest_accrued' => 0,
                    'opened_at' => now()->toDateString(),
                    'metadata' => ['seeded' => true, 'minor_account' => true],
                ],
            );
            $minorSavingsAccount->addHolder($minorCustomer, 'PRIMARY', $johnDoe);

            foreach ([$johnDoe, $janeDoe] as $parent) {
                FinancialAccountAuthorizedPerson::query()->updateOrCreate(
                    [
                        'financial_account_id' => $minorSavingsAccount->id,
                        'customer_id' => $parent->id,
                        'authorization_type' => 'OPERATOR',
                    ],
                    [
                        'designation' => 'Parent',
                        'is_active' => true,
                        'note' => 'Authorized to operate the minor savings account.',
                    ],
                );
            }

            $seededSavingsCount = $customers->count();
            $cashAccount->update([
                'balance' => $seededSavingsCount * $savingsOpeningAmount,
                'available_balance' => $seededSavingsCount * $savingsOpeningAmount,
            ]);

            $legacyCustomer = $janeDoe;

            $legacySavingsProduct = FinancialProduct::query()
                ->where('organization_id', $organization->id)
                ->where('code', 'SAV-REG')
                ->firstOrFail();
            $legacySavingsAccount = FinancialAccount::query()->updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'account_no' => 'SAV-0001',
                ],
                [
                    'branch_id' => $branchId,
                    'financial_product_id' => $legacySavingsProduct->id,
                    'holder_type' => Customer::class,
                    'holder_id' => $legacyCustomer->id,
                    'name' => $legacyCustomer->name,
                    'account_type' => 'SAVINGS',
                    'status' => 'ACTIVE',
                    'balance' => $legacySavingsBalance,
                    'available_balance' => $legacySavingsBalance,
                    'opened_at' => '2019-04-15',
                    'metadata' => [
                        'seeded' => true,
                        'migration' => [
                            'source_system' => 'legacy_core_banking',
                            'source_account_no' => 'SAV-88421',
                            'migrated_at' => '2025-07-01',
                            'opening_balance' => $legacySavingsBalance,
                        ],
                    ],
                ],
            );
            $legacySavingsAccount->update([
                'opened_at' => '2019-04-15',
                'last_operated_at' => '2025-06-28',
                'membership_eligible_at' => '2019-10-15',
            ]);
            $legacySavingsAccount->addHolder($legacyCustomer, 'PRIMARY');

            $legacyFixedProduct = FinancialProduct::query()
                ->where('organization_id', $organization->id)
                ->where('code', 'FDR-12M')
                ->firstOrFail();
            $legacyFixedAccount = FinancialAccount::query()->updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'account_no' => 'FDR-0001',
                ],
                [
                    'branch_id' => $branchId,
                    'financial_product_id' => $legacyFixedProduct->id,
                    'holder_type' => Customer::class,
                    'holder_id' => $legacyCustomer->id,
                    'name' => $legacyCustomer->name,
                    'account_type' => 'FIXED_DEPOSIT',
                    'status' => 'ACTIVE',
                    'balance' => $legacyFixedDepositPrincipal,
                    'available_balance' => 0,
                    'opened_at' => '2024-01-01',
                    'metadata' => [
                        'seeded' => true,
                        'migration' => [
                            'source_system' => 'legacy_core_banking',
                            'source_account_no' => 'FDR-55109',
                            'migrated_at' => '2025-07-01',
                            'opening_balance' => $legacyFixedDepositPrincipal,
                        ],
                    ],
                ],
            );
            $legacyFixedAccount->update([
                'opened_at' => '2024-01-01',
                'last_operated_at' => '2025-06-30',
            ]);
            $legacyFixedAccount->addHolder($legacyCustomer, 'PRIMARY');
            FixedDeposit::query()->updateOrCreate(
                ['financial_account_id' => $legacyFixedAccount->id],
                [
                    'principal_amount' => $legacyFixedDepositPrincipal,
                    'contractual_rate' => 8.5,
                    'term_value' => 12,
                    'term_unit' => 'MONTH',
                    'started_at' => '2024-01-01',
                    'maturity_date' => '2025-01-01',
                    'maturity_amount' => 108500,
                    'maturity_instruction' => 'RENEW_PRINCIPAL',
                ],
            );

            foreach ([
                [$legacySavingsAccount, $legacySavingsBalance, 'SAV-0001', 'Migrated legacy savings closing balance'],
                [$legacyFixedAccount, $legacyFixedDepositPrincipal, 'FDR-0001', 'Migrated legacy fixed deposit principal'],
            ] as [$legacyAccount, $amount, $transactionNo, $description]) {
                $migrationTransaction = FinancialTransaction::query()->updateOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'transaction_no' => $transactionNo,
                    ],
                    [
                        'branch_id' => $branchId,
                        'transaction_type' => 'MIGRATION_OPENING_BALANCE',
                        'transaction_date' => '2025-07-01',
                        'amount' => $amount,
                        'currency' => 'BDT',
                        'status' => 'POSTED',
                        'reference' => $transactionNo,
                        'description' => $description,
                    ],
                );
                FinancialTransactionEntry::query()->updateOrCreate(
                    ['financial_transaction_id' => $migrationTransaction->id, 'financial_account_id' => $cashAccount->id, 'direction' => 'DEBIT'],
                    ['amount' => $amount, 'balance_after' => $seededSavingsCount * $savingsOpeningAmount + $amount, 'description' => 'Migrated legacy balance offset'],
                );
                FinancialTransactionEntry::query()->updateOrCreate(
                    ['financial_transaction_id' => $migrationTransaction->id, 'financial_account_id' => $legacyAccount->id, 'direction' => 'CREDIT'],
                    ['amount' => $amount, 'balance_after' => $amount, 'description' => $description],
                );
            }
            $shareCustomer = $janeDoe;
            if ($shareCustomer) {
                $shareProduct = FinancialProduct::query()->where('organization_id', $organization->id)->where('category', 'SHARE')->firstOrFail();
                $shareAccount = FinancialAccount::query()->updateOrCreate(
                    ['organization_id' => $organization->id, 'account_no' => sprintf('SHR-%06d', $shareCustomer->id)],
                    ['branch_id' => $branchId, 'financial_product_id' => $shareProduct->id, 'holder_type' => Customer::class, 'holder_id' => $shareCustomer->id, 'name' => $shareCustomer->name, 'account_type' => 'SHARE', 'status' => 'ACTIVE', 'balance' => $shareOpeningAmount, 'available_balance' => $shareOpeningAmount, 'opened_at' => now()->subMonths(6)->toDateString(), 'metadata' => ['seeded' => true]],
                );
                $shareAccount->update([
                    'balance' => $shareOpeningAmount,
                    'available_balance' => $shareOpeningAmount,
                ]);
                $shareAccount->update(['opened_at' => '2025-07-05']);
                $shareAccount->addHolder($shareCustomer, 'PRIMARY');
                ShareAccount::query()->updateOrCreate(['financial_account_id' => $shareAccount->id], ['member_since' => '2025-07-05', 'membership_no' => sprintf('MEM-%05d', $shareCustomer->id), 'membership_status' => 'ACTIVE']);

                $shareTransaction = FinancialTransaction::query()->updateOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'transaction_no' => sprintf('FT-SEED-SHARE-%03d', $shareCustomer->id),
                    ],
                    [
                        'branch_id' => $branchId,
                        'transaction_type' => 'DEPOSIT',
                        'transaction_date' => '2025-07-05',
                        'amount' => $shareOpeningAmount,
                        'currency' => 'BDT',
                        'status' => 'POSTED',
                        'reference' => 'SEED-SHARE-OPENING',
                        'description' => 'Seeded member share opening contribution',
                    ],
                );
                FinancialTransactionEntry::query()->updateOrCreate(
                    ['financial_transaction_id' => $shareTransaction->id, 'financial_account_id' => $cashAccount->id, 'direction' => 'DEBIT'],
                    ['amount' => $shareOpeningAmount, 'balance_after' => $seededSavingsCount * $savingsOpeningAmount + $shareOpeningAmount, 'description' => 'Seeded vault cash received for share contribution'],
                );
                FinancialTransactionEntry::query()->updateOrCreate(
                    ['financial_transaction_id' => $shareTransaction->id, 'financial_account_id' => $shareAccount->id, 'direction' => 'CREDIT'],
                    ['amount' => $shareOpeningAmount, 'balance_after' => $shareOpeningAmount, 'description' => 'Member share capital opening contribution'],
                );
            }

            $loanDisbursement = FinancialTransaction::query()->updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'transaction_no' => 'FT-SEED-LOAN-001',
                ],
                [
                    'branch_id' => $branchId,
                    'transaction_type' => 'DISBURSEMENT',
                    'transaction_date' => '2025-07-01',
                    'amount' => 50000,
                    'currency' => 'BDT',
                    'status' => 'POSTED',
                    'reference' => 'LN-SEED-0001',
                    'description' => 'Seeded general loan disbursement',
                ],
            );
            FinancialTransactionEntry::query()->updateOrCreate(
                ['financial_transaction_id' => $loanDisbursement->id, 'financial_account_id' => $loanFinancialAccount->id, 'direction' => 'DEBIT'],
                ['amount' => 50000, 'description' => 'Loan principal disbursed'],
            );
            FinancialTransactionEntry::query()->updateOrCreate(
                ['financial_transaction_id' => $loanDisbursement->id, 'financial_account_id' => $cashAccount->id, 'direction' => 'CREDIT'],
                ['amount' => 50000, 'description' => 'Vault cash paid for loan disbursement'],
            );

            foreach (range(1, 6) as $installmentNo) {
                $installmentDate = now()->setDate(2025, 7, 1)->addMonths($installmentNo - 1);
                $installmentTransaction = FinancialTransaction::query()->updateOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'transaction_no' => sprintf('FT-SEED-RD-%03d', $installmentNo),
                    ],
                    [
                        'branch_id' => $branchId,
                        'transaction_type' => 'DEPOSIT',
                        'transaction_date' => $installmentDate,
                        'amount' => 5000,
                        'currency' => 'BDT',
                        'status' => 'POSTED',
                        'reference' => 'RD-SEED-0001-' . $installmentNo,
                        'description' => 'Seeded recurring deposit installment ' . $installmentNo,
                    ],
                );
                FinancialTransactionEntry::query()->updateOrCreate(
                    ['financial_transaction_id' => $installmentTransaction->id, 'financial_account_id' => $cashAccount->id, 'direction' => 'DEBIT'],
                    ['amount' => 5000, 'description' => 'Recurring deposit installment received'],
                );
                FinancialTransactionEntry::query()->updateOrCreate(
                    ['financial_transaction_id' => $installmentTransaction->id, 'financial_account_id' => $recurringDepositAccount->id, 'direction' => 'CREDIT'],
                    ['amount' => 5000, 'description' => 'Recurring deposit balance'],
                );
            }

            $cashBalance = (float) DB::table('financial_transaction_entries as entries')
                ->join('financial_transactions as transactions', 'transactions.id', '=', 'entries.financial_transaction_id')
                ->where('transactions.organization_id', $organization->id)
                ->where('transactions.status', 'POSTED')
                ->where('entries.financial_account_id', $cashAccount->id)
                ->selectRaw("COALESCE(SUM(CASE WHEN entries.direction = 'DEBIT' THEN entries.amount ELSE -entries.amount END), 0) as balance")
                ->value('balance');
            $cashAccount->update(['balance' => $cashBalance, 'available_balance' => $cashBalance]);

            foreach (FinancialAccount::query()
                ->where('organization_id', $organization->id)
                ->whereJsonContains('metadata->seeded', true)
                ->get() as $financialAccount) {
                $debitTotal = (float) DB::table('financial_transaction_entries as entries')
                    ->join('financial_transactions as transactions', 'transactions.id', '=', 'entries.financial_transaction_id')
                    ->where('transactions.organization_id', $organization->id)
                    ->where('transactions.status', 'POSTED')
                    ->where('entries.financial_account_id', $financialAccount->id)
                    ->where('entries.direction', 'DEBIT')
                    ->sum('entries.amount');
                $creditTotal = (float) DB::table('financial_transaction_entries as entries')
                    ->join('financial_transactions as transactions', 'transactions.id', '=', 'entries.financial_transaction_id')
                    ->where('transactions.organization_id', $organization->id)
                    ->where('transactions.status', 'POSTED')
                    ->where('entries.financial_account_id', $financialAccount->id)
                    ->where('entries.direction', 'CREDIT')
                    ->sum('entries.amount');
                $debitNormal = in_array($financialAccount->account_type, ['CASH', 'BANK', 'LOAN'], true);
                $netMovement = $debitNormal ? $debitTotal - $creditTotal : $creditTotal - $debitTotal;
                $runningBalance = (float) $financialAccount->balance - $netMovement;

                $entries = DB::table('financial_transaction_entries as entries')
                    ->join('financial_transactions as transactions', 'transactions.id', '=', 'entries.financial_transaction_id')
                    ->where('transactions.organization_id', $organization->id)
                    ->where('transactions.status', 'POSTED')
                    ->where('entries.financial_account_id', $financialAccount->id)
                    ->orderBy('transactions.transaction_date')
                    ->orderBy('transactions.id')
                    ->orderBy('entries.id')
                    ->get(['entries.id', 'entries.direction', 'entries.amount']);

                foreach ($entries as $entry) {
                    $increasesBalance = $entry->direction === ($debitNormal ? 'DEBIT' : 'CREDIT');
                    $runningBalance += $increasesBalance ? (float) $entry->amount : -(float) $entry->amount;
                    FinancialTransactionEntry::query()->whereKey($entry->id)->update(['balance_after' => $runningBalance]);
                }
            }

            $seederUserId = User::query()->where('email', 'super.admin@email.com')->firstOrFail()->id;
            $accountingService = app(FinancialTransactionAccountingService::class);
            FinancialTransaction::query()
                ->where('organization_id', $organization->id)
                ->where('status', 'POSTED')
                ->where(function ($query): void {
                    $query->where('transaction_no', 'like', 'FT-SEED-%')
                        ->orWhereIn('transaction_no', ['SAV-0001', 'FDR-0001']);
                })
                ->with('entries.financialAccount.product')
                ->get()
                ->each(fn(FinancialTransaction $transaction) => $accountingService->post($transaction, (int) $seederUserId));
        });
    }
}