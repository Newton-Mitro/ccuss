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
        $this->middleware('permission:financial.loan-protection-products.manage')->only(['create', 'store', 'edit', 'update']);
    }

    public function index(Request $request): Response
    {
        $organizationId = (int) $request->attributes->get('active_organization')->id;
        $search = $request->string('search')->trim()->toString();

        return Inertia::render('financial-services/loan-protection-products/index', [
            'products' => LoanProtectionProduct::query()
                ->where('organization_id', $organizationId)
                ->when($search !== '', fn($query) => $query->where(function ($query) use ($search): void {
                    $query->where('code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%");
                }))
                ->orderBy('code')
                ->paginate($request->integer('per_page', 18))
                ->withQueryString(),
            'can_manage' => $request->user()->hasPermission('financial.loan-protection-products.manage'),
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('financial-services/loan-protection-products/form', [
            'product' => null,
        ]);
    }

    public function edit(Request $request, LoanProtectionProduct $loanProtectionProduct): Response
    {
        $this->authorizeOrganization($request, $loanProtectionProduct);

        return Inertia::render('financial-services/loan-protection-products/form', [
            'product' => $loanProtectionProduct,
        ]);
    }

    public function store(StoreLoanProtectionProductRequest $request)
    {
        LoanProtectionProduct::query()->create([
            ...$request->validated(),
            'organization_id' => (int) $request->attributes->get('active_organization')->id,
        ]);

        return redirect()->route('loan-protection-products.index')
            ->with('success', 'Credit-life product created.');
    }

    public function update(StoreLoanProtectionProductRequest $request, LoanProtectionProduct $loanProtectionProduct)
    {
        $this->authorizeOrganization($request, $loanProtectionProduct);
        $loanProtectionProduct->update($request->validated());

        return redirect()->route('loan-protection-products.index')
            ->with('success', 'Credit-life product updated.');
    }

    private function authorizeOrganization(Request $request, LoanProtectionProduct $product): void
    {
        abort_unless($product->organization_id === (int) $request->attributes->get('active_organization')->id, 404);
    }
}