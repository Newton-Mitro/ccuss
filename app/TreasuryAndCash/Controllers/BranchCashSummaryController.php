<?php

namespace App\TreasuryAndCash\Controllers;

use App\Http\Controllers\Controller;
use App\TreasuryAndCash\Application\BranchCashSummaryService;
use App\TreasuryAndCash\Models\BranchCashSummary;
use App\TreasuryAndCash\Models\BranchDay;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BranchCashSummaryController extends Controller
{
    public function __construct(private readonly BranchCashSummaryService $service)
    {
        $this->middleware('permission:cash_transactions.view')->only('index');
        $this->middleware('permission:cash_transactions.post')->only('calculate');
    }

    public function index(Request $request): Response
    {
        $organizationId = (int) $request->attributes->get('active_organization')->id;
        $branchId = $request->user()->branch_id;
        return Inertia::render('treasury-cash/branch-summaries/index', [
            'summaries' => BranchCashSummary::query()->whereHas('branchDay', fn($query) => $query->where('organization_id', $organizationId)->when($branchId, fn($branch) => $branch->where('branch_id', $branchId)))->with('branchDay')->latest()->paginate(20),
            'branchDays' => BranchDay::query()->where('organization_id', $organizationId)->when($branchId, fn($query) => $query->where('branch_id', $branchId))->latest('business_date')->get(['id', 'business_date', 'status']),
        ]);
    }

    public function calculate(Request $request, BranchDay $branchDay)
    {
        $summary = $this->service->calculate($branchDay, (int) $request->attributes->get('active_organization')->id);
        return back()->with('success', 'Branch cash summary calculated.')->with('summary_id', $summary->id);
    }
}