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

        $filters = request()->only('search', 'per_page', 'page');
        $perPage = $filters['per_page'] ?? 10;

        // If search is empty, return empty paginator
        if (empty($filters['search'])) {
            $relations = FamilyRelation::query()->whereRaw('0 = 1')->paginate($perPage);
            return Inertia::render('customer-management/family-relations/index', [
                'familyRelations' => $relations,
                'filters' => $filters,
            ]);
        }

        $search = $filters['search'];
        $query = FamilyRelation::with(['customer', 'relative'])
            ->latest()
            ->where(function ($q) use ($search) {
                $q->whereHas('customer', function ($q2) use ($search) {
                    $q2->where('name', 'like', "%{$search}%")
                        ->orWhere('customer_no', 'like', "%{$search}%");
                })
                    ->orWhereHas('relative', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%")
                            ->orWhere('customer_no', 'like', "%{$search}%");
                    });
            });

        $relations = $query->paginate($perPage)->withQueryString();


        return Inertia::render('customer-management/family-relations/index', [
            'familyRelations' => $relations,
            'filters' => $filters,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('customer-management/family-relations/create');
    }

    public function store(StoreFamilyRelationRequest $request): RedirectResponse
    {
        $data = $request->validated();

        // ✅ Check if relation already exists between same customer & relative
        $exists = FamilyRelation::where(function ($q) use ($data) {
            $q->where('customer_id', $data['customer_id'])
                ->where('relative_id', $data['relative_id']);
        })
            ->orWhere(function ($q) use ($data) {
                $q->where('customer_id', $data['relative_id'])
                    ->where('relative_id', $data['customer_id']);
            })
            ->exists();

        if ($exists) {
            return redirect()
                ->back()
                ->withErrors(['relation' => 'This family relation already exists.'])
                ->withInput();
        }

        // ✅ Otherwise, create new record
        FamilyRelation::create($data);

        return redirect()
            ->route('family-relations.index')
            ->with('success', 'Family relation added successfully.');
    }

    public function show(FamilyRelation $familyRelation): Response
    {
        return Inertia::render('customer-management/family-relations/show', [
            'familyRelation' => $familyRelation->load(['customer', 'relative']),
        ]);
    }

    public function edit(FamilyRelation $familyRelation): Response
    {
        return Inertia::render('customer-management/family-relations/edit', [
            'familyRelation' => $familyRelation->load(['customer', 'relative']),
        ]);
    }

    public function update(UpdateFamilyRelationRequest $request, FamilyRelation $familyRelation): RedirectResponse
    {
        $data = $request->validated();

        // ✅ Check if this relation already exists (excluding the current one)
        $exists = FamilyRelation::where('customer_id', $data['customer_id'])
            ->where('relative_id', $data['relative_id'])
            ->where('id', '!=', $familyRelation->id)
            ->exists();

        if ($exists) {
            return redirect()
                ->back()
                ->withErrors(['relative_id' => 'This relationship is already defined between these two people.'])
                ->withInput();
        }

        $familyRelation->update($data);

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
