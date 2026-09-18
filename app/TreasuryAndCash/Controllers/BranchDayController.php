<?php

namespace App\TreasuryAndCash\Controllers;

use App\Http\Controllers\Controller;
use App\SystemAdministration\Models\Branch;
use App\TreasuryAndCash\Application\BranchDayService;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Requests\OpenBranchDayRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class BranchDayController extends Controller
{
    public function __construct(private readonly BranchDayService $branchDayService)
    {
        $this->middleware('permission:branch_days.view')->only(['index', 'show']);
        $this->middleware('permission:branch_days.open')->only(['create', 'store']);
        $this->middleware('permission:branch_days.close')->only('close');
    }

    public function index(Request $request): Response
    {
        $organizationId = $this->organizationId($request);
        $branchDays = $this->branchDayService
            ->queryForOrganization($organizationId)
            ->with(['branch', 'openedBy', 'closedBy'])
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search')->trim();
                $query->whereHas('branch', fn($branch) => $branch
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%"));
            })
            ->when($request->filled('branch_id'), fn($query) => $query->where('branch_id', $request->integer('branch_id')))
            ->when($request->filled('status'), fn($query) => $query->where('status', strtoupper($request->string('status')->value())))
            ->latest('business_date')
            ->paginate($request->integer('per_page', 18))
            ->withQueryString();

        return Inertia::render('treasury-and-cash/branch-days/list_branch_day_page', [
            'branchDays' => $branchDays,
            'branches' => Branch::where('organization_id', $organizationId)->orderBy('name')->get(['id', 'code', 'name']),
            'filters' => $request->only(['search', 'branch_id', 'status', 'per_page', 'page']),
        ]);
    }

    public function create(Request $request): Response
    {
        $branch = Branch::where('organization_id', $this->organizationId($request))
            ->whereKey($request->integer('branch_id', $request->user()->branch_id))
            ->firstOrFail();

        return Inertia::render('treasury-and-cash/branch-days/open_branch_day_page', [
            'branch' => $branch,
            'business_date' => now()->toDateString(),
        ]);
    }

    public function store(OpenBranchDayRequest $request)
    {
        try {
            $branchDay = $this->branchDayService->open(
                $request->validated(),
                $this->organizationId($request),
                $request->user()->id,
            );
        } catch (RuntimeException $exception) {
            return back()->withInput()->with('error', $exception->getMessage());
        }

        return redirect()->route('branch-days.show', $branchDay)->with('success', 'Branch day opened successfully.');
    }

    public function show(Request $request, BranchDay $branchDay): Response
    {
        $this->authorizeOrganization($request, $branchDay);

        return Inertia::render('treasury-and-cash/branch-days/branch_day_status_page', [
            'branch_day' => $branchDay->load(['branch', 'openedBy', 'closedBy']),
            'sessions' => [],
        ]);
    }

    public function close(Request $request, BranchDay $branchDay)
    {
        $this->authorizeOrganization($request, $branchDay);

        try {
            $this->branchDayService->close($branchDay, $request->user()->id);
        } catch (RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return back()->with('success', 'Branch day closed successfully.');
    }

    private function organizationId(Request $request): int
    {
        return (int) $request->attributes->get('active_organization')->id;
    }

    private function authorizeOrganization(Request $request, BranchDay $branchDay): void
    {
        abort_unless($branchDay->organization_id === $this->organizationId($request), 404);
    }
}
