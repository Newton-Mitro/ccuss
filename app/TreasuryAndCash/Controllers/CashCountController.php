<?php

namespace App\TreasuryAndCash\Controllers;

use App\Http\Controllers\Controller;
use App\TreasuryAndCash\Application\CashCountService;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\CashCount;
use App\TreasuryAndCash\Models\CashDenomination;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Requests\StoreCashCountRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CashCountController extends Controller
{
    public function __construct(private readonly CashCountService $service)
    {
        $this->middleware('permission:cash_transactions.view')->only('index');
        $this->middleware('permission:cash_transactions.create')->only(['store', 'storeDenomination']);
    }

    public function index(Request $request): Response
    {
        $organizationId = (int) $request->attributes->get('active_organization')->id;
        $branchId = $request->user()->branch_id;

        return Inertia::render('treasury-cash/cash-counts/index', [
            'counts' => CashCount::query()
                ->whereHas('branchDay', fn($query) => $query->where('organization_id', $organizationId)->when($branchId, fn($branch) => $branch->where('branch_id', $branchId)))
                ->with(['cashLocation', 'branchDay', 'denominations.denomination'])
                ->latest('counted_at')->paginate(20)->withQueryString(),
            'branchDays' => BranchDay::query()->where('organization_id', $organizationId)->where('status', BranchDay::STATUS_OPEN)->when($branchId, fn($query) => $query->where('branch_id', $branchId))->latest('business_date')->get(['id', 'branch_id', 'business_date']),
            'locations' => CashLocation::query()->where('organization_id', $organizationId)->where('is_active', true)->when($branchId, fn($query) => $query->where('branch_id', $branchId))->orderBy('name')->get(['id', 'branch_id', 'code', 'name', 'type']),
            'denominations' => CashDenomination::query()->where('organization_id', $organizationId)->where('is_active', true)->orderBy('sort_order')->orderBy('value')->get(['id', 'currency', 'type', 'value', 'name']),
        ]);
    }

    public function store(StoreCashCountRequest $request)
    {
        $this->service->createCount($request->validated(), (int) $request->attributes->get('active_organization')->id, $request->user()->id);

        return back()->with('success', 'Cash count recorded successfully.');
    }

    public function storeDenomination(Request $request)
    {
        $data = $request->validate(['currency' => ['required', 'string', 'max:10'], 'type' => ['required', 'in:NOTE,COIN'], 'value' => ['required', 'numeric', 'gt:0'], 'name' => ['nullable', 'string', 'max:50']]);
        $this->service->createDenomination($data, (int) $request->attributes->get('active_organization')->id);

        return back()->with('success', 'Cash denomination created successfully.');
    }
}