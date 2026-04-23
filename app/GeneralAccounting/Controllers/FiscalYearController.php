<?php

namespace App\GeneralAccounting\Controllers;

use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\FiscalYear;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class FiscalYearController
{
    public function index(Request $request): Response
    {
        $query = FiscalYear::query();

        // 🔍 Search
        if ($request->filled('search')) {
            $query->where('code', 'like', "%{$request->search}%");
        }

        // ✅ Status filter (UPDATED)
        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'open') {
                $query->where('is_closed', false);
            } elseif ($request->status === 'closed') {
                $query->where('is_closed', true);
            }
        }

        $perPage = $request->input('per_page', 20);

        $fiscalYears = $query->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('general-accounting/fiscal-years/index', [
            'fiscalYears' => $fiscalYears,
            'filters' => $request->only(['search', 'status', 'per_page', 'page']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('general-accounting/fiscal-years/fiscal-year-edit');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|unique:fiscal_years,code',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_closed' => 'boolean', // ✅ FIXED
        ]);

        $fiscalYear = DB::transaction(function () use ($validated) {

            // 🔥 Only one active fiscal year allowed
            if (empty($validated['is_closed'])) {
                FiscalYear::where('is_closed', false)->update(['is_closed' => true]);
            }

            $fiscalYear = FiscalYear::create($validated);

            // Auto-generate periods
            $this->generateFiscalPeriods($fiscalYear);
            return $fiscalYear;
        });

        return redirect()
            ->route('fiscal-years.index')
            ->with('success', $fiscalYear->code . ' Fiscal Year created with periods.');
    }

    public function edit(FiscalYear $fiscalYear): Response
    {
        return Inertia::render('general-accounting/fiscal-years/fiscal-year-edit', [
            'fiscalYear' => $fiscalYear,
        ]);
    }

    public function update(Request $request, FiscalYear $fiscalYear)
    {
        $validated = $request->validate([
            'code' => 'required|unique:fiscal_years,code,' . $fiscalYear->id,
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_closed' => 'boolean', // ✅ FIXED
        ]);

        DB::transaction(function () use ($validated, $fiscalYear) {

            // 🔥 Ensure only one open fiscal year
            if (empty($validated['is_closed'])) {
                FiscalYear::where('id', '!=', $fiscalYear->id)
                    ->where('is_closed', false)
                    ->update(['is_closed' => true]);
            }

            $fiscalYear->update($validated);

            // 🔥 Sync status with periods if needed
            $this->syncPeriods($fiscalYear);
        });

        return redirect()
            ->route('fiscal-years.index')
            ->with('success', $fiscalYear->code . ' Fiscal Year updated.');
    }

    public function destroy(FiscalYear $fiscalYear)
    {
        // 🔥 Safety rule: prevent deletion if periods exist
        if ($fiscalYear->periods()->exists()) {
            return back()->withErrors([
                'error' => 'Cannot delete fiscal year with periods.',
            ]);
        }

        $fiscalYear->delete();

        return redirect()
            ->route('fiscal-years.index')
            ->with('success', $fiscalYear->code . ' Fiscal Year deleted.');
    }

    // ------------------------
    // 🔥 Generate Periods
    // ------------------------

    protected function generateFiscalPeriods(FiscalYear $fiscalYear): void
    {
        $start = Carbon::parse($fiscalYear->start_date)->startOfMonth();
        $end = Carbon::parse($fiscalYear->end_date)->endOfMonth();

        while ($start->lte($end)) {
            FiscalPeriod::create([
                'fiscal_year_id' => $fiscalYear->id,
                'period_name' => strtoupper($start->format('M-Y')),
                'start_date' => $start->copy()->startOfMonth(),
                'end_date' => $start->copy()->endOfMonth(),
                'status' => 'open', // ✅ FIXED (was is_open)
            ]);

            $start->addMonth();
        }
    }

    // ------------------------
    // 🔥 Sync Period Status
    // ------------------------

    protected function syncPeriods(FiscalYear $fiscalYear): void
    {
        if ($fiscalYear->is_closed) {
            $fiscalYear->periods()
                ->where('status', 'open')
                ->update(['status' => 'closed']);
        }
    }
}