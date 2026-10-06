<?php

use App\FinancialServices\Models\FinancialAccount;
use App\CustomerModule\Models\Customer;
use App\CustomerModule\Models\KycDocument;
use App\GeneralAccounting\Models\AccountGroup;
use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\FiscalYear;
use App\GeneralAccounting\Models\LedgerAccount;
use App\GeneralAccounting\Models\TreasuryGlMapping;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Application\ChequeService;
use App\TreasuryAndCash\Application\ChequePaymentService;
use App\TreasuryAndCash\Models\Bank;
use App\TreasuryAndCash\Models\BankAccount;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Models\Cheque;
use App\TreasuryAndCash\Models\ChequeBook;
use App\TreasuryAndCash\Models\Teller;
use App\TreasuryAndCash\Models\TellerSession;

function grantChequeViewPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'cheques_view_test'],
        ['name' => 'Cheques View Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'cheque_books.view'],
        [
            'module' => 'cheque_books',
            'name' => 'View Cheque Books',
            'action' => 'view',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $chequesPermission = Permission::firstOrCreate(
        ['slug' => 'cheques.view'],
        [
            'module' => 'cheques',
            'name' => 'View Cheques',
            'action' => 'view',
        ],
    );
    $role->permissions()->syncWithoutDetaching([$chequesPermission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function grantChequeBookCreatePermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'cheque_book_create_test'],
        ['name' => 'Cheque Book Create Test'],
    );
    $permission = Permission::firstOrCreate(
        ['slug' => 'cheque_books.create'],
        [
            'module' => 'cheque_books',
            'name' => 'Create Cheque Books',
            'action' => 'create',
        ],
    );
    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function grantChequeIssuePermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'cheques_issue_account_test'],
        ['name' => 'Cheques Issue Account Test'],
    );
    $permission = Permission::firstOrCreate(
        ['slug' => 'cheques.issue'],
        [
            'module' => 'cheques',
            'name' => 'Issue Cheques',
            'action' => 'issue',
        ],
    );
    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function chequeFixture(): array
{
    $organization = Organization::factory()->create();
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
    $bank = Bank::create([
        'organization_id' => $organization->id,
        'code' => 'CHEQUE-BANK',
        'name' => 'Cheque Bank',
        'status' => true,
    ]);
    $financialAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'account_type' => 'BANK',
    ]);
    $bankAccount = BankAccount::create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'bank_id' => $bank->id,
        'financial_account_id' => $financialAccount->id,
        'account_name' => 'Cheque Operating Account',
        'account_number' => 'CHEQUE-001',
        'account_type' => 'CURRENT',
        'opening_balance' => 10000,
        'is_reconcilable' => true,
        'status' => 'ACTIVE',
    ]);
    $book = ChequeBook::create([
        'financial_account_id' => $financialAccount->id,
        'bank_account_id' => $bankAccount->id,
        'book_no' => 'BOOK-001',
        'prefix' => 'CHQ',
        'start_number' => 1,
        'end_number' => 50,
        'current_number' => 1,
        'leaf_count' => 50,
        'issued_date' => '2026-09-18',
        'status' => 'AVAILABLE',
    ]);
    $cheque = $book->cheques()->firstOrFail();

    return compact('organization', 'branch', 'user', 'bankAccount', 'book', 'cheque');
}

it('loads cheque books and cheques for authorized organization users', function () {
    $fixture = chequeFixture();
    grantChequeViewPermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('cheque-books.index'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/cheques/books/index')
            ->has('books.data', 1)
            ->where('books.data.0.book_no', $fixture['book']->book_no));

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('cheques.index', ['per_page' => 1]))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/cheques/index')
            ->has('cheques.data', 1)
            ->where('cheques.data.0.cheque_no', $fixture['cheque']->cheque_no)
            ->where('cheques.data.0.financial_account.id', $fixture['bankAccount']->financial_account_id)
            ->where('cheques.data.0.cheque_book.financial_account.id', $fixture['bankAccount']->financial_account_id));
});

it('does not expose cheque pages without permission', function () {
    $fixture = chequeFixture();

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('cheques.index'))
        ->assertForbidden();
});

it('does not allow cheque lifecycle actions without their specific permission', function () {
    $fixture = chequeFixture();
    grantChequeViewPermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('cheques.issue', $fixture['cheque']), [
            'amount' => 100,
            'payee' => 'Supplier',
        ])
        ->assertForbidden();
});

it('creates cheque leaves and enforces the cheque lifecycle', function () {
    $fixture = chequeFixture();
    $service = app(ChequeService::class);

    $book = $service->createBook([
        'bank_account_id' => $fixture['bankAccount']->id,
        'book_no' => 'BOOK-002',
        'prefix' => 'NEW-',
        'start_number' => 10,
        'end_number' => 12,
        'issued_date' => '2026-09-21',
    ], $fixture['user']->id);

    expect($book->cheques)->toHaveCount(3);

    $cheque = $book->cheques->first();
    $service->transition($cheque, 'issue', $fixture['user']->id, [
        'amount' => 1250,
        'payee' => 'Supplier',
    ]);
    $service->transition($cheque->fresh(), 'present', $fixture['user']->id);
    $service->transition($cheque->fresh(), 'clear', $fixture['user']->id);

    expect($cheque->fresh()->status)->toBe('CLEARED')
        ->and($cheque->transactions()->count())->toBe(3);

    expect(fn() => $service->transition($cheque->fresh(), 'bounce', $fixture['user']->id))
        ->toThrow(RuntimeException::class);
});

it('validates duplicate cheque book numbers for savings accounts', function () {
    $fixture = chequeFixture();
    grantChequeBookCreatePermission($fixture['user']);

    $savingsAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'account_type' => 'SAVINGS',
        'account_no' => 'SAV-DUP-001',
    ]);
    ChequeBook::create([
        'financial_account_id' => $savingsAccount->id,
        'book_no' => '5555',
        'prefix' => 'SAV',
        'start_number' => 1,
        'end_number' => 2,
        'current_number' => 1,
        'leaf_count' => 2,
        'issued_date' => now()->toDateString(),
        'status' => 'IN_USE',
    ]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->from(route('cheque-books.create'))
        ->post(route('cheque-books.store'), [
            'financial_account_id' => $savingsAccount->id,
            'book_no' => '5555',
            'prefix' => 'SAV',
            'start_number' => 3,
            'end_number' => 4,
            'issued_date' => now()->toDateString(),
        ])
        ->assertSessionHasErrors(['book_no']);

    expect(ChequeBook::query()
        ->where('financial_account_id', $savingsAccount->id)
        ->where('book_no', '5555')
        ->count())->toBe(1);
});

it('allows issuing a cheque linked to an organization savings account', function () {
    $fixture = chequeFixture();
    grantChequeIssuePermission($fixture['user']);

    $savingsAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'account_type' => 'SAVINGS',
        'account_no' => 'SAV-ISSUE-001',
    ]);
    $book = ChequeBook::create([
        'financial_account_id' => $savingsAccount->id,
        'book_no' => 'SAV-ISSUE-BOOK',
        'prefix' => 'SAV',
        'start_number' => 1,
        'end_number' => 2,
        'current_number' => 1,
        'leaf_count' => 2,
        'issued_date' => now()->toDateString(),
        'status' => 'IN_USE',
    ]);
    $cheque = $book->cheques()->firstOrFail();

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->from(route('cheques.index'))
        ->post(route('cheques.issue', $cheque), [
            'amount' => 100,
            'payee' => 'Account holder',
        ])
        ->assertRedirect(route('cheques.index'));

    expect($cheque->fresh()->status)->toBe('ISSUED');
});

it('posts a savings-account cheque withdrawal through the teller cash ledger', function () {
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
        'business_date' => now()->toDateString(),
        'status' => BranchDay::STATUS_OPEN,
        'opened_at' => now(),
        'opened_by' => $user->id,
    ]);
    $cashAccount = FinancialAccount::factory()->active(1000)->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'account_type' => 'CASH',
        'account_no' => 'CASH-TELLER-100',
    ]);
    $cashLocation = CashLocation::create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'financial_account_id' => $cashAccount->id,
        'code' => 'TELLER-100',
        'name' => 'Teller Cash 100',
        'type' => 'TELLER',
        'is_active' => true,
    ]);
    $group = AccountGroup::factory()->create(['organization_id' => $organization->id]);
    $debitLedger = LedgerAccount::factory()->create([
        'organization_id' => $organization->id,
        'account_group_id' => $group->id,
    ]);
    $creditLedger = LedgerAccount::factory()->create([
        'organization_id' => $organization->id,
        'account_group_id' => $group->id,
    ]);
    TreasuryGlMapping::query()->create([
        'organization_id' => $organization->id,
        'source_type' => 'CASH_LOCATION',
        'source_code' => 'TELLER',
        'transaction_type' => 'WITHDRAWAL',
        'debit_account_id' => $debitLedger->id,
        'credit_account_id' => $creditLedger->id,
        'status' => true,
    ]);
    $teller = Teller::create([
        'cash_location_id' => $cashLocation->id,
        'user_id' => $user->id,
        'code' => 'TEL-100',
        'name' => 'Teller 100',
        'status' => 'ACTIVE',
        'maximum_cash' => 20000,
    ]);
    $session = TellerSession::create([
        'branch_day_id' => $branchDay->id,
        'teller_id' => $teller->id,
        'opened_by' => $user->id,
        'status' => 'OPEN',
        'opening_cash' => 1000,
        'expected_cash' => 1000,
        'opened_at' => now(),
    ]);
    $customer = Customer::factory()->individualMale()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    KycDocument::factory()->for($customer)->signature()->verified()->create();
    $savingsAccount = FinancialAccount::factory()->active(500)->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'holder_type' => Customer::class,
        'holder_id' => $customer->id,
        'account_type' => 'SAVINGS',
        'account_no' => 'SAV-300',
    ]);
    $book = ChequeBook::create([
        'financial_account_id' => $savingsAccount->id,
        'book_no' => 'CHEQUE-BOOK-100',
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
        'financial_account_id' => $savingsAccount->id,
        'cheque_no' => 'CHQ-0001',
        'status' => 'ISSUED',
        'amount' => 250,
        'payee' => 'Customer',
        'issue_date' => now()->toDateString(),
    ]);

    $transaction = app(ChequeService::class)->withdrawFromTeller(
        $cheque,
        $session->id,
        $organization->id,
        $branch->id,
        $user->id,
    );

    expect($transaction->status)->toBe('POSTED')
        ->and($cheque->fresh()->status)->toBe('PRESENTED')
        ->and($cashAccount->fresh()->balance)->toBe('750.0000')
        ->and($savingsAccount->fresh()->balance)->toBe('250.0000')
        ->and($transaction->financialTransaction->status)->toBe('POSTED');

    $paymentCheque = Cheque::create([
        'cheque_book_id' => $book->id,
        'financial_account_id' => $savingsAccount->id,
        'cheque_no' => 'CHQ-0002',
        'status' => 'ISSUED',
        'amount' => 100,
    ]);
    $paymentService = app(ChequePaymentService::class);
    $payment = $paymentService->receive($paymentCheque, $session->id, $organization->id, $branch->id, $user->id);
    $payment = $paymentService->verify($payment, $customer->id, true, true, $organization->id, $user->id);
    $approver = User::factory()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    $poster = User::factory()->create(['organization_id' => $organization->id, 'branch_id' => $branch->id]);
    $payment = $paymentService->approve($payment, $organization->id, $approver->id);
    \Illuminate\Support\Carbon::setTestNow(now()->addMinute());
    $payment = $paymentService->pay($payment, $organization->id, $branch->id, $poster->id);
    \Illuminate\Support\Carbon::setTestNow();

    expect($payment->status)->toBe('PAID')
        ->and($paymentCheque->fresh()->status)->toBe('CLEARED')
        ->and($cashAccount->fresh()->balance)->toBe('650.0000')
        ->and($savingsAccount->fresh()->balance)->toBe('150.0000')
        ->and($payment->financialTransaction->status)->toBe('POSTED');
});

it('returns a clear error when a cheque clearing is attempted without an open branch day', function () {
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    $account = FinancialAccount::factory()->active(1200)->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'holder_type' => \App\CustomerModule\Models\Customer::class,
        'holder_id' => 1,
        'account_type' => 'SAVINGS',
        'account_no' => 'SAV-7001',
    ]);
    $book = ChequeBook::create([
        'financial_account_id' => $account->id,
        'book_no' => 'CHEQUE-BOOK-700',
        'prefix' => 'CHQ',
        'start_number' => 1,
        'end_number' => 1,
        'leaf_count' => 1,
        'current_number' => 1,
        'issued_date' => now()->toDateString(),
        'status' => 'IN_USE',
    ]);
    $cheque = Cheque::create([
        'cheque_book_id' => $book->id,
        'financial_account_id' => $account->id,
        'cheque_no' => 'CHQ-7001',
        'status' => 'PRESENTED',
        'amount' => 250,
        'payee' => 'Customer',
        'presented_date' => now()->toDateString(),
        'issue_date' => now()->toDateString(),
    ]);

    $role = Role::firstOrCreate(['slug' => 'cheque_present_test'], ['name' => 'Cheque Present Test']);
    $permission = Permission::firstOrCreate(
        ['slug' => 'cheques.present'],
        ['module' => 'cheques', 'name' => 'Present Cheques', 'action' => 'present'],
    );
    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);

    $response = $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->from(route('cheque-clearings.index'))
        ->post(route('cheque-clearings.store'), [
            'cheque_id' => $cheque->id,
            'branch_id' => $branch->id,
            'clearing_no' => 'CL-7001',
            'drawer_bank_name' => 'Bank',
            'drawer_account_no' => 'ACC-7001',
        ]);

    $response->assertRedirect(route('cheque-clearings.index'));
    expect(session('error'))->toContain('open branch day');
});

it('loads a savings cheque withdrawal form for the selected customer and savings account', function () {
    $organization = Organization::factory()->create(['code' => 'ORG-001']);
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $customer = \App\CustomerModule\Models\Customer::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    \App\CustomerModule\Models\KycDocument::factory()
        ->for($customer)
        ->signature()
        ->verified()
        ->create();
    $account = FinancialAccount::factory()->active(1200)->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'holder_type' => \App\CustomerModule\Models\Customer::class,
        'holder_id' => $customer->id,
        'account_type' => 'SAVINGS',
        'account_no' => 'SAV-5001',
    ]);
    $jointHolder = \App\CustomerModule\Models\Customer::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    \App\CustomerModule\Models\KycDocument::factory()
        ->for($jointHolder)
        ->signature()
        ->verified()
        ->create();
    $account->holders()->attach($jointHolder->id, [
        'role' => 'JOINT',
        'ownership_percent' => 40,
    ]);
    $authorizedPerson = \App\CustomerModule\Models\Customer::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    \App\CustomerModule\Models\KycDocument::factory()
        ->for($authorizedPerson)
        ->signature()
        ->verified()
        ->create();
    \App\FinancialServices\Models\FinancialAccountAuthorizedPerson::create([
        'financial_account_id' => $account->id,
        'customer_id' => $authorizedPerson->id,
        'authorization_type' => 'SIGNATORY',
        'designation' => 'Primary signatory',
        'is_active' => true,
    ]);
    $book = ChequeBook::create([
        'financial_account_id' => $account->id,
        'book_no' => 'CHEQUE-BOOK-500',
        'prefix' => 'CHQ',
        'start_number' => 1,
        'end_number' => 2,
        'leaf_count' => 2,
        'current_number' => 1,
        'issued_date' => now()->toDateString(),
        'status' => 'IN_USE',
    ]);
    $cheque = $book->cheques()->first();

    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    $role = Role::firstOrCreate(['slug' => 'cheque_issue_test'], ['name' => 'Cheque Issue Test']);
    $chequePermission = Permission::firstOrCreate(
        ['slug' => 'cheques.issue'],
        ['module' => 'cheques', 'name' => 'Issue Cheques', 'action' => 'issue'],
    );
    $cashPermission = Permission::firstOrCreate(
        ['slug' => 'cash_transactions.create'],
        ['module' => 'cash_transactions', 'name' => 'Create Cash Transactions', 'action' => 'create'],
    );
    $role->permissions()->syncWithoutDetaching([$chequePermission->id, $cashPermission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);

    $this->actingAs($user)
        ->withSession(['active_organization_id' => $organization->id])
        ->get(route('teller-transactions.savings-cheque-withdrawal', ['customer_id' => $customer->id]))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/teller-transactions/savings-cheque-withdrawal-page')
            ->where('customer.id', $customer->id)
            ->where('savings_accounts.0.id', $account->id)
            ->where('savings_accounts.0.account_holder.name', $customer->name)
            ->where('savings_accounts.0.account_holder.signature.verification_status', 'VERIFIED')
            ->where('savings_accounts.0.account_holders.0.id', $customer->id)
            ->where('savings_accounts.0.account_holders.1.id', $jointHolder->id)
            ->where('savings_accounts.0.account_holders.1.signature.verification_status', 'VERIFIED')
            ->where('savings_accounts.0.authorized_persons.0.customer_name', $authorizedPerson->name)
            ->where('savings_accounts.0.authorized_persons.0.signature.verification_status', 'VERIFIED')
            ->where('available_cheques.0.id', $cheque->id));
});
