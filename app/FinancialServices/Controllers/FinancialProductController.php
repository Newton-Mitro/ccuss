<?php

namespace App\FinancialServices\Controllers;

use App\FinancialServices\Application\FinancialProductService;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\FinancialProductAccountMapping;
use App\GeneralAccounting\Models\LedgerAccount;
use App\FinancialServices\Requests\StoreFinancialProductAccountMappingRequest;
use App\FinancialServices\Requests\StoreFinancialProductRequest;
use App\FinancialServices\Requests\UpdateFinancialProductRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FinancialProductController extends Controller
{
    public function __construct(private readonly FinancialProductService $productService)
    {
        $this->middleware('permission:financial.products.view')->only(['index', 'show', 'mappings']);
        $this->middleware('permission:financial.products.create')->only(['create', 'store']);
        $this->middleware('permission:financial.products.update')->only(['edit', 'update']);
        $this->middleware('permission:financial.products.delete')->only('destroy');
        $this->middleware('permission:financial.products.mappings.manage')->only(['storeMapping', 'updateMapping', 'destroyMapping']);
    }

    public function index(Request $request): Response
    {
        $products = $this->productService
            ->queryForOrganization($this->organizationId($request))
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search')->trim();
                $query->where(fn($query) => $query
                    ->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%"));
            })
            ->orderBy('code')
            ->paginate($request->integer('per_page', 18))
            ->withQueryString();

        return Inertia::render('financial-services/products/index', [
            'products' => $products,
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }

    public function mappings(Request $request): Response
    {
        $organizationId = $this->organizationId($request);
        $status = $request->string('status')->toString();

        $mappings = FinancialProductAccountMapping::query()
            ->whereHas('product', fn($query) => $query->where('organization_id', $organizationId))
            ->with(['product', 'debitAccount', 'creditAccount'])
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search')->trim();
                $query->where(function ($query) use ($search) {
                    $query->where('transaction_type', 'like', "%{$search}%")
                        ->orWhereHas('product', fn($product) => $product
                            ->where('code', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%"));
                });
            })
            ->when($request->integer('product_id') > 0, fn($query) => $query->where('financial_product_id', $request->integer('product_id')))
            ->when(in_array($status, ['active', 'inactive'], true), fn($query) => $query->where('status', $status === 'active'))
            ->orderBy(FinancialProduct::query()->select('code')->whereColumn('financial_products.id', 'financial_product_account_mappings.financial_product_id'))
            ->orderBy('transaction_type')
            ->paginate($request->integer('per_page') ?: 18)
            ->withQueryString();

        $products = FinancialProduct::query()
            ->where('organization_id', $organizationId)
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        return Inertia::render('financial-services/product-account-mappings/index', [
            'mappings' => $mappings,
            'products' => $products,
            'filters' => $request->only(['search', 'product_id', 'status', 'per_page', 'page']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('financial-services/products/form');
    }

    public function store(StoreFinancialProductRequest $request)
    {
        $this->productService->create(
            $request->validated(),
            $this->organizationId($request),
        );

        return redirect()->route('financial-products.index')->with('success', 'Financial product created successfully.');
    }

    public function show(Request $request, FinancialProduct $financialProduct): Response
    {
        $this->authorizeOrganization($request, $financialProduct);

        return Inertia::render('financial-services/products/show', [
            'product' => $financialProduct->load(['policy', 'accountMappings.debitAccount', 'accountMappings.creditAccount']),
            'ledgerAccounts' => LedgerAccount::query()
                ->where('organization_id', $this->organizationId($request))
                ->where('status', true)
                ->orderBy('code')
                ->get(['id', 'code', 'name']),
        ]);
    }

    public function storeMapping(StoreFinancialProductAccountMappingRequest $request, FinancialProduct $financialProduct)
    {
        $this->authorizeOrganization($request, $financialProduct);
        $financialProduct->accountMappings()->create($request->validated());

        return back()->with('success', 'Product account mapping created successfully.');
    }

    public function updateMapping(StoreFinancialProductAccountMappingRequest $request, FinancialProduct $financialProduct, FinancialProductAccountMapping $mapping)
    {
        $this->authorizeOrganization($request, $financialProduct);
        abort_unless($mapping->financial_product_id === $financialProduct->id, 404);
        $mapping->update($request->validated());

        return back()->with('success', 'Product account mapping updated successfully.');
    }

    public function destroyMapping(Request $request, FinancialProduct $financialProduct, FinancialProductAccountMapping $mapping)
    {
        $this->authorizeOrganization($request, $financialProduct);
        abort_unless($mapping->financial_product_id === $financialProduct->id, 404);
        $mapping->delete();

        return back()->with('success', 'Product account mapping deleted successfully.');
    }

    public function edit(Request $request, FinancialProduct $financialProduct): Response
    {
        $this->authorizeOrganization($request, $financialProduct);

        return Inertia::render('financial-services/products/form', [
            'product' => $financialProduct,
        ]);
    }

    public function update(UpdateFinancialProductRequest $request, FinancialProduct $financialProduct)
    {
        $this->authorizeOrganization($request, $financialProduct);
        $this->productService->update($financialProduct, $request->validated());

        return redirect()->route('financial-products.index')->with('success', 'Financial product updated successfully.');
    }

    public function destroy(Request $request, FinancialProduct $financialProduct)
    {
        $this->authorizeOrganization($request, $financialProduct);
        $this->productService->delete($financialProduct);

        return redirect()->route('financial-products.index')->with('success', 'Financial product deleted successfully.');
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