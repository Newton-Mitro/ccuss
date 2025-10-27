<?php

namespace App\CostomerManagement\FamilyRelation\Controllers;

use App\CostomerManagement\Customer\Models\Customer;
use App\CostomerManagement\FamilyRelation\Models\FamilyRelation;
use App\CostomerManagement\FamilyRelation\Requests\StoreFamilyRelationRequest;
use App\CostomerManagement\FamilyRelation\Requests\UpdateFamilyRelationRequest;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class FamilyRelationController extends Controller
{
    public function index(): Response
    {
        // Fetch family relations with optional search & pagination
        $relations = FamilyRelation::with(['customer', 'relative'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('customer-management/family-relations/index', [
            'relations' => $relations,
            'filters' => request()->only('search'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('customer-management/family-relations/create', [
            // You can pass data like customers list for selection
            'customers' => Customer::all(),
        ]);
    }

    public function store(StoreFamilyRelationRequest $request): RedirectResponse
    {
        FamilyRelation::create($request->validated());

        return redirect()
            ->route('family-relations.index')
            ->with('success', 'Family relation added successfully.');
    }

    public function show(FamilyRelation $familyRelation): Response
    {
        return Inertia::render('customer-management/family-relations/show', [
            'relation' => $familyRelation->load(['customer', 'relative']),
        ]);
    }

    public function edit(FamilyRelation $familyRelation): Response
    {
        return Inertia::render('customer-management/family-relations/edit', [
            'relation' => $familyRelation->load(['customer', 'relative']),
            'customers' => Customer::all(),
        ]);
    }

    public function update(UpdateFamilyRelationRequest $request, FamilyRelation $familyRelation): RedirectResponse
    {
        $familyRelation->update($request->validated());

        return redirect()
            ->route('family-relations.index')
            ->with('success', 'Family relation updated successfully.');
    }

    public function destroy(FamilyRelation $familyRelation): RedirectResponse
    {
        $familyRelation->delete();

        return redirect()
            ->route('family-relations.index')
            ->with('success', 'Family relation deleted successfully.');
    }
}
