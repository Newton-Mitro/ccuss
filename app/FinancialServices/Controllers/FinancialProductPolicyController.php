<?php

namespace App\FinancialServices\Controllers;

use App\FinancialServices\Models\DepositProduct;
use App\FinancialServices\Models\LoanProduct;
use App\FinancialServices\Requests\StoreFinancialProductPolicyRequest;
use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Model;
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
        $family = $this->family($request);
        $productModel = $family === 'loan' ? LoanProduct::class : DepositProduct::class;
        $products = $productModel::query()
            ->where('organization_id', $this->organizationId($request))
            ->with('policy')
            ->when($family === 'deposit', fn($query) => $query->orderBy('category'))
            ->orderBy('name')
            ->paginate($request->integer('per_page', 18))
            ->withQueryString();

        return Inertia::render('financial-services/product-policies/index', [
            'products' => $products,
            'filters' => $request->only(['per_page', 'page', 'family']),
            'family' => $family,
        ]);
    }

    public function edit(Request $request, int $financial_product): Response
    {
        $family = $this->family($request);
        $productModel = $family === 'loan' ? LoanProduct::class : DepositProduct::class;
        $financialProduct = $productModel::query()->where('organization_id', $this->organizationId($request))->findOrFail($financial_product);
        $this->authorizeOrganization($request, $financialProduct);

        return Inertia::render('financial-services/product-policies/form', [
            'product' => $financialProduct,
            'policy' => $financialProduct->policy,
            'family' => $family,
        ]);
    }

    public function store(StoreFinancialProductPolicyRequest $request, int $financial_product)
    {
        $family = $this->family($request);
        $productModel = $family === 'loan' ? LoanProduct::class : DepositProduct::class;
        $financialProduct = $productModel::query()->where('organization_id', $this->organizationId($request))->findOrFail($financial_product);
        $this->authorizeOrganization($request, $financialProduct);

        $financialProduct->policy()->updateOrCreate([], $request->validated());

        return redirect()->route("{$family}-product-policies.index")
            ->with('success', 'Financial product policy saved successfully.');
    }

    private function organizationId(Request $request): int
    {
        return (int) $request->attributes->get('active_organization')->id;
    }

    private function authorizeOrganization(Request $request, Model $product): void
    {
        abort_unless($product->organization_id === $this->organizationId($request), 404);
    }

    private function family(Request $request): string
    {
        $family = $request->routeIs('loan-product-policies.*')
            ? 'loan'
            : ($request->routeIs('deposit-product-policies.*') ? 'deposit' : $request->string('family')->toString());
        abort_unless(in_array($family, ['deposit', 'loan'], true), 404);

        return $family;
    }
}