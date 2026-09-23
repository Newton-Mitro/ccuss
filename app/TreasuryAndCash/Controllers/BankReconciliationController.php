<?php

namespace App\TreasuryAndCash\Controllers;

use App\Http\Controllers\Controller;
use App\TreasuryAndCash\Application\BankReconciliationService;
use App\TreasuryAndCash\Models\BankAccount;
use App\TreasuryAndCash\Models\BankReconciliation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BankReconciliationController extends Controller
{
    public function __construct(private readonly BankReconciliationService $service)
    {
        $this->middleware('permission:bank_transactions.view')->only('index');
        $this->middleware('permission:bank_transactions.create')->only('store');
        $this->middleware('permission:bank_transactions.post')->only('finalize');
    }

    public function index(Request $request): Response
    {
        $organizationId = (int) $request->attributes->get('active_organization')->id;
        return Inertia::render('treasury-cash/bank-reconciliations/index', [
            'reconciliations' => BankReconciliation::query()->whereHas('bankAccount', fn($query) => $query->where('organization_id', $organizationId))->with('bankAccount')->latest('statement_date')->paginate(20),
            'accounts' => BankAccount::query()->where('organization_id', $organizationId)->where('is_reconcilable', true)->where('status', 'ACTIVE')->orderBy('account_name')->get(['id', 'account_name', 'account_number']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate(['bank_account_id' => ['required', 'integer', 'exists:bank_accounts,id'], 'statement_date' => ['required', 'date'], 'statement_balance' => ['required', 'numeric']]);
        $this->service->createOrUpdate($data, (int) $request->attributes->get('active_organization')->id);
        return back()->with('success', 'Bank reconciliation session saved.');
    }

    public function finalize(Request $request, BankReconciliation $bankReconciliation)
    {
        $this->service->finalize($bankReconciliation, (int) $request->attributes->get('active_organization')->id, $request->user()->id);
        return back()->with('success', 'Bank reconciliation finalized.');
    }
}