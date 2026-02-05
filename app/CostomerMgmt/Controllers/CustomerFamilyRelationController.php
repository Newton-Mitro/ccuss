<?php

namespace App\CostomerMgmt\Controllers;

use App\CostomerMgmt\Models\CustomerFamilyRelation;
use App\CostomerMgmt\Requests\StoreFamilyRelationRequest;
use App\CostomerMgmt\Requests\UpdateFamilyRelationRequest;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class CustomerFamilyRelationController extends Controller
{
    public function index(): Response
    {

        $filters = request()->only('search', 'per_page', 'page');
        $perPage = $filters['per_page'] ?? 10;

        // If search is empty, return empty paginator
        // if (empty($filters['search'])) {
        //     $relations = FamilyRelation::query()->whereRaw('0 = 1')->paginate($perPage);
        //     return Inertia::render('customer-management/family-relations/index', [
        //         'familyRelations' => $relations,
        //         'filters' => $filters,
        //     ]);
        // }

        $search = $filters['search'] ?? '';
        $query = CustomerFamilyRelation::with(['customer', 'relative'])
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
        $exists = CustomerFamilyRelation::where(function ($q) use ($data) {
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
        CustomerFamilyRelation::create($data);

        return redirect()
            ->route('family-relations.index')
            ->with('success', 'Family relation added successfully.');
    }

    public function show(CustomerFamilyRelation $familyRelation): Response
    {
        return Inertia::render('customer-management/family-relations/show', [
            'familyRelation' => $familyRelation->load(['customer', 'relative']),
        ]);
    }

    public function edit(CustomerFamilyRelation $familyRelation): Response
    {
        return Inertia::render('customer-management/family-relations/edit', [
            'familyRelation' => $familyRelation->load(['customer', 'relative']),
        ]);
    }

    public function update(UpdateFamilyRelationRequest $request, CustomerFamilyRelation $familyRelation): RedirectResponse
    {
        $data = $request->validated();

        // ✅ Check if this relation already exists (excluding the current one)
        $exists = CustomerFamilyRelation::where('customer_id', $data['customer_id'])
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

    public function destroy(CustomerFamilyRelation $familyRelation): RedirectResponse
    {
        $familyRelation->delete();

        return redirect()
            ->route('family-relations.index')
            ->with('success', 'Family relation deleted successfully.');
    }
}
