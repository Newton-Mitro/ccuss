<?php

namespace App\TreasuryAndCash\Controllers;

use App\Http\Controllers\Controller;
use App\TreasuryAndCash\Application\BankingDataService;
use App\TreasuryAndCash\Models\Bank;
use App\TreasuryAndCash\Requests\StoreBankRequest;
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
}
