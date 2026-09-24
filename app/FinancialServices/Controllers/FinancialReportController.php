<?php

namespace App\FinancialServices\Controllers;

use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
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
                'products' => FinancialProduct::where('organization_id', $organizationId)->where('status', true)->count(),
                'accounts' => FinancialAccount::where('organization_id', $organizationId)->count(),
                'activeAccounts' => FinancialAccount::where('organization_id', $organizationId)->where('status', 'ACTIVE')->count(),
                'postedTransactions' => FinancialTransaction::where('organization_id', $organizationId)->where('status', 'POSTED')->count(),
            ],
            'recentTransactions' => FinancialTransaction::where('organization_id', $organizationId)->with('entries.financialAccount')->latest('id')->limit(8)->get(),
        ]);
    }

    public function productSummary(Request $request): Response
    {
        $products = FinancialProduct::where('organization_id', $this->organizationId($request))
            ->withCount('financialAccounts')
            ->withSum('financialAccounts', 'balance')
            ->orderBy('category')
            ->get();

        return Inertia::render('financial-services/reports/product-summary', ['products' => $products]);
    }

    public function accountBalances(Request $request): Response
    {
        $organizationId = $this->organizationId($request);
        $accounts = FinancialAccount::where('organization_id', $organizationId)
            ->when($request->integer('product_id') > 0, fn($query) => $query->where('financial_product_id', $request->integer('product_id')))
            ->with('product')
            ->orderByDesc('balance')
            ->paginate($request->integer('per_page') ?: 25)
            ->withQueryString();

        $products = FinancialProduct::where('organization_id', $organizationId)
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

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