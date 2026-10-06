<?php

namespace Database\Seeders;

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Application\LoanScheduleService;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialAccountAuthorizedPerson;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\FinancialProductAccountMapping;
use App\FinancialServices\Models\FinancialProductPolicy;
use App\FinancialServices\Models\FixedDeposit;
use App\FinancialServices\Models\LoanAccount;
use App\FinancialServices\Models\LoanApplication;
use App\FinancialServices\Models\RecurringDeposit;
use App\FinancialServices\Models\RecurringDepositInstallment;
use App\FinancialServices\Models\ShareAccount;
use App\GeneralAccounting\Models\LedgerAccount;
use App\SystemAdministration\Models\Organization;
use App\TreasuryAndCash\Models\Bank;
use App\TreasuryAndCash\Models\BankAccount;
use App\TreasuryAndCash\Models\Cheque;
use App\TreasuryAndCash\Models\ChequeBook;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class FinancialServicesSeeder extends Seeder
{
    private const ORGANIZATION_CODE = 'ORG-001';
    private const SEED_DATE = '2025-07-01';

    private const SAVINGS_OPENING_AMOUNT = 0;
    private const SHARE_OPENING_AMOUNT = 0;
    private const TELLER_OPENING_BALANCE = 0;

    public function run(): void
    {
        $organization = $this->getOrganization();
        $branchId = $this->getBranchId($organization);

        DB::transaction(function () use ($organization, $branchId): void {
            $this->createFinancialProducts($organization);

            $customers = $this->createCustomers($organization, $branchId);

            $this->createMultiProductAccounts(
                organization: $organization,
                branchId: $branchId,
                customer: $customers['jane_doe'],
            );

            $this->createOrganizationAccounts(
                organization: $organization,
                branchId: $branchId,
                organizationCustomer: $customers['organization_customer'],
                signatories: [$customers['john_doe'], $customers['jane_doe']],
            );

            $this->createLoan(
                organization: $organization,
                branchId: $branchId,
                customer: $customers['jane_doe'],
            );

            $this->createRecurringDeposit(
                organization: $organization,
                branchId: $branchId,
                customer: $customers['jane_doe'],
            );

            $this->createTellerCashAccount($organization, $branchId);
            $this->createJointSavingsAccount(
                organization: $organization,
                branchId: $branchId,
                primaryHolder: $customers['john_doe'],
                jointHolder: $customers['jane_doe'],
            );

            $this->createShareAccount(
                organization: $organization,
                branchId: $branchId,
                customer: $customers['jane_doe'],
            );
        });
    }

    private function getOrganization(): Organization
    {
        return Organization::query()
            ->where('code', self::ORGANIZATION_CODE)
            ->firstOrFail();
    }

    private function getBranchId(Organization $organization): int
    {
        return (int) $organization->branches()
            ->oldest('id')
            ->value('id');
    }

    /**
     * Create the products, terms, policies, and accounting mappings used by
     * the financial-services demo data.
     */
    private function createFinancialProducts(Organization $organization): void
    {
        $products = [
            [
                'code' => 'SAV-REG',
                'name' => 'Regular Savings',
                'category' => 'SAVINGS',
                'balance_type' => 'LIABILITY',
                'rate' => '3.000000',
                'calculation' => 'SIMPLE',
                'frequency' => 'MONTHLY',
                'minimum_opening' => 0,
            ],
            [
                'code' => 'SHR-MEM',
                'name' => 'Member Share Capital',
                'category' => 'SHARE',
                'balance_type' => 'EQUITY',
                'rate' => '0.000000',
                'calculation' => 'NONE',
                'frequency' => 'NONE',
                'minimum_opening' => 0,
            ],
            [
                'code' => 'FDR-12M',
                'name' => 'Twelve Month Fixed Deposit',
                'category' => 'FIXED_DEPOSIT',
                'balance_type' => 'LIABILITY',
                'rate' => '8.500000',
                'calculation' => 'COMPOUND',
                'frequency' => 'MATURITY',
                'minimum_opening' => 0,
            ],
            [
                'code' => 'RD-24M',
                'name' => 'Twenty Four Month Recurring Deposit',
                'category' => 'RECURRING_DEPOSIT',
                'balance_type' => 'LIABILITY',
                'rate' => '7.000000',
                'calculation' => 'COMPOUND',
                'frequency' => 'MONTHLY',
                'minimum_opening' => 0,
            ],
            [
                'code' => 'LN-GEN',
                'name' => 'General Loan',
                'category' => 'LOAN',
                'balance_type' => 'ASSET',
                'rate' => '12.000000',
                'calculation' => 'REDUCING_BALANCE',
                'frequency' => 'MONTHLY',
                'minimum_opening' => 0,
            ],
        ];

        foreach ($products as $productData) {
            $product = $this->createFinancialProduct($organization, $productData);

            $this->createProductTerm($product, $productData);
            $this->createProductPolicy($product, $productData);
            $this->createProductAccountMappings($organization, $product, $productData['category']);
        }
    }

    private function createFinancialProduct(Organization $organization, array $data): FinancialProduct
    {
        return FinancialProduct::query()->updateOrCreate(
            [
                'organization_id' => $organization->id,
                'code' => $data['code'],
            ],
            [
                'name' => $data['name'],
                'category' => $data['category'],
                'balance_type' => $data['balance_type'],
                'settings' => [
                    'credit_union' => true,
                    'requires_kyc' => true,
                    'minimum_opening_amount' => $data['minimum_opening'],
                    'joint_holders_allowed' => in_array(
                        $data['category'],
                        ['SAVINGS', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT'],
                        true,
                    ),
                ],
                'is_system' => true,
                'status' => true,
            ],
        );
    }

    private function createProductTerm(FinancialProduct $product, array $data): void
    {
        $termValue = match ($data['category']) {
            'FIXED_DEPOSIT' => 12,
            'RECURRING_DEPOSIT' => 24,
            'LOAN' => 12,
            default => 1,
        };

        DB::table('financial_product_terms')->updateOrInsert(
            [
                'financial_product_id' => $product->id,
                'code' => 'BASE',
            ],
            [
                'name' => 'Base term',
                'tenure_value' => $termValue,
                'tenure_unit' => 'MONTH',
                'interest_rate' => $data['rate'],
                'interest_calculation' => $data['calculation'],
                'interest_frequency' => $data['frequency'],
                'minimum_amount' => $data['minimum_opening'] ?: null,
                'maximum_amount' => null,
                'rules' => json_encode([]),
                'status' => true,
                'effective_from' => self::SEED_DATE,
                'updated_at' => now(),
                'created_at' => now(),
            ],
        );
    }

    private function createProductPolicy(FinancialProduct $product, array $data): void
    {
        $isLoan = $data['category'] === 'LOAN';

        FinancialProductPolicy::query()->updateOrCreate(
            ['financial_product_id' => $product->id],
            [
                'minimum_opening_amount' => $data['minimum_opening'],
                'minimum_deposit_amount' => $isLoan ? null : $data['minimum_opening'],
                'maximum_loan_amount' => $isLoan ? 0 : null,
                'loan_to_value_percent' => $isLoan ? 0 : null,
                'eligibility_rules' => [
                    'kyc_level' => $isLoan ? 'FULL' : 'BASIC',
                    'organization_customers_allowed' => true,
                ],
                'tenure_rules' => $isLoan
                    ? ['minimum_months' => 6, 'maximum_months' => 60]
                    : null,
                'repayment_rules' => $isLoan
                    ? [
                        'frequency' => 'MONTHLY',
                        'allocation' => ['FEE', 'INTEREST', 'PRINCIPAL'],
                    ]
                    : null,
                'status' => 'ACTIVE',
                'version' => '1.0',
                'effective_from' => self::SEED_DATE,
            ],
        );
    }

    private function createProductAccountMappings(
        Organization $organization,
        FinancialProduct $product,
        string $category,
    ): void {
        $liabilityAccount = match ($category) {
            'SAVINGS' => '2100',
            'FIXED_DEPOSIT' => '2200',
            'RECURRING_DEPOSIT' => '2300',
            'SHARE' => '3100',
            default => '1300',
        };

        $mappingPairs = $category === 'LOAN'
            ? [
                ['DISBURSEMENT', '1300', '1120'],
                ['REPAYMENT', '1120', '1300'],
                ['INTEREST', '1120', '4100'],
                ['FEE', '1120', '4200'],
            ]
            : [
                ['DEPOSIT', '1120', $liabilityAccount],
                ['WITHDRAWAL', $liabilityAccount, '1120'],
                ['INTEREST', '5200', $liabilityAccount],
                ['FEE', $liabilityAccount, '4200'],
                ['MIGRATION_OPENING_BALANCE', '1120', $liabilityAccount],
            ];

        foreach ($mappingPairs as [$transactionType, $debitCode, $creditCode]) {
            $debitAccount = LedgerAccount::query()
                ->where('organization_id', $organization->id)
                ->where('code', $debitCode)
                ->first();

            $creditAccount = LedgerAccount::query()
                ->where('organization_id', $organization->id)
                ->where('code', $creditCode)
                ->first();

            if (!$debitAccount || !$creditAccount) {
                continue;
            }

            FinancialProductAccountMapping::query()->updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'financial_product_id' => $product->id,
                    'source_type' => 'FINANCIAL_PRODUCT',
                    'source_code' => (string) $product->id,
                    'transaction_type' => $transactionType,
                ],
                [
                    'debit_account_id' => $debitAccount->id,
                    'credit_account_id' => $creditAccount->id,
                    'status' => true,
                ],
            );
        }
    }

    /**
     * Create the customers required by the demo workflows.
     *
     * No legacy customer/account migration data is created here.
     */
    private function createCustomers(Organization $organization, int $branchId): array
    {
        $customers = Customer::query()
            ->where('organization_id', $organization->id)
            ->where('type', 'INDIVIDUAL')
            ->orderBy('id')
            ->take(3)
            ->get();

        if ($customers->isEmpty()) {
            $customers = Customer::factory()
                ->count(3)
                ->create([
                    'organization_id' => $organization->id,
                    'type' => 'INDIVIDUAL',
                ]);
        }

        $janeDoe = $this->findOrCreateIndividualCustomer(
            organization: $organization,
            branchId: $branchId,
            name: 'Jane Doe',
            factory: 'individualFemale',
        );

        $johnDoe = $this->findOrCreateIndividualCustomer(
            organization: $organization,
            branchId: $branchId,
            name: 'John Doe',
            factory: 'individualMale',
        );

        $alexDoe = Customer::query()
            ->where('organization_id', $organization->id)
            ->where('name', 'Alex Doe')
            ->first();

        if (!$alexDoe) {
            $alexDoe = Customer::factory()->individualMale()->create([
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

        foreach ([$janeDoe, $johnDoe] as $customer) {
            if (!$customers->contains('id', $customer->id)) {
                $customers->push($customer);
            }
        }

        return [
            'customers' => $customers,
            'jane_doe' => $janeDoe,
            'john_doe' => $johnDoe,
            'alex_doe' => $alexDoe,
            'organization_customer' => $organizationCustomer,
        ];
    }

    private function findOrCreateIndividualCustomer(
        Organization $organization,
        int $branchId,
        string $name,
        string $factory,
    ): Customer {
        $customer = Customer::query()
            ->where('organization_id', $organization->id)
            ->where('name', $name)
            ->first();

        if ($customer) {
            return $customer;
        }

        return Customer::factory()->{$factory}()->create([
            'organization_id' => $organization->id,
            'branch_id' => $branchId,
            'name' => $name,
            'status' => 'ACTIVE',
        ]);
    }

    private function createMultiProductAccounts(
        Organization $organization,
        int $branchId,
        Customer $customer,
    ): void {
        $products = FinancialProduct::query()
            ->where('organization_id', $organization->id)
            ->orderBy('id')
            ->get();

        foreach ($products as $product) {
            if (in_array($product->category, ['LOAN', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT'], true)) {
                continue;
            }

            $accountNo = match ($product->category) {
                'SAVINGS' => 'SAV-ALL-' . $customer->id,
                'SHARE' => 'SHR-ALL-' . $customer->id,
                default => 'OTH-ALL-' . $customer->id,
            };

            $financialAccount = $this->createFinancialAccount(
                organization: $organization,
                branchId: $branchId,
                product: $product,
                accountNo: $accountNo,
                holder: $customer,
                name: $customer->name . ' - ' . $product->name,
                metadata: [
                    'seeded' => true,
                    'multi_product_customer' => true,
                ],
            );

            $this->ensurePrimaryHolder($financialAccount, $customer);

            if ($product->category === 'SAVINGS') {
                $this->createSavingsChequeBook($financialAccount, $organization, $branchId, $customer);
            }

            if ($product->category === 'SHARE') {
                $this->createShareDetails($financialAccount, $customer);
            }
        }
    }

    private function createFinancialAccount(
        Organization $organization,
        int $branchId,
        FinancialProduct $product,
        string $accountNo,
        Customer $holder,
        string $name,
        array $metadata = [],
    ): FinancialAccount {
        $balance = 0;

        return FinancialAccount::query()->updateOrCreate(
            [
                'organization_id' => $organization->id,
                'account_no' => $accountNo,
            ],
            [
                'branch_id' => $branchId,
                'financial_product_id' => $product->id,
                'holder_type' => Customer::class,
                'holder_id' => $holder->id,
                'name' => $name,
                'account_type' => $product->category,
                'status' => 'ACTIVE',
                'balance' => $balance,
                'available_balance' => $balance,
                'interest_accrued' => 0,
                'opened_at' => self::SEED_DATE,
                'metadata' => $metadata,
            ],
        );
    }

    private function ensurePrimaryHolder(FinancialAccount $financialAccount, Customer $customer): void
    {
        if (!$financialAccount->holders()->where('customers.id', $customer->id)->exists()) {
            $financialAccount->addHolder($customer, 'PRIMARY');
        }
    }

    private function createShareDetails(FinancialAccount $financialAccount, Customer $customer): void
    {
        ShareAccount::query()->firstOrCreate(
            ['financial_account_id' => $financialAccount->id],
            [
                'member_since' => now()->subMonths(3)->toDateString(),
                'membership_no' => 'SEED-MEM-' . $customer->id,
                'membership_status' => 'ACTIVE',
            ],
        );
    }

    private function createSavingsChequeBook(
        FinancialAccount $financialAccount,
        Organization $organization,
        int $branchId,
        Customer $customer,
    ): void {
        $hasBookFinancialAccount = Schema::hasColumn('cheque_books', 'financial_account_id');
        $hasChequeFinancialAccount = Schema::hasColumn('cheques', 'financial_account_id');
        $hasBankAccountColumn = Schema::hasColumn('cheque_books', 'bank_account_id');

        $bank = Bank::query()->firstOrCreate(
            [
                'organization_id' => $organization->id,
                'code' => 'BANK-CORE',
            ],
            [
                'name' => 'Core Bank',
                'short_name' => 'CORE',
                'status' => true,
            ],
        );

        $bankAccount = BankAccount::query()->firstOrCreate(
            [
                'organization_id' => $organization->id,
                'account_number' => 'BANK-CORE-001',
            ],
            [
                'branch_id' => $branchId,
                'bank_id' => $bank->id,
                'financial_account_id' => $financialAccount->id,
                'account_name' => $financialAccount->name . ' Cheque Account',
                'routing_number' => '0001',
                'account_type' => 'SAVINGS',
                'opening_balance' => 0,
                'is_reconcilable' => true,
                'status' => 'ACTIVE',
            ],
        );

        $bookNo = 'SAV-CHECKBOOK-' . $financialAccount->id;

        $bookQuery = $hasBookFinancialAccount
            ? [
                'financial_account_id' => $financialAccount->id,
                'book_no' => $bookNo,
            ]
            : ['book_no' => $bookNo];

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
            $bookData['financial_account_id'] = $financialAccount->id;
        }

        $book = ChequeBook::query()->firstOrCreate($bookQuery, $bookData);

        if ($book->cheques()->exists()) {
            return;
        }

        foreach (range(1001, 1015) as $number) {
            $status = $number <= 1004 ? 'ISSUED' : 'UNUSED';
            $amount = $number <= 1003
                ? [2500, 3750, 5000][$number - 1001] ?? 2000
                : null;

            $chequeData = [
                'cheque_book_id' => $book->id,
                'cheque_no' => 'SAV-' . $number,
                'status' => $status,
                'issue_date' => now()->toDateString(),
                'cheque_date' => now()->toDateString(),
                'amount' => $amount,
                'payee' => $status === 'ISSUED' ? $customer->name : null,
                'memo' => 'Seeded savings cheque book',
            ];

            if ($hasChequeFinancialAccount) {
                $chequeData['financial_account_id'] = $financialAccount->id;
            }

            Cheque::query()->create($chequeData);
        }
    }

    private function createOrganizationAccounts(
        Organization $organization,
        int $branchId,
        Customer $organizationCustomer,
        array $signatories,
    ): void {
        foreach (['SAVINGS', 'FIXED_DEPOSIT'] as $category) {
            $product = FinancialProduct::query()
                ->where('organization_id', $organization->id)
                ->where('category', $category)
                ->orderBy('code')
                ->firstOrFail();

            $accountNo = $category === 'SAVINGS'
                ? 'SAV-CORP-' . $organizationCustomer->id
                : 'FDR-CORP-' . $organizationCustomer->id;

            $financialAccount = FinancialAccount::query()->updateOrCreate(
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
                    'balance' => 0,
                    'available_balance' => $category === 'SAVINGS' ? 0 : 0,
                    'opened_at' => self::SEED_DATE,
                    'metadata' => [
                        'seeded' => true,
                        'organization_customer' => true,
                    ],
                ],
            );

            $this->ensurePrimaryHolder($financialAccount, $organizationCustomer);
            $this->createAuthorizedSignatories($financialAccount, $signatories);

            if ($category === 'FIXED_DEPOSIT') {
                $this->createOrganizationFixedDeposit($financialAccount, $product);
            }
        }
    }

    private function createAuthorizedSignatories(
        FinancialAccount $financialAccount,
        array $signatories,
    ): void {
        foreach ($signatories as $signatory) {
            FinancialAccountAuthorizedPerson::query()->updateOrCreate(
                [
                    'financial_account_id' => $financialAccount->id,
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
    }

    private function createOrganizationFixedDeposit(
        FinancialAccount $financialAccount,
        FinancialProduct $product,
    ): void {
        $rate = $this->getProductRate($product);

        FixedDeposit::query()->updateOrCreate(
            ['financial_account_id' => $financialAccount->id],
            [
                'principal_amount' => 0,
                'contractual_rate' => $rate,
                'term_value' => 12,
                'term_unit' => 'MONTH',
                'started_at' => self::SEED_DATE,
                'maturity_date' => '2026-07-01',
                'maturity_amount' => 0,
                'maturity_instruction' => 'RENEW_PRINCIPAL',
            ],
        );
    }

    private function createLoan(
        Organization $organization,
        int $branchId,
        Customer $customer,
    ): void {
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
                'customer_id' => $customer->id,
                'financial_product_id' => $loanProduct->id,
                'requested_amount' => 50000,
                'approved_amount' => 50000,
                'requested_term_months' => 24,
                'purpose' => 'Seeded general loan for financial services workflows',
                'status' => 'APPROVED',
                'applied_at' => '2025-06-01',
                'approved_at' => self::SEED_DATE,
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
                'holder_id' => $customer->id,
                'name' => $customer->name . ' General Loan',
                'account_type' => 'LOAN',
                'status' => 'ACTIVE',
                'balance' => 0,
                'available_balance' => 0,
                'opened_at' => self::SEED_DATE,
                'metadata' => ['seeded' => true],
            ],
        );

        $loanAccount = LoanAccount::query()->updateOrCreate(
            ['loan_no' => 'LN-SEED-0001'],
            [
                'financial_account_id' => $loanFinancialAccount->id,
                'loan_application_id' => $loanApplication->id,
                'principal_amount' => 0,
                'disbursed_amount' => 0,
                'contractual_rate' => $this->getProductRate($loanProduct),
                'interest_calculation' => 'REDUCING_BALANCE',
                'interest_frequency' => 'MONTHLY',
                'term_value' => 24,
                'term_unit' => 'MONTH',
                'repayment_frequency' => 'MONTHLY',
                'grace_days' => 0,
                'late_payment_fine_rate' => 0,
                'approved_at' => self::SEED_DATE,
                'disbursed_at' => self::SEED_DATE,
                'maturity_date' => '2027-07-01',
                'status' => 'ACTIVE',
            ],
        );

        app(LoanScheduleService::class)->generate($loanAccount, [
            'frequency' => 'MONTHLY',
            'term_months' => 24,
            'start_date' => self::SEED_DATE,
        ]);
    }

    private function createRecurringDeposit(
        Organization $organization,
        int $branchId,
        Customer $customer,
    ): void {
        $product = FinancialProduct::query()
            ->where('organization_id', $organization->id)
            ->where('code', 'RD-24M')
            ->firstOrFail();

        $financialAccount = FinancialAccount::query()->updateOrCreate(
            [
                'organization_id' => $organization->id,
                'account_no' => 'RD-SEED-0001',
            ],
            [
                'branch_id' => $branchId,
                'financial_product_id' => $product->id,
                'holder_type' => Customer::class,
                'holder_id' => $customer->id,
                'name' => $customer->name . ' Recurring Deposit',
                'account_type' => 'RECURRING_DEPOSIT',
                'status' => 'ACTIVE',
                'balance' => 0,
                'available_balance' => 0,
                'opened_at' => self::SEED_DATE,
                'metadata' => ['seeded' => true],
            ],
        );

        $recurringDeposit = RecurringDeposit::query()->updateOrCreate(
            ['financial_account_id' => $financialAccount->id],
            [
                'installment_amount' => 5000,
                'installment_frequency' => 'MONTHLY',
                'total_installments' => 24,
                'paid_installments' => 0,
                'started_at' => self::SEED_DATE,
                'maturity_date' => '2027-07-01',
                'maturity_extension_days' => 0,
                'grace_days' => 7,
            ],
        );

        foreach (range(1, 24) as $installmentNo) {
            $installmentDate = now()
                ->setDate(2025, 7, 1)
                ->addMonths($installmentNo - 1);

            RecurringDepositInstallment::query()->updateOrCreate(
                [
                    'recurring_deposit_id' => $recurringDeposit->id,
                    'installment_no' => $installmentNo,
                ],
                [
                    'due_date' => $installmentDate->toDateString(),
                    'amount_due' => 5000,
                    'amount_paid' => 0,
                    'fine_amount' => 0,
                    'status' => 'PENDING',
                    'paid_at' => null,
                ],
            );
        }
    }

    private function createTellerCashAccount(Organization $organization, int $branchId): void
    {
        FinancialAccount::query()->updateOrCreate(
            [
                'organization_id' => $organization->id,
                'account_no' => 'CASH-TELLER-001',
            ],
            [
                'branch_id' => $branchId,
                'financial_product_id' => null,
                'name' => 'Main Teller Cash Account',
                'account_type' => 'CASH',
                'status' => 'ACTIVE',
                'balance' => self::TELLER_OPENING_BALANCE,
                'available_balance' => self::TELLER_OPENING_BALANCE,
                'opened_at' => self::SEED_DATE,
                'metadata' => [
                    'seeded' => true,
                    'cash_location' => 'Main Teller',
                ],
            ],
        );
    }

    private function createJointSavingsAccount(
        Organization $organization,
        int $branchId,
        Customer $primaryHolder,
        Customer $jointHolder,
    ): void {
        $product = FinancialProduct::query()
            ->where('organization_id', $organization->id)
            ->where('code', 'SAV-REG')
            ->firstOrFail();

        $financialAccount = FinancialAccount::query()->updateOrCreate(
            [
                'organization_id' => $organization->id,
                'account_no' => sprintf(
                    'SAV-JOINT-%06d-%06d',
                    $primaryHolder->id,
                    $jointHolder->id,
                ),
            ],
            [
                'branch_id' => $branchId,
                'financial_product_id' => $product->id,
                'holder_type' => Customer::class,
                'holder_id' => $primaryHolder->id,
                'name' => $primaryHolder->name . ' and ' . $jointHolder->name . ' - Joint Savings',
                'account_type' => 'SAVINGS',
                'status' => 'ACTIVE',
                'balance' => 0,
                'available_balance' => 0,
                'interest_accrued' => 0,
                'opened_at' => now()->toDateString(),
                'metadata' => [
                    'seeded' => true,
                    'joint_account' => true,
                ],
            ],
        );

        $financialAccount->addHolder($primaryHolder, 'PRIMARY', null, 50);
        $financialAccount->addHolder($jointHolder, 'JOINT', null, 50);
    }

    private function createShareAccount(
        Organization $organization,
        int $branchId,
        Customer $customer,
    ): void {
        $product = FinancialProduct::query()
            ->where('organization_id', $organization->id)
            ->where('category', 'SHARE')
            ->firstOrFail();

        $financialAccount = FinancialAccount::query()->updateOrCreate(
            [
                'organization_id' => $organization->id,
                'account_no' => sprintf('SHR-%06d', $customer->id),
            ],
            [
                'branch_id' => $branchId,
                'financial_product_id' => $product->id,
                'holder_type' => Customer::class,
                'holder_id' => $customer->id,
                'name' => $customer->name,
                'account_type' => 'SHARE',
                'status' => 'ACTIVE',
                'balance' => self::SHARE_OPENING_AMOUNT,
                'available_balance' => self::SHARE_OPENING_AMOUNT,
                'opened_at' => '2025-07-05',
                'metadata' => ['seeded' => true],
            ],
        );

        $financialAccount->update([
            'balance' => self::SHARE_OPENING_AMOUNT,
            'available_balance' => self::SHARE_OPENING_AMOUNT,
        ]);

        $this->ensurePrimaryHolder($financialAccount, $customer);

        ShareAccount::query()->updateOrCreate(
            ['financial_account_id' => $financialAccount->id],
            [
                'member_since' => '2025-07-05',
                'membership_no' => sprintf('MEM-%05d', $customer->id),
                'membership_status' => 'ACTIVE',
            ],
        );
    }

    private function getProductRate(FinancialProduct $product): float
    {
        return (float) DB::table('financial_product_terms')
            ->where('financial_product_id', $product->id)
            ->where('code', 'BASE')
            ->value('interest_rate');
    }
}
