<?php

namespace App\FinancialServices\Controllers;

use App\FinancialServices\Application\FinancialProductService;
use App\FinancialServices\Models\DepositProduct;
use App\FinancialServices\Models\DepositProductAccountMapping;
use App\FinancialServices\Models\LoanProduct;
use App\FinancialServices\Models\LoanProductAccountMapping;
use App\FinancialServices\Requests\StoreFinancialProductAccountMappingRequest;
use App\FinancialServices\Requests\StoreFinancialProductRequest;
use App\FinancialServices\Requests\UpdateFinancialProductRequest;
use App\GeneralAccounting\Models\LedgerAccount;
use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Model;
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
        $family = $this->family($request);
        $products = $this->productService
            ->queryForOrganization($this->organizationId($request), $family)
            ->when($family === 'deposit', fn($query) => $query->with('baseTerm'))
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
            'family' => $family,
        ]);
    }

    public function mappings(Request $request): Response
    {
        $organizationId = $this->organizationId($request);
        $family = $this->family($request);
        $status = $request->string('status')->toString();
        $mappingModel = $family === 'loan' ? LoanProductAccountMapping::class : DepositProductAccountMapping::class;
        $productModel = $family === 'loan' ? LoanProduct::class : DepositProduct::class;
        $mappingTable = $family === 'loan' ? 'loan_product_account_mappings' : 'deposit_product_account_mappings';
        $productForeignKey = $family === 'loan' ? 'loan_product_id' : 'deposit_product_id';

        $mappings = $mappingModel::query()
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
            ->when($request->integer('product_id') > 0, fn($query) => $query->where($productForeignKey, $request->integer('product_id')))
            ->when(in_array($status, ['active', 'inactive'], true), fn($query) => $query->where('status', $status === 'active'))
            ->orderBy($productModel::query()->select('code')->whereColumn(($family === 'loan' ? 'loan_products' : 'deposit_products') . '.id', $mappingTable . '.' . $productForeignKey))
            ->orderBy('transaction_type')
            ->paginate($request->integer('per_page') ?: 18)
            ->withQueryString();

        $products = $productModel::query()
            ->where('organization_id', $organizationId)
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        return Inertia::render('financial-services/product-account-mappings/index', [
            'mappings' => $mappings,
            'products' => $products,
            'filters' => $request->only(['search', 'product_id', 'status', 'per_page', 'page', 'family']),
            'family' => $family,
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('financial-services/products/form', [
            'family' => $this->family($request),
        ]);
    }

    public function store(StoreFinancialProductRequest $request)
    {
        $family = $this->family($request);
        $this->productService->create(
            $request->validated(),
            $this->organizationId($request),
            $family,
        );

        return redirect()->route("{$family}-products.index")
            ->with('success', 'Financial product created successfully.');
    }

    public function show(Request $request, int $financial_product): Response
    {
        $family = $this->family($request);
        $financialProduct = $this->resolveProduct($request, $financial_product, $family);
        $this->authorizeOrganization($request, $financialProduct);
        $relations = ['policy', 'accountMappings.debitAccount', 'accountMappings.creditAccount'];
        if ($family === 'deposit') {
            $relations[] = 'baseTerm';
        }

        return Inertia::render('financial-services/products/show', [
            'product' => $financialProduct->load($relations),
            'family' => $request->string('family')->toString(),
            'ledgerAccounts' => LedgerAccount::query()
                ->where('organization_id', $this->organizationId($request))
                ->where('status', true)
                ->orderBy('code')
                ->get(['id', 'code', 'name']),
        ]);
    }

    public function storeMapping(StoreFinancialProductAccountMappingRequest $request, int $financial_product)
    {
        $financialProduct = $this->resolveProduct($request, $financial_product, $this->family($request));
        $this->authorizeOrganization($request, $financialProduct);
        $financialProduct->accountMappings()->create($request->validated());

        return back()->with('success', 'Product account mapping created successfully.');
    }

    public function updateMapping(StoreFinancialProductAccountMappingRequest $request, int $financial_product, int $mapping)
    {
        $family = $this->family($request);
        $financialProduct = $this->resolveProduct($request, $financial_product, $family);
        $mappingModel = $family === 'loan' ? LoanProductAccountMapping::class : DepositProductAccountMapping::class;
        $mapping = $mappingModel::query()->findOrFail($mapping);
        $this->authorizeOrganization($request, $financialProduct);
        abort_unless($mapping->{$family === 'loan' ? 'loan_product_id' : 'deposit_product_id'} === $financialProduct->id, 404);
        $mapping->update($request->validated());

        return back()->with('success', 'Product account mapping updated successfully.');
    }

    public function destroyMapping(Request $request, int $financial_product, int $mapping)
    {
        $family = $this->family($request);
        $financialProduct = $this->resolveProduct($request, $financial_product, $family);
        $mappingModel = $family === 'loan' ? LoanProductAccountMapping::class : DepositProductAccountMapping::class;
        $mapping = $mappingModel::query()->findOrFail($mapping);
        $this->authorizeOrganization($request, $financialProduct);
        abort_unless($mapping->{$family === 'loan' ? 'loan_product_id' : 'deposit_product_id'} === $financialProduct->id, 404);
        $mapping->delete();

        return back()->with('success', 'Product account mapping deleted successfully.');
    }

    public function edit(Request $request, int $financial_product): Response
    {
        $family = $this->family($request);
        $financialProduct = $this->resolveProduct($request, $financial_product, $family);
        $this->authorizeOrganization($request, $financialProduct);
        $relations = $family === 'deposit' ? ['baseTerm', 'terms'] : [];

        return Inertia::render('financial-services/products/form', [
            'product' => $financialProduct->load($relations),
            'family' => $family,
        ]);
    }

    public function update(UpdateFinancialProductRequest $request, int $financial_product)
    {
        $family = $this->family($request);
        $financialProduct = $this->resolveProduct($request, $financial_product, $family);
        $this->authorizeOrganization($request, $financialProduct);
        $this->productService->update($financialProduct, $request->validated());

        return redirect()->route("{$family}-products.index")
            ->with('success', 'Financial product updated successfully.');
    }

    public function destroy(Request $request, int $financial_product)
    {
        $family = $this->family($request);
        $financialProduct = $this->resolveProduct($request, $financial_product, $family);
        $this->authorizeOrganization($request, $financialProduct);
        $this->productService->delete($financialProduct);

        return redirect()->route("{$family}-products.index")
            ->with('success', 'Financial product deleted successfully.');
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
        $family = $request->routeIs('loan-products.*', 'loan-product-policies.*', 'loan-product-account-mappings.*')
            ? 'loan'
            : ($request->routeIs('deposit-products.*', 'deposit-product-policies.*', 'deposit-product-account-mappings.*')
                ? 'deposit'
                : $request->string('family')->toString());
        abort_unless(in_array($family, ['deposit', 'loan'], true), 404);

        return $family;
    }

    private function resolveProduct(Request $request, int $id, string $family): Model
    {
        return $this->productService->queryForOrganization($this->organizationId($request), $family)->findOrFail($id);
    }
}
