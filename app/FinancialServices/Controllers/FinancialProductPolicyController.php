<?php

namespace App\FinancialServices\Controllers;

use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Requests\StoreFinancialProductPolicyRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FinancialProductPolicyController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:financial.policies.view')->only('index');
        $this->middleware('permission:financial.policies.manage')->only(['edit', 'store']);
    }

    public function index(Request $request): Response
    {
        $products = FinancialProduct::query()
            ->where('organization_id', $this->organizationId($request))
            ->with('policy')
            ->orderBy('category')
            ->orderBy('name')
            ->paginate($request->integer('per_page', 18))
            ->withQueryString();

        return Inertia::render('financial-services/product-policies/index', [
            'products' => $products,
            'filters' => $request->only(['per_page', 'page']),
        ]);
    }

    public function edit(Request $request, FinancialProduct $financialProduct): Response
    {
        $this->authorizeOrganization($request, $financialProduct);

        return Inertia::render('financial-services/product-policies/form', [
            'product' => $financialProduct,
            'policy' => $financialProduct->policy,
        ]);
    }

    public function store(StoreFinancialProductPolicyRequest $request, FinancialProduct $financialProduct)
    {
        $this->authorizeOrganization($request, $financialProduct);

        $financialProduct->policy()->updateOrCreate(
            ['financial_product_id' => $financialProduct->id],
            $request->validated(),
        );

        return redirect()->route('financial-product-policies.index')
            ->with('success', 'Financial product policy saved successfully.');
    }

    private function organizationId(Request $request): int
    {
        return (int) $request->attributes->get('active_organization')->id;
    }

    private function authorizeOrganization(Request $request, FinancialProduct $product): void
    {
        abort_unless($product->organization_id === $this->organizationId($request), 404);
    }
}