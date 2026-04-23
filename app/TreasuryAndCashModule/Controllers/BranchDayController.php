<?php

namespace App\TreasuryAndCashModule\Controllers;

use App\Http\Controllers\Controller;
use App\SystemAdministration\Models\Branch;
use App\TreasuryAndCashModule\Models\BranchDay;
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

        return Inertia::render('treasury-and-cash/branch-days/list_branch_day_page', [
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
        $authUserBranch = auth()->user()->branch;

        return Inertia::render('treasury-and-cash/branch-days/open_branch_day_page', [
            'business_date' => now()->toDateString(),
            'branch' => $authUserBranch
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'business_date' => 'required|date'
        ]);

        $branchId = auth()->user()->branch_id;

        // 🚫 Only one open branch day per branch
        $openBranchDay = BranchDay::where('branch_id', $branchId)
            ->where('status', 'open')
            ->first();

        if ($openBranchDay) {
            return back()->withErrors([
                'business_date' => 'There is already an open branch day on ' . $openBranchDay->business_date
            ]);
        }

        // 🚫 Prevent duplicate business date (extra safety beyond DB unique)
        $exists = BranchDay::where('branch_id', $branchId)
            ->where('business_date', $request->business_date)
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'business_date' => 'Branch day already exists for this date'
            ]);
        }

        BranchDay::create([
            'branch_id' => $branchId,
            'business_date' => $request->business_date,
            'opened_at' => now(),
            'status' => 'open'
        ]);

        return redirect()
            ->route('branch-days.index')
            ->with('success', 'Branch day opened successfully');
    }

    public function closeBranchDay(BranchDay $branchDay)
    {
        // 🔐 सुरक्षा: Ensure same branch
        if ($branchDay->branch_id !== auth()->user()->branch_id) {
            abort(403);
        }

        // 🚫 Already closed
        if ($branchDay->status === 'closed') {
            return back()->withErrors([
                'status' => 'Branch day is already closed'
            ]);
        }

        $branchDay->update([
            'closed_at' => now(),
            'status' => 'closed'
        ]);

        return back()->with('success', 'Branch day closed');
    }

    public function show(BranchDay $branchDay)
    {
        // 🔐 Branch isolation
        if ($branchDay->branch_id !== auth()->user()->branch_id) {
            abort(403);
        }

        $branchDay->load('branch');

        $sessions = $branchDay->tellerSessions()
            ->with('teller')
            ->latest()
            ->get();

        return Inertia::render('treasury-and-cash/branch-days/branch_day_status_page', [
            'branch_day' => $branchDay,
            'sessions' => $sessions
        ]);
    }
}