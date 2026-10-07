<?php

namespace App\FinancialServices\Controllers;

use App\FinancialServices\Application\DefaultFineService;
use App\FinancialServices\Models\AccountDefaultRule;
use App\FinancialServices\Models\DepositProduct;
use App\FinancialServices\Models\LoanProduct;
use App\FinancialServices\Requests\StoreAccountDefaultRuleRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountDefaultRuleController extends Controller
{
    public function __construct(private readonly DefaultFineService $service)
    {
        $this->middleware('permission:financial.products.view')->only('index');
        $this->middleware('permission:financial.products.update')->only(['store', 'update']);
        $this->middleware('permission:financial.products.delete')->only('destroy');
    }

    public function index(Request $request): Response
    {
        $organizationId = $this->organizationId($request);

        return Inertia::render('financial-services/default-rules/index', [
            'rules' => AccountDefaultRule::query()->where('organization_id', $organizationId)->with('product:id,code,name')->latest('id')->get()->map(function (AccountDefaultRule $rule): array {
                return [...$rule->toArray(), 'financial_product_id' => $rule->product_id];
            }),
            'products' => DepositProduct::query()->where('organization_id', $organizationId)->where('status', true)->get(['id', 'code', 'name', 'category'])
                ->concat(LoanProduct::query()->where('organization_id', $organizationId)->where('status', true)->get(['id', 'code', 'name'])->map(fn(LoanProduct $product) => [...$product->toArray(), 'category' => 'LOAN']))
                ->sortBy('code')->values(),
        ]);
    }

    public function store(StoreAccountDefaultRuleRequest $request)
    {
        $this->service->createRule($request->validated(), $this->organizationId($request));

        return back()->with('success', 'Default rule created successfully.');
    }

    public function update(StoreAccountDefaultRuleRequest $request, AccountDefaultRule $accountDefaultRule)
    {
        $this->authorizeOrganization($request, $accountDefaultRule);
        $data = $request->validated();
        $productId = (int) ($data['financial_product_id'] ?? 0);
        $productClass = ($data['account_type'] ?? null) === 'LOAN' ? LoanProduct::class : DepositProduct::class;
        if ($productId && !$productClass::query()->where('organization_id', $this->organizationId($request))->whereKey($productId)->exists()) {
            abort(422, 'The selected product does not belong to the organization.');
        }
        unset($data['financial_product_id']);
        $data['product_type'] = $productId ? $productClass : null;
        $data['product_id'] = $productId ?: null;
        $accountDefaultRule->update($data);

        return back()->with('success', 'Default rule updated successfully.');
    }

    public function destroy(Request $request, AccountDefaultRule $accountDefaultRule)
    {
        $this->authorizeOrganization($request, $accountDefaultRule);
        abort_if($accountDefaultRule->defaultEvents()->exists(), 422, 'Rules with assessed events cannot be deleted.');
        $accountDefaultRule->delete();

        return back()->with('success', 'Default rule deleted successfully.');
    }

    private function organizationId(Request $request): int
    {
        return (int) $request->attributes->get('active_organization')->id;
    }

    private function authorizeOrganization(Request $request, AccountDefaultRule $rule): void
    {
        abort_unless($rule->organization_id === $this->organizationId($request), 404);
    }
}