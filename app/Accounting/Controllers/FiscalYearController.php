<?php

namespace App\Accounting\Controllers;

use App\Accounting\Models\FiscalYear;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FiscalYearController
{
    public function index(Request $request): Response
    {
        $query = FiscalYear::query();

        // Search by code
        if ($request->filled('search')) {
            $query->where('code', 'like', "%{$request->search}%");
        }

        // Status filter
        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'closed') {
                $query->where('is_closed', true);
            }
        }

        $perPage = $request->input('per_page', 10);

        $fiscalYears = $query->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('accounting/fiscal-years/index', [
            'fiscalYears' => $fiscalYears,
            'filters' => $request->only(['search', 'status', 'per_page', 'page']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('accounting/fiscal-years/fiscal-year-edit');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|unique:fiscal_years,code',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_active' => 'boolean',
            'is_closed' => 'boolean',
        ]);

        FiscalYear::create($validated);

        return redirect()->route('fiscal-years.index')->with('success', 'Fiscal Year created.');
    }

    public function edit(FiscalYear $fiscalYear): Response
    {
        return Inertia::render('accounting/fiscal-years/fiscal-year-edit', [
            'fiscalYear' => $fiscalYear,
        ]);
    }

    public function update(Request $request, FiscalYear $fiscalYear)
    {
        $validated = $request->validate([
            'code' => 'required|unique:fiscal_years,code,' . $fiscalYear->id,
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_active' => 'boolean',
            'is_closed' => 'boolean',
        ]);

        $fiscalYear->update($validated);

        return redirect()->route('fiscal-years.index')->with('success', 'Fiscal Year updated.');
    }

    public function destroy(FiscalYear $fiscalYear)
    {
        $fiscalYear->delete();
        return redirect()->route('fiscal-years.index')->with('success', 'Fiscal Year deleted.');
    }
}
