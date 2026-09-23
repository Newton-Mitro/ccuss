<?php

namespace App\FinancialServices\Controllers;

use App\FinancialServices\Application\DefaultFineService;
use App\FinancialServices\Models\AccountDefaultRule;
use App\FinancialServices\Models\FinancialProduct;
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
            'rules' => AccountDefaultRule::query()->where('organization_id', $organizationId)->with('product:id,code,name')->latest('id')->get(),
            'products' => FinancialProduct::query()->where('organization_id', $organizationId)->where('status', true)->orderBy('code')->get(['id', 'code', 'name']),
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
        if (($data['financial_product_id'] ?? null) && !FinancialProduct::query()->where('organization_id', $this->organizationId($request))->whereKey($data['financial_product_id'])->exists()) {
            abort(422, 'The selected product does not belong to the organization.');
        }
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