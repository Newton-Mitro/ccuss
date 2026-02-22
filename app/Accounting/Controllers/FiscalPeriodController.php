<?php

namespace App\Accounting\Controllers;

use App\Accounting\Models\FiscalPeriod;
use App\Accounting\Models\FiscalYear;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FiscalPeriodController
{
    public function index(Request $request): Response
    {
        $query = FiscalPeriod::with('fiscalYear');

        // Search by period name
        if ($request->filled('search')) {
            $query->where('period_name', 'like', "%{$request->search}%");
        }

        // Status filter
        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'open') {
                $query->where('is_open', true);
            } elseif ($request->status === 'closed') {
                $query->where('is_open', false);
            }
        }

        $perPage = $request->input('per_page', 20);

        $fiscalPeriods = $query->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('accounting/fiscal-periods/index', [
            'fiscalPeriods' => $fiscalPeriods,
            'filters' => $request->only(['search', 'status', 'per_page', 'page']),
        ]);
    }

    public function create(): Response
    {
        $fiscalYears = FiscalYear::orderBy('start_date')->get();
        return Inertia::render('accounting/fiscal-periods/fiscal-period-edit', [
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
            'is_open' => 'boolean',
        ]);

        FiscalPeriod::create($validated);

        return redirect()->route('fiscal-periods.index')->with('success', 'Fiscal Period created.');
    }

    public function edit(FiscalPeriod $fiscalPeriod): Response
    {
        $fiscalYears = FiscalYear::orderBy('start_date')->get();
        return Inertia::render('accounting/fiscal-periods/fiscal-period-edit', [
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
            'is_open' => 'boolean',
        ]);

        $fiscalPeriod->update($validated);

        return redirect()->route('fiscal-periods.index')->with('success', 'Fiscal Period updated.');
    }

    public function destroy(FiscalPeriod $fiscalPeriod)
    {
        $fiscalPeriod->delete();
        return redirect()->route('fiscal-periods.index')->with('success', 'Fiscal Period deleted.');
    }
}
