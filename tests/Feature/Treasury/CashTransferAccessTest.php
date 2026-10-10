<?php

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Permission;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use App\FinancialServices\Models\FinancialAccount;
use App\GeneralAccounting\Models\AccountGroup;
use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\FiscalYear;
use App\GeneralAccounting\Models\LedgerAccount;
use App\GeneralAccounting\Models\TreasuryGlMapping;
use App\GeneralAccounting\Models\Voucher;
use App\TreasuryAndCash\Models\Bank;
use App\TreasuryAndCash\Models\BankAccount;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Models\CashTransfer;
use App\TreasuryAndCash\Models\Teller;
use App\TreasuryAndCash\Models\TellerSession;
use App\TreasuryAndCash\Models\Vault;
use App\TreasuryAndCash\Models\VaultSession;

function grantCashTransferCreatePermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'cash_transfer_create_test'],
        ['name' => 'Cash Transfer Create Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'cash_transfers.create'],
        [
            'module' => 'cash_transfers',
            'name' => 'Create Cash Transfers',
            'action' => 'create',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function grantCashTransferLifecyclePermissions(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'cash_transfer_lifecycle_test'],
        ['name' => 'Cash Transfer Lifecycle Test'],
    );

    $permissions = collect([
        ['slug' => 'cash_transfers.approve', 'name' => 'Approve Cash Transfers', 'action' => 'approve'],
        ['slug' => 'cash_transfers.complete', 'name' => 'Complete Cash Transfers', 'action' => 'complete'],
    ])->map(fn(array $permission) => Permission::firstOrCreate(
            ['slug' => $permission['slug']],
            [
                'module' => 'cash_transfers',
                'name' => $permission['name'],
                'action' => $permission['action'],
            ],
        ));

    $role->permissions()->syncWithoutDetaching($permissions->pluck('id'));
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function grantCashTransferViewPermission(User $user): void
{
    $role = Role::firstOrCreate(
        ['slug' => 'cash_transfer_view_test'],
        ['name' => 'Cash Transfer View Test'],
    );

    $permission = Permission::firstOrCreate(
        ['slug' => 'cash_transfers.view'],
        [
            'module' => 'cash_transfers',
            'name' => 'View Cash Transfers',
            'action' => 'view',
        ],
    );

    $role->permissions()->syncWithoutDetaching([$permission->id]);
    $user->roles()->syncWithoutDetaching([$role->id]);
}

function cashTransferFixture(): array
{
    $organization = Organization::factory()->create();
    $branch = Branch::factory()->create(['organization_id' => $organization->id]);
    $user = User::factory()->create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
    ]);
    $branchDay = BranchDay::create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'business_date' => '2026-09-18',
        'status' => 'OPEN',
        'opened_at' => now(),
        'opened_by' => $user->id,
    ]);
    $source = CashLocation::create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'code' => 'TRANSFER-SOURCE',
        'name' => 'Transfer Source',
        'type' => 'TELLER',
        'is_active' => true,
    ]);
    $vault = CashLocation::create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'code' => 'TRANSFER-VAULT',
        'name' => 'Transfer Vault',
        'type' => 'VAULT',
        'is_active' => true,
    ]);
    $target = CashLocation::create([
        'organization_id' => $organization->id,
        'branch_id' => $branch->id,
        'code' => 'TRANSFER-TARGET',
        'name' => 'Transfer Target',
        'type' => 'TELLER',
        'is_active' => true,
    ]);
    $sourceTeller = Teller::create([
        'cash_location_id' => $source->id,
        'user_id' => $user->id,
        'code' => 'TRANSFER-TELLER-001',
        'name' => 'Transfer Source Teller',
        'status' => 'ACTIVE',
    ]);
    $targetTeller = Teller::create([
        'cash_location_id' => $target->id,
        'user_id' => $user->id,
        'code' => 'TRANSFER-TELLER-002',
        'name' => 'Transfer Target Teller',
        'status' => 'ACTIVE',
    ]);
    $vaultModel = Vault::create([
        'cash_location_id' => $vault->id,
        'code' => 'TRANSFER-VAULT-001',
        'name' => 'Transfer Vault',
        'status' => 'ACTIVE',
    ]);
    $sourceSession = TellerSession::create([
        'branch_day_id' => $branchDay->id,
        'teller_id' => $sourceTeller->id,
        'opened_by' => $user->id,
        'status' => 'OPEN',
        'opening_cash' => 5000,
        'expected_cash' => 5000,
        'opened_at' => now(),
    ]);
    $targetSession = TellerSession::create([
        'branch_day_id' => $branchDay->id,
        'teller_id' => $targetTeller->id,
        'opened_by' => $user->id,
        'status' => 'OPEN',
        'opening_cash' => 100,
        'expected_cash' => 100,
        'opened_at' => now(),
    ]);
    $vaultSession = VaultSession::create([
        'branch_day_id' => $branchDay->id,
        'vault_id' => $vaultModel->id,
        'opened_by' => $user->id,
        'status' => 'OPEN',
        'opening_cash' => 1000,
        'expected_cash' => 1000,
        'opened_at' => now(),
    ]);

    $accountGroup = AccountGroup::factory()->create(['organization_id' => $organization->id]);
    $clearingAccount = LedgerAccount::factory()->create([
        'organization_id' => $organization->id,
        'account_group_id' => $accountGroup->id,
    ]);
    $tellerLedgerAccount = LedgerAccount::factory()->create([
        'organization_id' => $organization->id,
        'account_group_id' => $accountGroup->id,
    ]);
    $vaultLedgerAccount = LedgerAccount::factory()->create([
        'organization_id' => $organization->id,
        'account_group_id' => $accountGroup->id,
    ]);
    $fiscalYear = FiscalYear::factory()->create([
        'organization_id' => $organization->id,
        'name' => 'Transfer Fiscal Year ' . $organization->id,
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

    foreach ([
        ['TELLER', 'DEPOSIT', $tellerLedgerAccount->id, $clearingAccount->id],
        ['TELLER', 'WITHDRAWAL', $clearingAccount->id, $tellerLedgerAccount->id],
        ['VAULT', 'DEPOSIT', $vaultLedgerAccount->id, $clearingAccount->id],
        ['VAULT', 'WITHDRAWAL', $clearingAccount->id, $vaultLedgerAccount->id],
    ] as [$sourceCode, $transactionType, $debitAccountId, $creditAccountId]) {
        TreasuryGlMapping::query()->create([
            'organization_id' => $organization->id,
            'source_type' => 'CASH_LOCATION',
            'source_code' => $sourceCode,
            'transaction_type' => $transactionType,
            'debit_account_id' => $debitAccountId,
            'credit_account_id' => $creditAccountId,
            'status' => true,
        ]);
    }

    return compact(
        'organization',
        'branch',
        'user',
        'branchDay',
        'source',
        'target',
        'vault',
        'sourceSession',
        'targetSession',
        'vaultSession',
    );
}

it('loads the teller-to-teller transfer form with scoped transfer data', function () {
    $fixture = cashTransferFixture();
    grantCashTransferCreatePermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('cash-movements.teller-to-teller-transfer'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/cash-movements/teller-to-teller-transfer')
            ->has('branch_day')
            ->where('transfer_type', 'TELLER_TO_TELLER')
            ->has('from_cash_locations', 2)
            ->has('to_cash_locations', 2)
            ->where('from_cash_locations.0.type', 'TELLER'));
});

it('filters vault transfer options to the correct source and destination types', function () {
    $fixture = cashTransferFixture();
    grantCashTransferCreatePermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('vault-transfers.root.vault-to-teller'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->where('transfer_type', 'VAULT_TO_TELLER')
            ->has('from_cash_locations', 1)
            ->where('from_cash_locations.0.type', 'VAULT')
            ->has('to_cash_locations', 2)
            ->where('to_cash_locations.0.type', 'TELLER'));

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('vault-transfers.root.teller-to-vault'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->where('transfer_type', 'TELLER_TO_VAULT')
            ->has('from_cash_locations', 2)
            ->where('from_cash_locations.0.type', 'TELLER')
            ->has('to_cash_locations', 1)
            ->where('to_cash_locations.0.type', 'VAULT'));

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('vault-transfers.root.vault-to-vault'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->where('transfer_type', 'VAULT_TO_VAULT')
            ->has('from_cash_locations', 1)
            ->where('from_cash_locations.0.type', 'VAULT')
            ->has('to_cash_locations', 1)
            ->where('to_cash_locations.0.type', 'VAULT'));
});

it('loads active bank accounts as the source for bank-to-vault funding', function () {
    $fixture = cashTransferFixture();
    grantCashTransferCreatePermission($fixture['user']);
    $bank = Bank::create([
        'organization_id' => $fixture['organization']->id,
        'code' => 'TRANSFER-BANK-001',
        'name' => 'Transfer Bank',
        'status' => true,
    ]);
    $financialAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'financial_product_id' => null,
        'account_type' => 'BANK',
    ]);
    $bankAccount = BankAccount::create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'bank_id' => $bank->id,
        'financial_account_id' => $financialAccount->id,
        'account_name' => 'Vault Funding Account',
        'account_number' => 'TRANSFER-BANK-ACCOUNT-001',
        'account_type' => 'CURRENT',
        'opening_balance' => 10000,
        'is_reconcilable' => true,
        'status' => 'ACTIVE',
    ]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('vault-transfers.root.bank-to-vault'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->where('transfer_type', 'BANK_TO_VAULT')
            ->has('from_cash_locations', 0)
            ->has('to_cash_locations', 1)
            ->has('bank_accounts', 1)
            ->where('bank_accounts.0.id', $bankAccount->id));
});

it('does not expose cash transfer forms without create permission', function () {
    $fixture = cashTransferFixture();

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('cash-movements.teller-to-teller-transfer'))
        ->assertForbidden();
});

it('loads the cash transfer queue for users with view permission', function () {
    $fixture = cashTransferFixture();
    grantCashTransferViewPermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('cash-movements.transfers.index'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->component('treasury-cash/cash-movements/index')
            ->has('transfers.data', 0));
});

it('creates a pending cash transfer within the users open branch day', function () {
    $fixture = cashTransferFixture();
    grantCashTransferCreatePermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('cash-movements.teller-to-teller-transfer.store'), [
            'from_cash_location_id' => $fixture['source']->id,
            'to_cash_location_id' => $fixture['target']->id,
            'amount' => 1250.50,
            'note' => 'Till replenishment',
        ])
        ->assertRedirect(route('cash-movements.teller-to-teller-transfer'));

    $transfer = CashTransfer::query()->firstOrFail();

    expect($transfer->branch_day_id)->toBe($fixture['branchDay']->id)
        ->and($transfer->from_cash_location_id)->toBe($fixture['source']->id)
        ->and($transfer->to_cash_location_id)->toBe($fixture['target']->id)
        ->and($transfer->status)->toBe('PENDING')
        ->and($transfer->requested_by)->toBe($fixture['user']->id)
        ->and($transfer->note)->toBe('Till replenishment');
});

it('creates vault transfer modes and rejects mismatched location types', function () {
    $fixture = cashTransferFixture();
    grantCashTransferCreatePermission($fixture['user']);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('cash-movements.teller-to-teller-transfer.store'), [
            'from_cash_location_id' => $fixture['vault']->id,
            'to_cash_location_id' => $fixture['target']->id,
            'amount' => 50,
        ])
        ->assertSessionHas('error');

    expect(CashTransfer::query()->count())->toBe(0);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('vault-transfers.root.vault-to-teller.store'), [
            'from_cash_location_id' => $fixture['vault']->id,
            'to_cash_location_id' => $fixture['target']->id,
            'amount' => 100,
        ])
        ->assertRedirect(route('vault-transfers.root.vault-to-teller'));

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('vault-transfers.root.teller-to-vault.store'), [
            'from_cash_location_id' => $fixture['source']->id,
            'to_cash_location_id' => $fixture['vault']->id,
            'amount' => 75,
        ])
        ->assertRedirect(route('vault-transfers.root.teller-to-vault'));

    expect(CashTransfer::query()->count())->toBe(2);
});

it('funds an open vault from a bank and updates both balances on completion', function () {
    $fixture = cashTransferFixture();
    grantCashTransferCreatePermission($fixture['user']);
    grantCashTransferLifecyclePermissions($fixture['user']);

    $bank = Bank::create([
        'organization_id' => $fixture['organization']->id,
        'code' => 'TRANSFER-BANK-002',
        'name' => 'Vault Funding Bank',
        'status' => true,
    ]);
    $financialAccount = FinancialAccount::factory()->active()->create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'financial_product_id' => null,
        'account_type' => 'BANK',
    ]);
    $bankAccount = BankAccount::create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'bank_id' => $bank->id,
        'financial_account_id' => $financialAccount->id,
        'account_name' => 'Vault Funding Account',
        'account_number' => 'TRANSFER-BANK-ACCOUNT-002',
        'account_type' => 'CURRENT',
        'opening_balance' => 10000,
        'is_reconcilable' => true,
        'status' => 'ACTIVE',
    ]);

    $group = AccountGroup::factory()->create(['organization_id' => $fixture['organization']->id]);
    $debitAccount = LedgerAccount::factory()->create([
        'organization_id' => $fixture['organization']->id,
        'account_group_id' => $group->id,
    ]);
    $creditAccount = LedgerAccount::factory()->create([
        'organization_id' => $fixture['organization']->id,
        'account_group_id' => $group->id,
    ]);
    $fiscalYear = FiscalYear::factory()->create([
        'organization_id' => $fixture['organization']->id,
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
    TreasuryGlMapping::query()->create([
        'organization_id' => $fixture['organization']->id,
        'source_type' => 'BANK_TRANSACTION',
        'source_code' => 'DEFAULT',
        'transaction_type' => 'TRANSFER_OUT',
        'debit_account_id' => $debitAccount->id,
        'credit_account_id' => $creditAccount->id,
        'status' => true,
    ]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('vault-transfers.root.bank-to-vault.store'), [
            'bank_account_id' => $bankAccount->id,
            'to_cash_location_id' => $fixture['vault']->id,
            'amount' => 250,
            'note' => 'Initial vault funding',
        ])
        ->assertRedirect(route('vault-transfers.root.bank-to-vault'));

    $transfer = CashTransfer::query()->firstOrFail();

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('cash-movements.transfers.approve', $transfer))
        ->assertRedirect(route('cash-movements.transfers.index'));

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('cash-movements.transfers.complete', $transfer))
        ->assertRedirect(route('cash-movements.transfers.index'));

    $bankTransaction = $transfer->fresh()->bankTransaction;
    expect($transfer->fresh()->status)->toBe('COMPLETED')
        ->and($transfer->fresh()->transfer_type)->toBe('BANK_TO_VAULT')
        ->and($bankTransaction->type)->toBe('TRANSFER_OUT')
        ->and($bankTransaction->status)->toBe('POSTED')
        ->and($bankTransaction->balance_after)->toBe('9750.0000')
        ->and($fixture['vaultSession']->fresh()->expected_cash)->toBe('1250.0000')
        ->and(Voucher::query()->where(
            'voucher_no',
            'CASH-TRF-' . $transfer->id . '-CASH-IN',
        )->exists())->toBeTrue();

    TreasuryGlMapping::query()->create([
        'organization_id' => $fixture['organization']->id,
        'source_type' => 'BANK_TRANSACTION',
        'source_code' => 'DEFAULT',
        'transaction_type' => 'TRANSFER_IN',
        'debit_account_id' => $debitAccount->id,
        'credit_account_id' => $creditAccount->id,
        'status' => true,
    ]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->get(route('vault-transfers.root.vault-to-bank'))
        ->assertSuccessful()
        ->assertInertia(fn($page) => $page
            ->where('transfer_type', 'VAULT_TO_BANK')
            ->has('from_cash_locations', 1)
            ->where('from_cash_locations.0.type', 'VAULT')
            ->has('to_cash_locations', 0)
            ->has('bank_accounts', 1));

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('vault-transfers.root.vault-to-bank.store'), [
            'from_cash_location_id' => $fixture['vault']->id,
            'bank_account_id' => $bankAccount->id,
            'amount' => 200,
            'note' => 'Deposit vault excess',
        ])
        ->assertRedirect(route('vault-transfers.root.vault-to-bank'));

    $vaultDeposit = CashTransfer::query()->where('transfer_type', 'VAULT_TO_BANK')->firstOrFail();
    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('cash-movements.transfers.approve', $vaultDeposit));

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('cash-movements.transfers.complete', $vaultDeposit))
        ->assertSessionHas('success');

    $depositBankTransaction = $vaultDeposit->fresh()->bankTransaction;
    expect($vaultDeposit->fresh()->status)->toBe('COMPLETED')
        ->and($depositBankTransaction->type)->toBe('TRANSFER_IN')
        ->and($depositBankTransaction->status)->toBe('POSTED')
        ->and($depositBankTransaction->balance_after)->toBe('9950.0000')
        ->and($fixture['vaultSession']->fresh()->expected_cash)->toBe('1050.0000')
        ->and(Voucher::query()->where(
            'voucher_no',
            'CASH-TRF-' . $vaultDeposit->id . '-CASH-OUT',
        )->exists())->toBeTrue();
});

it('moves cash between open vault sessions on vault-to-vault completion', function () {
    $fixture = cashTransferFixture();
    grantCashTransferCreatePermission($fixture['user']);
    grantCashTransferLifecyclePermissions($fixture['user']);
    $destinationLocation = CashLocation::create([
        'organization_id' => $fixture['organization']->id,
        'branch_id' => $fixture['branch']->id,
        'code' => 'TRANSFER-VAULT-DEST',
        'name' => 'Destination Vault',
        'type' => 'VAULT',
        'is_active' => true,
    ]);
    $destinationVault = Vault::create([
        'cash_location_id' => $destinationLocation->id,
        'code' => 'TRANSFER-VAULT-DEST',
        'name' => 'Destination Vault',
        'status' => 'ACTIVE',
    ]);
    $destinationSession = VaultSession::create([
        'branch_day_id' => $fixture['branchDay']->id,
        'vault_id' => $destinationVault->id,
        'opened_by' => $fixture['user']->id,
        'status' => 'OPEN',
        'opening_cash' => 50,
        'expected_cash' => 50,
        'opened_at' => now(),
    ]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('vault-transfers.root.vault-to-vault.store'), [
            'from_cash_location_id' => $fixture['vault']->id,
            'to_cash_location_id' => $destinationLocation->id,
            'amount' => 300,
        ])
        ->assertRedirect(route('vault-transfers.root.vault-to-vault'));

    $transfer = CashTransfer::query()->firstOrFail();

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('cash-movements.transfers.approve', $transfer));

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('cash-movements.transfers.complete', $transfer))
        ->assertSessionHas('success');

    expect($fixture['vaultSession']->fresh()->expected_cash)->toBe('700.0000')
        ->and($destinationSession->fresh()->expected_cash)->toBe('350.0000')
        ->and($transfer->fresh()->status)->toBe('COMPLETED');
});

it('approves and completes a pending cash transfer', function () {
    $fixture = cashTransferFixture();
    grantCashTransferLifecyclePermissions($fixture['user']);
    $transfer = CashTransfer::create([
        'branch_day_id' => $fixture['branchDay']->id,
        'from_cash_location_id' => $fixture['source']->id,
        'to_cash_location_id' => $fixture['target']->id,
        'amount' => 1250.50,
        'transfer_no' => 'TRF-LIFECYCLE-001',
        'status' => 'PENDING',
        'requested_by' => $fixture['user']->id,
        'requested_at' => now(),
    ]);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('cash-movements.transfers.approve', $transfer))
        ->assertRedirect(route('cash-movements.transfers.index'));

    expect($transfer->fresh()->status)->toBe('APPROVED')
        ->and($transfer->fresh()->approved_by)->toBe($fixture['user']->id);

    $this->actingAs($fixture['user'])
        ->withSession(['active_organization_id' => $fixture['organization']->id])
        ->post(route('cash-movements.transfers.complete', $transfer))
        ->assertRedirect(route('cash-movements.transfers.index'));

    expect($transfer->fresh()->status)->toBe('COMPLETED')
        ->and($transfer->fresh()->completed_at)->not->toBeNull()
        ->and($fixture['sourceSession']->fresh()->expected_cash)->toBe('3749.5000')
        ->and($fixture['targetSession']->fresh()->expected_cash)->toBe('1350.5000')
        ->and(Voucher::query()->whereIn('voucher_no', [
            'CASH-TRF-' . $transfer->id . '-CASH-OUT',
            'CASH-TRF-' . $transfer->id . '-CASH-IN',
        ])->count())->toBe(2);
});
