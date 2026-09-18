<?php

use App\FinancialServices\Models\FinancialAccount;
use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use App\TreasuryAndCash\Models\Bank;
use App\TreasuryAndCash\Models\BankAccount;
use App\TreasuryAndCash\Models\Cheque;
use App\TreasuryAndCash\Models\ChequeBook;

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

function chequeFixture(): array
{
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
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
    $cheque = Cheque::create([
        'cheque_book_id' => $book->id,
        'cheque_no' => 'CHQ-0001',
        'status' => 'UNUSED',
        'cheque_date' => '2026-09-18',
    ]);

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
        ->get(route('cheques.index'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/cheques/index')
            ->has('cheques.data', 1)
            ->where('cheques.data.0.cheque_no', $fixture['cheque']->cheque_no));
});

it('does not expose cheque pages without permission', function () {
    $fixture = chequeFixture();

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('cheques.index'))
        ->assertForbidden();
});
