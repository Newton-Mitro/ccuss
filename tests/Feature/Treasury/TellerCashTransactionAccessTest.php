<?php

use App\CustomerModule\Models\Customer;
use App\CustomerModule\Models\KycDocument;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\LoanAccount;
use App\FinancialServices\Models\LoanProtectionPolicy;
use App\FinancialServices\Models\LoanSchedule;
use App\FinancialServices\Models\LoanScheduleComponent;
use App\FinancialServices\Models\RecurringDeposit;
use App\FinancialServices\Models\RecurringDepositInstallment;
use App\GeneralAccounting\Models\AccountGroup;
use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\FiscalYear;
use App\GeneralAccounting\Models\LedgerAccount;
use App\GeneralAccounting\Models\TreasuryGlMapping;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Models\Cheque;
use App\TreasuryAndCash\Models\ChequeBook;
use App\TreasuryAndCash\Models\ChequePayment;
use App\TreasuryAndCash\Application\ChequePaymentService;
use App\TreasuryAndCash\Models\Teller;
use App\TreasuryAndCash\Models\TellerCashTransaction;
use App\TreasuryAndCash\Models\TellerSession;
use Illuminate\Validation\ValidationException;

function grantTellerCashTransactionPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'teller_cash_transaction_test'],
        ['name' => 'Teller Cash Transaction Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'cash_transactions.create'],
        [
            'module' => 'cash_transactions',
            'name' => 'Create Cash Transactions',
            'action' => 'create',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $receivePermission = Permission::firstOrCreate(
        ['slug' => 'cheque_payments.receive'],
        [
            'module' => 'cheque_payments',
            'name' => 'Receive Cheques for Payment',
            'action' => 'receive',
        ],
    );
    $role->permissions()->syncWithoutDetaching([$receivePermission->id]);
    $viewPermission = Permission::firstOrCreate(
        ['slug' => 'cheque_payments.view'],
        [
            'module' => 'cheque_payments',
            'name' => 'View Cheque Payments',
            'action' => 'view',
        ],
    );
    $role->permissions()->syncWithoutDetaching([$viewPermission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function grantBranchOperationsDashboardPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'branch_operations_dashboard_test'],
        ['name' => 'Branch Operations Dashboard Test'],
    );
    $permission = Permission::firstOrCreate(
        ['slug' => 'treasury.view'],
        [
            'module' => 'treasury',
            'name' => 'View Treasury',
            'action' => 'view',
        ],
    );
    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function grantTellerCashTransactionPostPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'teller_cash_transaction_post_test'],
        ['name' => 'Teller Cash Transaction Post Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'cash_transactions.post'],
        [
            'module' => 'cash_transactions',
            'name' => 'Post Cash Transactions',
            'action' => 'post',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function grantTellerCashTransactionViewPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'teller_cash_transaction_view_test'],
        ['name' => 'Teller Cash Transaction View Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'cash_transactions.view'],
        [
            'module' => 'cash_transactions',
            'name' => 'View Cash Transactions',
            'action' => 'view',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function grantTellerCashTransactionUpdatePermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'teller_cash_transaction_update_test'],
        ['name' => 'Teller Cash Transaction Update Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'cash_transactions.update'],
        [
            'module' => 'cash_transactions',
            'name' => 'Update Cash Transactions',
            'action' => 'update',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function grantTellerCashTransactionCancelPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'teller_cash_transaction_cancel_test'],
        ['name' => 'Teller Cash Transaction Cancel Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'cash_transactions.cancel'],
        [
            'module' => 'cash_transactions',
            'name' => 'Cancel Cash Transactions',
            'action' => 'cancel',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function grantTellerCashTransactionReversePermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'teller_cash_transaction_reverse_test'],
        ['name' => 'Teller Cash Transaction Reverse Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'cash_transactions.reverse'],
        [
            'module' => 'cash_transactions',
            'name' => 'Reverse Cash Transactions',
            'action' => 'reverse',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function tellerCashTransactionFixture(): array
{
    $organization = Organization::factory()->create(['code' => 'ORG-001']);
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    $fiscalYear = FiscalYear::factory()->create([
        'organization_id' => $organization->id,
        'start_date' => '2026-01-01',
        'end_date' => '2026-12-31',
        'status' => 'OPEN',
    ]);
    FiscalPeriod::factory()->create([
        'fiscal_year_id' => $fiscalYear->id,
        'start_date' => '2026-01-01',
        'end_date' => '2026-12-31',
        'status' => 'OPEN',
    ]);
    $branchDay = BranchDay::create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'business_date' => '2026-09-18',
        'status' => 'OPEN',
        'opened_at' => now(),
        'opened_by' => $user->id,
    ]);
    $location = CashLocation::create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'code' => 'TRANSACTION-TELLER',
        'name' => 'Transaction Teller Location',
        'type' => 'TELLER',
        'is_active' => true,
    ]);
    $teller = Teller::create([
        'cash_location_id' => $location->id,
        'user_id' => $user->id,
        'code' => 'TXN-001',
        'name' => 'Transaction Teller',
        'status' => 'ACTIVE',
        'maximum_cash' => 25000,
    ]);
    $session = TellerSession::create([
        'branch_day_id' => $branchDay->id,
        'teller_id' => $teller->id,
        'opened_by' => $user->id,
        'status' => 'OPEN',
        'opening_cash' => 5000,
        'opened_at' => now(),
    ]);

    return compact('organization', 'branch', 'user', 'branchDay', 'location', 'teller', 'session');
}

it('loads the branch operations dashboard scoped to the assigned branch', function () {
    $fixture = tellerCashTransactionFixture();
    grantBranchOperationsDashboardPermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('branch-operations.dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('branch-operations/dashboard')
            ->where('branch.id', $fixture['branch']->id)
            ->where('branch_day.id', $fixture['branchDay']->id)
            ->where('metrics.assigned_tellers', 1)
            ->where('metrics.open_sessions', 1)
            ->where('metrics.pending_transactions', 0));
});

function configureTellerSummaryMapping(array $fixture, string $transactionType): void
{
    $group = AccountGroup::factory()->create(['organization_id' => $fixture['organization']->id]);
    $debitAccount = LedgerAccount::factory()->create([
        'organization_id' => $fixture['organization']->id,
        'account_group_id' => $group->id,
    ]);
    $creditAccount = LedgerAccount::factory()->create([
        'organization_id' => $fixture['organization']->id,
        'account_group_id' => $group->id,
    ]);

    TreasuryGlMapping::query()->create([
        'organization_id' => $fixture['organization']->id,
        'source_type' => 'CASH_LOCATION',
        'source_code' => 'TELLER',
        'transaction_type' => $transactionType,
        'debit_account_id' => $debitAccount->id,
        'credit_account_id' => $creditAccount->id,
        'status' => true,
    ]);
}

it('loads deposit and withdrawal forms with scoped teller sessions', function () {
    $fixture = tellerCashTransactionFixture();
    grantTellerCashTransactionPermission($fixture['user']);

    foreach (['deposit', 'withdrawal'] as $type) {
        $this->actingAs($fixture['user'])
            ->withSession(['active_organization_id' => $fixture['organization']->id])
            ->get(route('teller-transactions.' . $type))
            ->assertSuccessful()
            ->assertInertia(fn($page) => $page
                ->component('treasury-cash/teller-transactions/form')
                ->where('transaction_type', strtoupper($type))
                ->has('teller_sessions', 1));
    }
});

it('loads the teller transaction queue for users with view permission', function () {
    $fixture = tellerCashTransactionFixture();
    grantTellerCashTransactionViewPermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('teller-transactions.index'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/teller-transactions/index')
            ->has('transactions.data', 0));
});

it('loads the customer deposit page without a selected customer', function () {
    $fixture = tellerCashTransactionFixture();
    grantTellerCashTransactionPermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('teller-transactions.customer-deposit'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/teller-deposits/customer-deposit-page')
            ->where('customer', null)
            ->where('customerAccounts', []));
});

it('loads the customer deposit page with open teller sessions available', function () {
    $fixture = tellerCashTransactionFixture();
    grantTellerCashTransactionPermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('teller-transactions.customer-deposit'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/teller-deposits/customer-deposit-page')
            ->has('teller_sessions', 1)
            ->where('teller_sessions.0.id', $fixture['session']->id));
});

it('searches customer deposit accounts by account and holder details', function () {
    $fixture = tellerCashTransactionFixture();
    grantTellerCashTransactionPermission($fixture['user']);
    $customer = Customer::factory()->individualFemale()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'customer_no' => 'IND-ACCOUNT-SEARCH-001',
        'name' => 'Amina Account Holder',
    ]);
    $account = FinancialAccount::factory()->active(500)->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'holder_type' => Customer::class,
        'holder_id' => $customer->id,
        'account_type' => 'SAVINGS',
        'account_no' => 'SAV-ACCOUNT-SEARCH-001',
        'name' => 'Holiday Savings Reserve',
    ]);
    $loanCustomer = Customer::factory()->individualMale()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'customer_no' => 'IND-LOAN-ACCOUNT-SEARCH-001',
        'name' => 'Loan Account Search Holder',
    ]);
    $loanAccount = FinancialAccount::factory()->active(500)->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'holder_type' => Customer::class,
        'holder_id' => $loanCustomer->id,
        'account_type' => 'LOAN',
        'account_no' => 'LOAN-ACCOUNT-SEARCH-001',
        'name' => 'Loan Account Search',
    ]);

    foreach ([
        $account->account_no,
        $account->name,
        $customer->customer_no,
        $customer->name,
    ] as $term) {
        $this->actingAs($fixture['user'])
            ->withSession(['active_organization_id' => $fixture['organization']->id])
            ->getJson(route('teller-transactions.deposit.accounts.search', ['search' => $term]))
            ->assertSuccessful()
            ->assertJsonFragment([
                'id' => $account->id,
                'account_no' => $account->account_no,
            ]);
    }

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->getJson(route('teller-transactions.deposit.accounts.search', [
            'search' => $loanCustomer->name,
            'scope' => 'deposit',
        ]))
        ->assertSuccessful()
        ->assertJsonMissing(['id' => $loanAccount->id])
        ->assertJsonCount(0);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->getJson(route('teller-transactions.deposit.accounts.search', [
            'search' => $loanCustomer->name,
            'scope' => 'loan',
        ]))
        ->assertSuccessful()
        ->assertJsonFragment(['id' => $loanAccount->id])
        ->assertJsonCount(1);
});

it('restores the selected customer account on the customer deposit page', function () {
    $fixture = tellerCashTransactionFixture();
    grantTellerCashTransactionPermission($fixture['user']);
    $customer = Customer::factory()->individualMale()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
    ]);
    $account = FinancialAccount::factory()->active(500)->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'holder_type' => Customer::class,
        'holder_id' => $customer->id,
        'account_type' => 'SAVINGS',
        'account_no' => 'SAV-RESTORE-001',
        'name' => 'Customer Deposit Account',
    ]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('teller-transactions.customer-deposit', [
            'customer_id' => $customer->id,
            'account_id' => $account->id,
        ]))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->where('customer.id', $customer->id)
            ->where('selectedAccount.id', $account->id)
            ->where('obligations.0.account_name', $account->name)
            ->where('obligations.0.account_no', $account->account_no));
});

it('lists real customer loan, protection, deposit, and fine obligations', function () {
    $fixture = tellerCashTransactionFixture();
    grantTellerCashTransactionPermission($fixture['user']);
    $customer = Customer::factory()->individualMale()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
    ]);
    $loanAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'holder_type' => Customer::class,
        'holder_id' => $customer->id,
        'account_type' => 'LOAN',
        'account_no' => 'LOAN-OBLIGATION-001',
        'name' => 'Loan Obligation Account',
    ]);
    $loan = LoanAccount::create([
        'financial_account_id' => $loanAccount->id,
        'loan_no' => 'LOAN-OBLIGATION-001',
        'principal_amount' => 1000,
        'contractual_rate' => 0.12,
        'interest_calculation' => 'SIMPLE',
        'interest_frequency' => 'MONTHLY',
        'term_value' => 12,
        'term_unit' => 'MONTH',
        'status' => 'ACTIVE',
    ]);
    $schedule = LoanSchedule::create([
        'loan_account_id' => $loan->id,
        'schedule_version' => 1,
        'installment_no' => 1,
        'due_date' => now()->toDateString(),
        'opening_principal' => 1000,
        'scheduled_principal' => 100,
        'scheduled_interest' => 20,
        'scheduled_fee' => 10,
        'scheduled_protection_fee' => 5,
        'total_due' => 135,
        'total_paid' => 0,
        'status' => 'OVERDUE',
    ]);
    LoanScheduleComponent::create([
        'loan_schedule_id' => $schedule->id,
        'type' => 'PRINCIPAL',
        'amount_due' => 100,
        'amount_paid' => 0,
        'status' => 'PENDING',
    ]);
    LoanScheduleComponent::create([
        'loan_schedule_id' => $schedule->id,
        'type' => 'INTEREST',
        'amount_due' => 20,
        'amount_paid' => 0,
        'status' => 'PENDING',
    ]);
    LoanScheduleComponent::create([
        'loan_schedule_id' => $schedule->id,
        'type' => 'FEE',
        'amount_due' => 10,
        'amount_paid' => 0,
        'status' => 'PENDING',
    ]);
    LoanScheduleComponent::create([
        'loan_schedule_id' => $schedule->id,
        'type' => 'PROTECTION_FEE',
        'amount_due' => 5,
        'amount_paid' => 0,
        'status' => 'PENDING',
    ]);
    LoanProtectionPolicy::create([
        'loan_account_id' => $loan->id,
        'required' => true,
        'initial_fee' => 0,
        'renewal_fee' => 50,
        'renewal_frequency' => 'MONTHLY',
        'next_renewal_at' => now()->toDateString(),
        'status' => 'ACTIVE',
    ]);
    $depositAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'holder_type' => Customer::class,
        'holder_id' => $customer->id,
        'account_type' => 'RECURRING_DEPOSIT',
        'account_no' => 'DEPOSIT-OBLIGATION-001',
        'name' => 'Deposit Obligation Account',
    ]);
    $recurringDeposit = RecurringDeposit::create([
        'financial_account_id' => $depositAccount->id,
        'installment_amount' => 100,
        'installment_frequency' => 'MONTHLY',
        'total_installments' => 1,
        'paid_installments' => 0,
        'started_at' => now()->subMonth()->toDateString(),
        'maturity_date' => now()->addMonth()->toDateString(),
    ]);
    RecurringDepositInstallment::create([
        'recurring_deposit_id' => $recurringDeposit->id,
        'installment_no' => 1,
        'due_date' => now()->subMonth()->toDateString(),
        'amount_due' => 100,
        'amount_paid' => 0,
        'fine_amount' => 25,
        'status' => 'MISSED',
    ]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('teller-transactions.customer-deposit', [
            'customer_id' => $customer->id,
            'account_id' => $loanAccount->id,
        ]))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->where('obligations', fn($obligations) => collect($obligations)->contains(fn($row) => $row['due_type'] === 'Loan repayment' && $row['amount'] === 100)
                && collect($obligations)->contains(fn($row) => $row['due_type'] === 'Loan interest' && $row['amount'] === 20)
                && collect($obligations)->contains(fn($row) => $row['due_type'] === 'Loan fine' && $row['amount'] === 10)
                && collect($obligations)->contains(fn($row) => $row['due_type'] === 'Loan protection fee' && $row['amount'] === 5)
                && collect($obligations)->contains(fn($row) => $row['due_type'] === 'Loan protection renew fee' && $row['amount'] === 50)
                && collect($obligations)->contains(fn($row) => $row['due_type'] === 'Deposit contribution' && $row['amount'] === 100)
                && collect($obligations)->contains(fn($row) => $row['due_type'] === 'Deposit fine' && $row['amount'] === 25)));
});

it('creates a pending teller cash deposit for an open session', function () {
    $fixture = tellerCashTransactionFixture();
    grantTellerCashTransactionPermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('teller-transactions.deposit.store'), [
            'teller_session_id' => $fixture['session']->id,
            'amount' => 300,
            'reference' => 'DEP-001',
            'note' => 'Customer cash deposit',
        ])
        ->assertRedirect(route('teller-transactions.deposit'));

    $transaction = TellerCashTransaction::query()->firstOrFail();

    expect($transaction->teller_session_id)->toBe($fixture['session']->id)
        ->and($transaction->cash_location_id)->toBe($fixture['location']->id)
        ->and($transaction->type)->toBe('DEPOSIT')
        ->and($transaction->status)->toBe('PENDING')
        ->and($transaction->amount)->toBe('300.0000')
        ->and($transaction->requested_by)->toBe($fixture['user']->id);
});

it('allows a customer deposit without a verified signature', function () {
    $fixture = tellerCashTransactionFixture();
    grantTellerCashTransactionPermission($fixture['user']);

    $customer = Customer::factory()->individualMale()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
    ]);
    $cashAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'financial_product_id' => null,
        'account_type' => 'CASH',
        'account_no' => 'CASH-TELLER-002',
    ]);
    $savingsAccount = FinancialAccount::factory()->active(1000)->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'financial_product_id' => null,
        'holder_type' => Customer::class,
        'holder_id' => $customer->id,
        'account_type' => 'SAVINGS',
        'account_no' => 'SAVINGS-CUST-002',
    ]);
    $fixture['location']->update(['financial_account_id' => $cashAccount->id]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('teller-transactions.customer-deposit.store'), [
            'teller_session_id' => $fixture['session']->id,
            'customer_id' => $customer->id,
            'amount' => '10.00',
            'selected' => ['deposit-' . $savingsAccount->id],
            'note' => 'Customer cash deposit',
        ])
        ->assertRedirect(route('teller-transactions.customer-deposit', ['customer_id' => $customer->id]));
});

it('receives a savings cheque into review without posting it', function () {
    $fixture = tellerCashTransactionFixture();
    grantTellerCashTransactionPermission($fixture['user']);

    $customer = Customer::factory()->individualMale()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
    ]);
    $account = FinancialAccount::factory()->active(500)->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'holder_type' => Customer::class,
        'holder_id' => $customer->id,
        'account_type' => 'SAVINGS',
        'account_no' => 'SAVINGS-CHEQUE-001',
    ]);
    $book = ChequeBook::create([
        'financial_account_id' => $account->id,
        'book_no' => 'SAVINGS-CHEQUE-BOOK-001',
        'prefix' => 'CHQ',
        'start_number' => 1,
        'end_number' => 1,
        'current_number' => 1,
        'leaf_count' => 1,
        'issued_date' => now()->toDateString(),
        'status' => 'IN_USE',
    ]);
    $cheque = Cheque::create([
        'cheque_book_id' => $book->id,
        'financial_account_id' => $account->id,
        'cheque_no' => 'CHQ-001',
        'status' => 'ISSUED',
        'amount' => 100,
        'issue_date' => now()->toDateString(),
    ]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('cheque-payments.index'))
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/cheques/payments/index')
            ->where('available_cheques.0.id', $cheque->id)
            ->where('teller_sessions.0.id', $fixture['session']->id));

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('cheque-payments.receive'), [
            'teller_session_id' => $fixture['session']->id,
            'cheque_id' => $cheque->id,
        ])
        ->assertSessionHasNoErrors();

    $payment = ChequePayment::query()->where('cheque_id', $cheque->id)->firstOrFail();
    expect($payment->status)->toBe('RECEIVED')
        ->and($cheque->fresh()->status)->toBe('ISSUED')
        ->and(TellerCashTransaction::query()->where('reference', 'CHEQUE-' . $cheque->cheque_no)->exists())->toBeFalse();

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('cheque-payments.index'))
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/cheques/payments/index')
            ->where('payments.data.0.status', 'RECEIVED'));

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('cheque-payments.show', $payment))
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/cheques/payments/show')
            ->where('payment.status', 'RECEIVED')
            ->where('account_check.status', 'ACTIVE'));

    $stoppedCheque = Cheque::create([
        'cheque_book_id' => $book->id,
        'financial_account_id' => $account->id,
        'cheque_no' => 'CHQ-STOPPED',
        'status' => 'STOPPED',
        'amount' => 100,
    ]);
    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('cheque-payments.receive'), [
            'teller_session_id' => $fixture['session']->id,
            'cheque_id' => $stoppedCheque->id,
        ])
        ->assertSessionHasErrors(['cheque_id']);
});

it('requires a verified signatory and a separate approver before payment', function () {
    $fixture = tellerCashTransactionFixture();
    $customer = Customer::factory()->individualMale()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
    ]);
    KycDocument::factory()->for($customer)->signature()->verified()->create();
    $account = FinancialAccount::factory()->active(500)->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'holder_type' => Customer::class,
        'holder_id' => $customer->id,
        'account_type' => 'SAVINGS',
    ]);
    $book = ChequeBook::create([
        'financial_account_id' => $account->id,
        'book_no' => 'PAYMENT-BOOK-' . $account->id,
        'start_number' => 1,
        'end_number' => 1,
        'current_number' => 1,
        'leaf_count' => 1,
        'status' => 'IN_USE',
    ]);
    $cheque = Cheque::create([
        'cheque_book_id' => $book->id,
        'financial_account_id' => $account->id,
        'cheque_no' => 'PAYMENT-' . $account->id,
        'status' => 'ISSUED',
        'amount' => 100,
    ]);
    $service = app(ChequePaymentService::class);
    $payment = $service->receive(
        $cheque,
        $fixture['session']->id,
        $fixture['organization']->id,
        $fixture['branch']->id,
        $fixture['user']->id,
    );

    $viewer = Customer::factory()->individualMale()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
    ]);
    $account->authorizedPersons()->create([
        'customer_id' => $viewer->id,
        'authorization_type' => 'VIEWER',
        'is_active' => true,
    ]);
    expect(fn() => $service->verify($payment, $viewer->id, true, true, $fixture['organization']->id, $fixture['user']->id))
        ->toThrow(ValidationException::class);

    $payment = $service->verify($payment, $customer->id, true, true, $fixture['organization']->id, $fixture['user']->id);
    expect($payment->status)->toBe('PENDING_APPROVAL')
        ->and($payment->checks['balance_sufficient'])->toBeTrue()
        ->and($payment->checks['stop_payment_clear'])->toBeTrue();

    expect(fn() => $service->approve($payment, $fixture['organization']->id, $fixture['user']->id))
        ->toThrow(ValidationException::class);

    $approver = User::factory()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
    ]);
    $payment = $service->approve($payment, $fixture['organization']->id, $approver->id);
    expect($payment->status)->toBe('APPROVED');

    expect(fn() => $service->pay($payment, $fixture['organization']->id, $fixture['branch']->id, $approver->id))
        ->toThrow(ValidationException::class);
    expect($payment->fresh()->status)->toBe('APPROVED')
        ->and($cheque->fresh()->status)->toBe('ISSUED');
});

it('creates a pending customer deposit from selected obligations', function () {
    $fixture = tellerCashTransactionFixture();
    grantTellerCashTransactionPermission($fixture['user']);

    $customer = Customer::factory()->individualMale()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
    ]);
    KycDocument::factory()->for($customer)->signature()->verified()->create();
    $cashAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'financial_product_id' => null,
        'account_type' => 'CASH',
        'account_no' => 'CASH-TELLER-002',
    ]);
    $savingsAccount = FinancialAccount::factory()->active(1000)->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'financial_product_id' => null,
        'holder_type' => Customer::class,
        'holder_id' => $customer->id,
        'account_type' => 'SAVINGS',
        'account_no' => 'SAVINGS-CUST-002',
    ]);
    $fixture['location']->update(['financial_account_id' => $cashAccount->id]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('teller-transactions.customer-deposit.store'), [
            'teller_session_id' => $fixture['session']->id,
            'customer_id' => $customer->id,
            'amount' => '10.00',
            'selected' => ['deposit-' . $savingsAccount->id],
            'note' => 'Customer cash deposit',
        ])
        ->assertRedirect(route('teller-transactions.customer-deposit', ['customer_id' => $customer->id]));

    $transaction = TellerCashTransaction::query()->latest()->firstOrFail();

    expect($transaction->type)->toBe('DEPOSIT')
        ->and($transaction->amount)->toBe('10.0000')
        ->and($transaction->financial_transaction_id)->not->toBeNull();
});

it('posts a pending deposit and updates the teller expected cash', function () {
    $fixture = tellerCashTransactionFixture();
    grantTellerCashTransactionPostPermission($fixture['user']);
    $transaction = TellerCashTransaction::create([
        'branch_day_id' => $fixture['branchDay']->id,
        'cash_location_id' => $fixture['location']->id,
        'teller_session_id' => $fixture['session']->id,
        'transaction_no' => 'TELLER-POST-001',
        'type' => 'DEPOSIT',
        'amount' => 300,
        'status' => 'PENDING',
        'requested_by' => $fixture['user']->id,
        'requested_at' => now(),
    ]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('teller-transactions.post', $transaction))
        ->assertRedirect(route('teller-transactions.index'));

    expect($transaction->fresh()->status)->toBe('POSTED')
        ->and($transaction->fresh()->posted_by)->toBe($fixture['user']->id)
        ->and($transaction->fresh()->posted_at)->not->toBeNull()
        ->and($fixture['session']->fresh()->expected_cash)->toBe('5300.0000');
});

it('updates reference and note on a pending teller transaction', function () {
    $fixture = tellerCashTransactionFixture();
    grantTellerCashTransactionUpdatePermission($fixture['user']);
    $transaction = TellerCashTransaction::create([
        'branch_day_id' => $fixture['branchDay']->id,
        'cash_location_id' => $fixture['location']->id,
        'teller_session_id' => $fixture['session']->id,
        'transaction_no' => 'TELLER-UPDATE-001',
        'type' => 'DEPOSIT',
        'amount' => 300,
        'status' => 'PENDING',
        'requested_by' => $fixture['user']->id,
        'requested_at' => now(),
    ]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->patch(route('teller-transactions.update', $transaction), [
            'reference' => 'REF-UPDATED',
            'note' => 'Updated teller note',
        ])
        ->assertSessionHas('success');

    expect($transaction->fresh()->reference)->toBe('REF-UPDATED')
        ->and($transaction->fresh()->note)->toBe('Updated teller note')
        ->and($transaction->fresh()->amount)->toBe('300.0000');
});

it('rejects edits to posted teller transactions', function () {
    $fixture = tellerCashTransactionFixture();
    grantTellerCashTransactionUpdatePermission($fixture['user']);
    $transaction = TellerCashTransaction::create([
        'branch_day_id' => $fixture['branchDay']->id,
        'cash_location_id' => $fixture['location']->id,
        'teller_session_id' => $fixture['session']->id,
        'transaction_no' => 'TELLER-UPDATE-POSTED-001',
        'type' => 'DEPOSIT',
        'amount' => 300,
        'status' => 'POSTED',
        'requested_by' => $fixture['user']->id,
        'requested_at' => now(),
    ]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->patch(route('teller-transactions.update', $transaction), [
            'reference' => 'SHOULD-NOT-SAVE',
        ])
        ->assertSessionHas('error');

    expect($transaction->fresh()->reference)->toBeNull();
});

it('cancels a pending teller transaction and its financial draft with a reason', function () {
    $fixture = tellerCashTransactionFixture();
    grantTellerCashTransactionPermission($fixture['user']);
    grantTellerCashTransactionCancelPermission($fixture['user']);

    $cashAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'financial_product_id' => null,
        'account_type' => 'CASH',
        'account_no' => 'CASH-TELLER-CANCEL-001',
    ]);
    $savingsAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'financial_product_id' => null,
        'account_type' => 'SAVINGS',
        'account_no' => 'SAVINGS-CANCEL-001',
    ]);
    $fixture['location']->update(['financial_account_id' => $cashAccount->id]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('teller-transactions.deposit.store'), [
            'teller_session_id' => $fixture['session']->id,
            'amount' => '100',
            'lines' => [
                ['financial_account_id' => $savingsAccount->id, 'amount' => '100'],
            ],
        ])
        ->assertRedirect(route('teller-transactions.deposit'));

    $transaction = TellerCashTransaction::query()->latest()->firstOrFail();

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('teller-transactions.cancel', $transaction), [
            'reason' => 'Duplicate entry',
        ])
        ->assertSessionHas('success');

    expect($transaction->fresh()->status)->toBe('CANCELLED')
        ->and($transaction->fresh()->cancellation_reason)->toBe('Duplicate entry')
        ->and($transaction->fresh()->cancelled_by)->toBe($fixture['user']->id)
        ->and($transaction->fresh()->cancelled_at)->not->toBeNull()
        ->and($transaction->fresh()->financialTransaction->status)->toBe('CANCELLED')
        ->and($fixture['session']->fresh()->expected_cash)->toBeNull();
});

it('creates and posts a multi-line financial deposit with the teller cash leg', function () {
    $fixture = tellerCashTransactionFixture();
    grantTellerCashTransactionPermission($fixture['user']);
    grantTellerCashTransactionPostPermission($fixture['user']);
    grantTellerCashTransactionReversePermission($fixture['user']);

    $cashAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'financial_product_id' => null,
        'account_type' => 'CASH',
        'account_no' => 'CASH-TELLER-001',
    ]);
    $savingsAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'financial_product_id' => null,
        'account_type' => 'SAVINGS',
        'account_no' => 'SAVINGS-001',
    ]);
    $shareAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'financial_product_id' => null,
        'account_type' => 'SHARE',
        'account_no' => 'SHARE-001',
    ]);
    $fixture['location']->update(['financial_account_id' => $cashAccount->id]);
    configureTellerSummaryMapping($fixture, 'DEPOSIT');

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('teller-transactions.deposit.store'), [
            'teller_session_id' => $fixture['session']->id,
            'amount' => '300',
            'lines' => [
                ['financial_account_id' => $savingsAccount->id, 'amount' => '200'],
                ['financial_account_id' => $shareAccount->id, 'amount' => '100'],
            ],
        ])
        ->assertRedirect(route('teller-transactions.deposit'));

    $transaction = TellerCashTransaction::query()->with('financialTransaction.entries')->firstOrFail();

    expect($transaction->financial_transaction_id)->not->toBeNull()
        ->and($transaction->financialTransaction->entries)->toHaveCount(3)
        ->and($transaction->financialTransaction->status)->toBe('PENDING');

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('teller-transactions.post', $transaction))
        ->assertRedirect(route('teller-transactions.index'));

    expect($cashAccount->fresh()->balance)->toBe('300.0000')
        ->and($savingsAccount->fresh()->balance)->toBe('200.0000')
        ->and($shareAccount->fresh()->balance)->toBe('100.0000')
        ->and($transaction->fresh()->status)->toBe('POSTED')
        ->and($fixture['session']->fresh()->expected_cash)->toBe('5300.0000');

    $fixture['session']->update([
        'status' => 'CLOSED',
        'closing_cash' => 5200,
        'cash_difference' => -100,
    ]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('teller-transactions.reverse', $transaction), [
            'reason' => 'Entered against the wrong customer accounts',
        ])
        ->assertSessionHas('success');

    expect($transaction->fresh()->status)->toBe('REVERSED')
        ->and($transaction->fresh()->reversal_reason)->toBe('Entered against the wrong customer accounts')
        ->and($transaction->fresh()->reversed_by)->toBe($fixture['user']->id)
        ->and($transaction->fresh()->reversed_at)->not->toBeNull()
        ->and($transaction->fresh()->financialTransaction->status)->toBe('REVERSED')
        ->and($cashAccount->fresh()->balance)->toBe('0.0000')
        ->and($savingsAccount->fresh()->balance)->toBe('0.0000')
        ->and($shareAccount->fresh()->balance)->toBe('0.0000')
        ->and($fixture['session']->fresh()->expected_cash)->toBe('5000.0000')
        ->and($fixture['session']->fresh()->cash_difference)->toBe('200.0000');
});

it('creates and posts a multi-line financial withdrawal with the teller cash leg', function () {
    $fixture = tellerCashTransactionFixture();
    grantTellerCashTransactionPermission($fixture['user']);
    grantTellerCashTransactionPostPermission($fixture['user']);

    $cashAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'financial_product_id' => null,
        'account_type' => 'CASH',
        'account_no' => 'CASH-TELLER-002',
        'balance' => 1000,
        'available_balance' => 1000,
    ]);
    $savingsAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'financial_product_id' => null,
        'account_type' => 'SAVINGS',
        'account_no' => 'SAVINGS-002',
        'balance' => 500,
        'available_balance' => 500,
    ]);
    $fixture['location']->update(['financial_account_id' => $cashAccount->id]);
    configureTellerSummaryMapping($fixture, 'WITHDRAWAL');

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('teller-transactions.withdrawal.store'), [
            'teller_session_id' => $fixture['session']->id,
            'amount' => '300',
            'lines' => [
                ['financial_account_id' => $savingsAccount->id, 'amount' => '300'],
            ],
        ])
        ->assertRedirect(route('teller-transactions.withdrawal'));

    $transaction = TellerCashTransaction::query()->with('financialTransaction.entries')->latest()->firstOrFail();

    expect($transaction->financial_transaction_id)->not->toBeNull()
        ->and($transaction->financialTransaction->entries)->toHaveCount(2)
        ->and($transaction->financialTransaction->status)->toBe('PENDING');

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('teller-transactions.post', $transaction))
        ->assertRedirect(route('teller-transactions.index'));

    expect($cashAccount->fresh()->balance)->toBe('700.0000')
        ->and($savingsAccount->fresh()->balance)->toBe('200.0000')
        ->and($transaction->fresh()->status)->toBe('POSTED')
        ->and($fixture['session']->fresh()->expected_cash)->toBe('4700.0000');
});
