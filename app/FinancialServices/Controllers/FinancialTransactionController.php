<?php

namespace App\FinancialServices\Controllers;

use App\FinancialServices\Application\FinancialTransactionService;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialTransaction;
use App\FinancialServices\Requests\StoreFinancialTransactionRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FinancialTransactionController extends Controller
{
    public function __construct(private readonly FinancialTransactionService $transactionService)
    {
        $this->middleware('permission:financial.transactions.view')->only(['index', 'show']);
        $this->middleware('permission:financial.transactions.create')->only(['create', 'store']);
        $this->middleware('permission:financial.transactions.post')->only('post');
        $this->middleware('permission:financial.transactions.reverse')->only('reverse');
    }

    public function index(Request $request): Response
    {
        $transactions = $this->transactionService
            ->queryForOrganization($this->organizationId($request))
            ->with('financialAccount')
            ->latest('id')
            ->paginate($request->integer('per_page', 18))
            ->withQueryString();

        return Inertia::render('financial-services/transactions/index', [
            'transactions' => $transactions,
            'filters' => $request->only(['per_page', 'page']),
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('financial-services/transactions/form', [
            'accounts' => FinancialAccount::query()->where('organization_id', $this->organizationId($request))->whereIn('status', ['PENDING', 'ACTIVE'])->orderBy('account_no')->get(['id', 'account_no', 'name', 'account_type', 'balance']),
        ]);
    }

    public function store(StoreFinancialTransactionRequest $request)
    {
        $transaction = $this->transactionService->create($request->validated(), $this->organizationId($request), $request->user()->id);

        return redirect()->route('financial-transactions.show', $transaction)->with('success', 'Financial transaction created successfully.');
    }

    public function show(Request $request, FinancialTransaction $financialTransaction): Response
    {
        $this->authorizeOrganization($request, $financialTransaction);

        return Inertia::render('financial-services/transactions/show', [
            'transaction' => $financialTransaction->load(['financialAccount', 'entries']),
        ]);
    }

    public function post(Request $request, FinancialTransaction $financialTransaction)
    {
        $this->authorizeOrganization($request, $financialTransaction);
        $this->transactionService->post($financialTransaction, $this->organizationId($request), $request->user()->id);

        return back()->with('success', 'Financial transaction posted successfully.');
    }

    public function reverse(Request $request, FinancialTransaction $financialTransaction)
    {
        $this->authorizeOrganization($request, $financialTransaction);
        $this->transactionService->reverse($financialTransaction, $this->organizationId($request));

        return back()->with('success', 'Financial transaction reversed successfully.');
    }

    private function organizationId(Request $request): int
    {
        return (int) $request->attributes->get('active_organization')->id;
    }

    private function authorizeOrganization(Request $request, FinancialTransaction $transaction): void
    {
        abort_unless($transaction->organization_id === $this->organizationId($request), 404);
    }
}