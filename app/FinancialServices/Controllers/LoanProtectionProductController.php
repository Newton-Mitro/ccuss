<?php

namespace App\FinancialServices\Controllers;

use App\FinancialServices\Models\LoanProtectionProduct;
use App\FinancialServices\Requests\StoreLoanProtectionProductRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LoanProtectionProductController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:financial.loan-protection-products.view')->only('index');
        $this->middleware('permission:financial.loan-protection-products.manage')->only(['store', 'update']);
    }

    public function index(Request $request): Response
    {
        $organizationId = (int) $request->attributes->get('active_organization')->id;

        return Inertia::render('financial-services/loan-protection-products/index', [
            'products' => LoanProtectionProduct::query()
                ->where('organization_id', $organizationId)
                ->orderBy('code')
                ->get(),
            'can_manage' => $request->user()->hasPermission('financial.loan-protection-products.manage'),
        ]);
    }

    public function store(StoreLoanProtectionProductRequest $request)
    {
        LoanProtectionProduct::query()->create([
            ...$request->validated(),
            'organization_id' => (int) $request->attributes->get('active_organization')->id,
        ]);

        return back()->with('success', 'Credit-life product created.');
    }

    public function update(StoreLoanProtectionProductRequest $request, LoanProtectionProduct $loanProtectionProduct)
    {
        $this->authorizeOrganization($request, $loanProtectionProduct);
        $loanProtectionProduct->update($request->validated());

        return back()->with('success', 'Credit-life product updated.');
    }

    private function authorizeOrganization(Request $request, LoanProtectionProduct $product): void
    {
        abort_unless($product->organization_id === (int) $request->attributes->get('active_organization')->id, 404);
    }
}