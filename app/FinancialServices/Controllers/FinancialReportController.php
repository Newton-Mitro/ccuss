<?php

namespace App\FinancialServices\Controllers;

use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\DepositProduct;
use App\FinancialServices\Models\LoanProduct;
use App\FinancialServices\Models\FinancialTransaction;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FinancialReportController extends Controller
{
    public function dashboard(Request $request): Response
    {
        $organizationId = $this->organizationId($request);

        return Inertia::render('financial-services/dashboard', [
            'metrics' => [
                'depositProducts' => DepositProduct::where('organization_id', $organizationId)->where('status', true)->count(),
                'loanProducts' => LoanProduct::where('organization_id', $organizationId)->where('status', true)->count(),
                'accounts' => FinancialAccount::where('organization_id', $organizationId)->count(),
                'activeAccounts' => FinancialAccount::where('organization_id', $organizationId)->where('status', 'ACTIVE')->count(),
                'postedTransactions' => FinancialTransaction::where('organization_id', $organizationId)->where('status', 'POSTED')->count(),
            ],
            'recentTransactions' => FinancialTransaction::where('organization_id', $organizationId)->with('entries.financialAccount')->latest('id')->limit(8)->get(),
        ]);
    }

    public function productSummary(Request $request): Response
    {
        $organizationId = $this->organizationId($request);
        $deposits = DepositProduct::where('organization_id', $organizationId)
            ->withCount('financialAccounts')
            ->withSum('financialAccounts', 'balance')
            ->orderBy('category')
            ->get();
        $loans = LoanProduct::where('organization_id', $organizationId)
            ->withCount('financialAccounts')
            ->withSum('financialAccounts', 'balance')
            ->orderBy('name')
            ->get();
        $products = $deposits->concat($loans)->values();

        return Inertia::render('financial-services/reports/product-summary', ['products' => $products]);
    }

    public function accountBalances(Request $request): Response
    {
        $organizationId = $this->organizationId($request);
        [$productFamily, $productId] = array_pad(explode(':', $request->string('product_id')->toString(), 2), 2, null);
        $productType = $productFamily === 'loan' ? LoanProduct::class : DepositProduct::class;
        $accounts = FinancialAccount::where('organization_id', $organizationId)
            ->when($productId !== null && ctype_digit($productId), fn($query) => $query->where('product_type', $productType)->where('product_id', (int) $productId))
            ->with('product')
            ->orderByDesc('balance')
            ->paginate($request->integer('per_page') ?: 25)
            ->withQueryString();

        $products = DepositProduct::where('organization_id', $organizationId)->get(['id', 'code', 'name'])
            ->map(fn(DepositProduct $product) => ['id' => 'deposit:' . $product->id, 'code' => $product->code, 'name' => $product->name])
            ->concat(LoanProduct::where('organization_id', $organizationId)->get(['id', 'code', 'name'])
                ->map(fn(LoanProduct $product) => ['id' => 'loan:' . $product->id, 'code' => $product->code, 'name' => $product->name]))
            ->values();

        return Inertia::render('financial-services/reports/account-balances', [
            'accounts' => $accounts,
            'products' => $products,
            'filters' => $request->only(['product_id', 'per_page', 'page']),
        ]);
    }

    public function transactions(Request $request): Response
    {
        $status = $request->string('status')->toString();
        $allowedStatuses = ['PENDING', 'POSTED', 'REVERSED', 'CANCELLED'];

        $transactions = FinancialTransaction::where('organization_id', $this->organizationId($request))
            ->when(in_array($status, $allowedStatuses, true), fn($query) => $query->where('status', $status))
            ->with('entries.financialAccount')
            ->latest('transaction_date')
            ->paginate($request->integer('per_page') ?: 25)
            ->withQueryString();

        return Inertia::render('financial-services/reports/transactions', [
            'transactions' => $transactions,
            'filters' => $request->only(['status', 'per_page', 'page']),
        ]);
    }

    private function organizationId(Request $request): int
    {
        return (int) $request->attributes->get('active_organization')->id;
    }
}