<?php

namespace App\CashTreasuryModule\Controllers;

use App\Branch\Models\Branch;
use App\CashTreasuryModule\Models\BranchDay;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class BranchDayController extends Controller
{
    public function index()
    {
        $branchDay = BranchDay::where('branch_id', auth()->user()->branch_id)
            ->latest()
            ->first();

        return Inertia::render('cash-management/branch-day/status', [
            'branch_day' => $branchDay
        ]);
    }

    public function create()
    {
        return Inertia::render('cash-management/branch-day/open', [
            'business_date' => now()->toDateString(),
            'branch_id' => auth()->user()->branch_id ?? 1,
            'branches' => Branch::all()
        ]);
    }

    public function open(Request $request)
    {
        $request->validate([
            'business_date' => 'required|date'
        ]);

        $exists = BranchDay::where('branch_id', auth()->user()->branch_id)
            ->where('status', 'OPEN')
            ->exists();

        if ($exists) {
            return back()->withErrors('Branch day already open');
        }

        BranchDay::create([
            'branch_id' => auth()->user()->branch_id,
            'business_date' => $request->business_date,
            'opened_at' => now(),
            'opened_by' => auth()->id(),
            'status' => 'OPEN'
        ]);

        return redirect()->back()->with('success', 'Branch day opened');
    }

    public function close()
    {
        $branchDay = BranchDay::where('branch_id', auth()->user()->branch_id)
            ->where('status', 'OPEN')
            ->firstOrFail();

        $branchDay->update([
            'closed_at' => now(),
            'closed_by' => auth()->id(),
            'status' => 'CLOSED'
        ]);

        return back()->with('success', 'Branch day closed');
    }

    public function history(Request $request)
    {
        $branchId = $request->query('branch_id', Auth::user()->branch_id ?? 1);
        $fromDate = $request->query('from_date');
        $toDate = $request->query('to_date');

        $query = BranchDay::where('branch_id', $branchId);

        if ($fromDate) {
            $query->whereDate('business_date', '>=', $fromDate);
        }
        if ($toDate) {
            $query->whereDate('business_date', '<=', $toDate);
        }

        $history = $query->orderByDesc('business_date')->get();

        return Inertia::render('cash-management/branch-day/history', [
            'history' => $history,
            'branch_id' => $branchId,
            'from_date' => $fromDate,
            'to_date' => $toDate
        ]);
    }
}