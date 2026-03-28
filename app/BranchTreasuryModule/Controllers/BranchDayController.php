<?php

namespace App\BranchTreasuryModule\Controllers;

use App\SystemAdministration\Models\Branch;
use App\BranchTreasuryModule\Models\BranchDay;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BranchDayController extends Controller
{
    public function index(Request $request)
    {
        $query = BranchDay::query()->with('branch');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('business_date', 'like', "%{$search}%")
                    ->orWhereHas('branch', function ($b) use ($search) {
                        $b->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $branchDays = $query->latest('business_date')
            ->paginate($request->per_page ?? 10)
            ->withQueryString();

        return Inertia::render('branch-cash-and-treasury/branch-days/list_branch_day_page', [
            'branchDays' => $branchDays,
            'filters' => $request->only([
                'search',
                'branch_id',
                'status',
                'per_page',
                'page'
            ]),
            'branches' => Branch::select('id', 'name')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('branch-cash-and-treasury/branch-days/open_branch_day_page', [
            'business_date' => now()->toDateString(),
            'branch_id' => auth()->user()->branch_id ?? 1,
            'branches' => Branch::all()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'business_date' => 'required|date'
        ]);

        $exists = BranchDay::where('branch_id', auth()->user()->branch_id)
            ->where('business_date', $request->business_date)
            ->exists();

        if ($exists) {
            return back()->withErrors('Branch day for this date already exists');
        }

        BranchDay::create([
            'branch_id' => auth()->user()->branch_id,
            'business_date' => $request->business_date,
            'opened_at' => now(),
            'opened_by' => auth()->id(),
            'status' => 'open'
        ]);

        return redirect()->route('branch-days.index')->with('success', 'Branch day opened');
    }

    public function closeBranchDay(BranchDay $branchDay)
    {
        $branchDay->update([
            'closed_at' => now(),
            'closed_by' => auth()->id(),
            'status' => 'closed'
        ]);

        return back()->with('success', 'Branch day closed');
    }

    public function show(BranchDay $branchDay)
    {
        $branchDay = $branchDay->load(['branch', 'openedBy', 'closedBy']);
        $sessions = $branchDay->tellerSessions()->with('teller')->get();
        return Inertia::render('branch-cash-and-treasury/branch-days/branch_day_status_page', [
            'branch_day' => $branchDay,
            'sessions' => $sessions
        ]);
    }
}