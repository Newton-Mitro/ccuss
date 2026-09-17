<?php

namespace App\FinancialServices\Controllers;

use App\FinancialServices\Application\FinancialProductService;
use App\FinancialServices\Models\FinancialProduct;
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
        $this->middleware('permission:financial.products.view')->only(['index', 'show']);
        $this->middleware('permission:financial.products.create')->only(['create', 'store']);
        $this->middleware('permission:financial.products.update')->only(['edit', 'update']);
        $this->middleware('permission:financial.products.delete')->only('destroy');
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
            'product' => $financialProduct->load(['policy', 'accountMappings']),
        ]);
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