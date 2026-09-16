<?php

namespace App\GeneralAccounting\Controllers;

use App\GeneralAccounting\Application\CostCenterService;
use App\GeneralAccounting\Models\CostCenter;
use App\GeneralAccounting\Requests\StoreCostCenterRequest;
use App\GeneralAccounting\Requests\UpdateCostCenterRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CostCenterController extends Controller
{
    public function __construct(private readonly CostCenterService $costCenterService)
    {
        $this->middleware('permission:accounting.cost_centers.view')->only('index');
        $this->middleware('permission:accounting.cost_centers.create')->only(['create', 'store']);
        $this->middleware('permission:accounting.cost_centers.update')->only(['edit', 'update']);
        $this->middleware('permission:accounting.cost_centers.delete')->only('destroy');
    }

    public function index(Request $request): Response
    {
        $costCenters = $this->organizationQuery($request)
            ->with('parent')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search')->trim();
                $query->where(function ($query) use ($search) {
                    $query->where('code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%");
                });
            })
            ->orderBy('code')
            ->paginate($request->integer('per_page', 18))
            ->withQueryString();

        return Inertia::render('general-accounting/cost-centers/index', [
            'costCenters' => $costCenters,
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('general-accounting/cost-centers/form', [
            'parents' => $this->organizationQuery($request)->orderBy('code')->get(['id', 'code', 'name']),
        ]);
    }

    public function store(StoreCostCenterRequest $request)
    {
        try {
            $data = $request->validated();
            $data['organization_id'] = $request->attributes->get('active_organization')->id;
            $this->costCenterService->create($data);
        } catch (\InvalidArgumentException | \RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        return redirect()->route('cost-centers.index')->with('success', 'Cost center created successfully.');
    }

    public function edit(Request $request, CostCenter $costCenter): Response
    {
        $this->authorizeOrganization($request, $costCenter);

        return Inertia::render('general-accounting/cost-centers/form', [
            'costCenter' => $costCenter,
            'parents' => $this->organizationQuery($request)
                ->where('id', '!=', $costCenter->id)
                ->orderBy('code')
                ->get(['id', 'code', 'name']),
        ]);
    }

    public function update(UpdateCostCenterRequest $request, CostCenter $costCenter)
    {
        $this->authorizeOrganization($request, $costCenter);

        try {
            $this->costCenterService->update($costCenter, $request->validated());
        } catch (\InvalidArgumentException | \RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        return redirect()->route('cost-centers.index')->with('success', 'Cost center updated successfully.');
    }

    public function destroy(Request $request, CostCenter $costCenter)
    {
        $this->authorizeOrganization($request, $costCenter);

        try {
            $this->costCenterService->delete($costCenter);
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return redirect()->route('cost-centers.index')->with('success', 'Cost center deleted successfully.');
    }

    private function organizationQuery(Request $request)
    {
        return CostCenter::query()->where(
            'organization_id',
            $request->attributes->get('active_organization')->id,
        );
    }

    private function authorizeOrganization(Request $request, CostCenter $costCenter): void
    {
        abort_unless(
            $costCenter->organization_id === $request->attributes->get('active_organization')->id,
            404,
        );
    }
}
