<?php

namespace App\TreasuryAndCash\Controllers;

use App\Http\Controllers\Controller;
use App\FinancialServices\Models\FinancialAccount;
use App\SystemAdministration\Models\Branch;
use App\TreasuryAndCash\Application\BankingDataService;
use App\TreasuryAndCash\Models\Bank;
use App\TreasuryAndCash\Models\BankAccount;
use App\TreasuryAndCash\Requests\StoreBankRequest;
use App\TreasuryAndCash\Requests\StoreBankAccountRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BankingController extends Controller
{
    public function __construct(
        private readonly BankingDataService $bankingDataService,
    ) {
        $this->middleware('permission:banks.view')->only(['banks']);
        $this->middleware('permission:banks.create')->only(['create', 'store']);
        $this->middleware('permission:bank_accounts.view')->only(['accounts']);
        $this->middleware('permission:bank_accounts.create')->only(['createAccount', 'storeAccount']);
    }

    public function banks(Request $request): Response
    {
        $banks = $this->bankingDataService->listBanks(
            $request->attributes->get('active_organization')->id,
            $request->input('search'),
            $request->input('per_page', 18),
        );

        return Inertia::render('treasury-cash/banking/banks/index', [
            'banks' => $banks,
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('treasury-cash/banking/banks/create', [
            'organization' => $request->attributes->get('active_organization'),
        ]);
    }

    public function store(StoreBankRequest $request): RedirectResponse
    {
        Bank::create([
            'organization_id' => $request->attributes->get('active_organization')->id,
            'code' => $request->validated('code'),
            'name' => $request->validated('name'),
            'short_name' => $request->validated('short_name'),
            'status' => (bool) $request->validated('status', true),
        ]);

        return redirect()->route('banks.index')->with('success', 'Bank created successfully.');
    }

    public function accounts(Request $request): Response
    {
        $accounts = $this->bankingDataService->listAccounts(
            $request->attributes->get('active_organization')->id,
            $request->input('search'),
            $request->input('per_page', 18),
        );

        return Inertia::render('treasury-cash/banking/accounts/index', [
            'accounts' => $accounts,
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }

    public function createAccount(Request $request): Response
    {
        $organizationId = $request->attributes->get('active_organization')->id;

        return Inertia::render('treasury-cash/banking/accounts/create', [
            'banks' => Bank::query()->where('organization_id', $organizationId)->where('status', true)->orderBy('name')->get(['id', 'code', 'name']),
            'financial_accounts' => FinancialAccount::query()->where('organization_id', $organizationId)->where('status', 'ACTIVE')->orderBy('account_no')->get(['id', 'account_no', 'name']),
            'branches' => Branch::query()->where('organization_id', $organizationId)->orderBy('name')->get(['id', 'code', 'name']),
        ]);
    }

    public function storeAccount(StoreBankAccountRequest $request): RedirectResponse
    {
        $organizationId = $request->attributes->get('active_organization')->id;
        $data = $request->validated();

        abort_unless(
            Bank::query()->whereKey($data['bank_id'])->where('organization_id', $organizationId)->exists()
            && FinancialAccount::query()->whereKey($data['financial_account_id'])->where('organization_id', $organizationId)->exists()
            && (!$data['branch_id'] || Branch::query()->whereKey($data['branch_id'])->where('organization_id', $organizationId)->exists()),
            404,
        );

        BankAccount::create([
            ...$data,
            'organization_id' => $organizationId,
            'is_reconcilable' => (bool) ($data['is_reconcilable'] ?? false),
        ]);

        return redirect()->route('bank-accounts.index')->with('success', 'Bank account created successfully.');
    }
}
