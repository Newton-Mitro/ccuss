<?php

namespace App\GeneralAccounting\Controllers;

use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\FiscalYear;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FiscalPeriodController
{
    public function index(Request $request): Response
    {
        $query = FiscalPeriod::with('fiscalYear');

        // 🔍 Search
        if ($request->filled('search')) {
            $query->where('period_name', 'like', "%{$request->search}%");
        }

        // ✅ Status filter (UPDATED)
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $perPage = $request->input('per_page', 10);

        $fiscalPeriods = $query->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('general-accounting/fiscal-periods/index', [
            'fiscalPeriods' => $fiscalPeriods,
            'filters' => $request->only(['search', 'status', 'per_page', 'page']),
        ]);
    }

    public function create(): Response
    {
        $fiscalYears = FiscalYear::orderBy('start_date')->get();

        return Inertia::render('general-accounting/fiscal-periods/fiscal-period-edit', [
            'fiscalYears' => $fiscalYears,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'fiscal_year_id' => 'required|exists:fiscal_years,id',
            'period_name' => 'required|string|max:50',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'required|in:open,closed,locked', // ✅ FIXED
        ]);

        // 🔥 Business Rule: prevent creating period in closed fiscal year
        $fiscalYear = FiscalYear::findOrFail($validated['fiscal_year_id']);

        if (!$fiscalYear->canPost()) {
            return back()->withErrors([
                'fiscal_year_id' => 'Cannot create period in a closed fiscal year.',
            ]);
        }

        $fiscalPeriod = FiscalPeriod::create($validated);

        return redirect()
            ->route('fiscal-periods.index')
            ->with('success', $fiscalPeriod->period_name . ' Fiscal Period created.');
    }

    public function edit(FiscalPeriod $fiscalPeriod): Response
    {
        $fiscalYears = FiscalYear::orderBy('start_date')->get();

        return Inertia::render('general-accounting/fiscal-periods/fiscal-period-edit', [
            'fiscalPeriod' => $fiscalPeriod,
            'fiscalYears' => $fiscalYears,
        ]);
    }

    public function update(Request $request, FiscalPeriod $fiscalPeriod)
    {
        $validated = $request->validate([
            'fiscal_year_id' => 'required|exists:fiscal_years,id',
            'period_name' => 'required|string|max:50',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'required|in:open,closed,locked', // ✅ FIXED
        ]);

        // 🔥 Business Rule: prevent editing locked period
        if ($fiscalPeriod->status === 'locked') {
            return back()->withErrors([
                'status' => 'Locked periods cannot be modified.',
            ]);
        }

        $fiscalPeriod->update($validated);

        return redirect()
            ->route('fiscal-periods.index')
            ->with('success', $fiscalPeriod->period_name . ' Fiscal Period updated.');
    }

    public function destroy(FiscalPeriod $fiscalPeriod)
    {
        // 🔥 Business Rule: prevent deleting locked period
        if ($fiscalPeriod->status === 'locked') {
            return back()->withErrors([
                'error' => 'Locked periods cannot be deleted.',
            ]);
        }

        $fiscalPeriod->delete();

        return redirect()
            ->route('fiscal-periods.index')
            ->with('success', $fiscalPeriod->period_name . ' Fiscal Period deleted.');
    }
}