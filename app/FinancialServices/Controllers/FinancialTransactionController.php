<?php

namespace App\FinancialServices\Controllers;

use App\FinancialServices\Application\FinancialTransactionService;
use App\FinancialServices\Models\FinancialTransaction;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\LoanAccount;
use App\FinancialServices\Models\AccountFine;
use App\FinancialServices\Requests\StoreFinancialTransactionRequest;
use App\FinancialServices\Requests\StoreFinancialTransferRequest;
use App\FinancialServices\Requests\StoreLoanDisbursementRequest;
use App\FinancialServices\Requests\StoreLoanRepaymentRequest;
use App\FinancialServices\Requests\StoreFinePaymentRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FinancialTransactionController extends Controller
{
    public function __construct(private readonly FinancialTransactionService $transactionService)
    {
        $this->middleware('permission:financial.transactions.view')->only(['index', 'show']);
        $this->middleware('permission:financial.transactions.create')->only(['store', 'storeTransfer', 'storeLoanDisbursement', 'storeLoanRepayment', 'storeFinePayment']);
        $this->middleware('permission:financial.transactions.post')->only('post');
        $this->middleware('permission:financial.transactions.reverse')->only('reverse');
    }

    public function index(Request $request): Response
    {
        $transactions = $this->transactionService
            ->queryForOrganization($this->organizationId($request))
            ->with('entries.financialAccount')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search')->trim();
                $query->where(fn($query) => $query
                    ->where('transaction_no', 'like', "%{$search}%")
                    ->orWhere('transaction_type', 'like', "%{$search}%"));
            })
            ->latest('id')
            ->paginate($request->integer('per_page', 18))
            ->withQueryString();

        return Inertia::render('financial-services/transactions/index', [
            'transactions' => $transactions,
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }

    public function workflow(Request $request, string $workflow): Response
    {
        abort_unless(in_array($workflow, ['transfer', 'loan-disbursement', 'loan-repayment', 'fine-payment'], true), 404);

        return Inertia::render('financial-services/transactions/workflow', [
            'workflow' => $workflow,
            'accounts' => $workflow === 'transfer'
                ? FinancialAccount::query()
                    ->where('organization_id', $this->organizationId($request))
                    ->whereIn('status', ['PENDING', 'ACTIVE'])
                    ->orderBy('account_no')
                    ->get(['id', 'account_no', 'name', 'account_type', 'balance'])
                : [],
            'loan_accounts' => in_array($workflow, ['loan-disbursement', 'loan-repayment'], true)
                ? LoanAccount::query()
                    ->whereHas('financialAccount', fn($query) => $query
                        ->where('organization_id', $this->organizationId($request)))
                    ->whereIn('status', $workflow === 'loan-disbursement' ? ['APPROVED', 'PARTIALLY_DISBURSED'] : ['ACTIVE', 'PARTIALLY_DISBURSED'])
                    ->with('customer:id,name')
                    ->orderBy('loan_no')
                    ->get(['id', 'loan_no', 'customer_id', 'principal_amount', 'disbursed_amount'])
                : [],
            'payout_accounts' => in_array($workflow, ['loan-disbursement', 'loan-repayment'], true)
                ? FinancialAccount::query()
                    ->where('organization_id', $this->organizationId($request))
                    ->whereIn('account_type', ['CASH', 'BANK'])
                    ->whereIn('status', ['PENDING', 'ACTIVE'])
                    ->orderBy('account_no')
                    ->get(['id', 'account_no', 'name', 'account_type', 'balance'])
                : [],
            'fines' => $workflow === 'fine-payment'
                ? AccountFine::query()
                    ->whereHas('financialAccount', fn($query) => $query->where('organization_id', $this->organizationId($request)))
                    ->whereIn('status', ['ASSESSED', 'PARTIALLY_PAID'])
                    ->with('financialAccount:id,account_no,name')
                    ->latest('assessed_at')
                    ->get(['id', 'financial_account_id', 'assessed_amount', 'paid_amount', 'waived_amount', 'status'])
                : [],
        ]);
    }

    public function storeTransfer(StoreFinancialTransferRequest $request)
    {
        $transaction = $this->transactionService->createTransfer(
            $request->validated(),
            $this->organizationId($request),
            $request->user()->id,
        );

        return redirect()->route('financial-transactions.show', $transaction)
            ->with('success', 'Account transfer created successfully.');
    }

    public function storeLoanDisbursement(StoreLoanDisbursementRequest $request)
    {
        $transaction = $this->transactionService->createLoanDisbursement(
            $request->validated(),
            $this->organizationId($request),
            $request->user()->id,
        );

        return redirect()->route('financial-transactions.show', $transaction)
            ->with('success', 'Loan disbursement created successfully.');
    }

    public function storeLoanRepayment(StoreLoanRepaymentRequest $request)
    {
        $transaction = $this->transactionService->createLoanRepayment(
            $request->validated(),
            $this->organizationId($request),
            $request->user()->id,
        );

        return redirect()->route('financial-transactions.show', $transaction)
            ->with('success', 'Loan repayment created successfully.');
    }

    public function storeFinePayment(StoreFinePaymentRequest $request)
    {
        $transaction = $this->transactionService->createFinePayment(
            $request->validated(),
            $this->organizationId($request),
            $request->user()->id,
        );

        return redirect()->route('financial-transactions.show', $transaction)
            ->with('success', 'Fine payment created successfully.');
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
            'transaction' => $financialTransaction->load(['entries.financialAccount', 'voucher.entries.account']),
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