<?php

namespace App\CustomerModule\Controllers;

use App\CustomerModule\Models\Customer;
use App\CustomerModule\Models\CustomerFamilyRelation;
use App\CustomerModule\Requests\StoreFamilyRelationRequest;
use App\CustomerModule\Requests\UpdateFamilyRelationRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerFamilyRelationController extends Controller
{
    public function index(Request $request): Response
    {
        $query = CustomerFamilyRelation::query()
            ->with(['customer', 'relative']);

        // 🔍 Search filter
        if ($search = $request->string('search')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('customer', function ($qc) use ($search) {
                    $qc->where('name', 'like', "%{$search}%")
                        ->orWhere('customer_no', 'like', "%{$search}%");
                })->orWhereHas('relative', function ($qr) use ($search) {
                    $qr->where('name', 'like', "%{$search}%")
                        ->orWhere('customer_no', 'like', "%{$search}%");
                });
            });
        }

        // 🎯 Status filter
        if ($status = $request->string('verification_status')->toString()) {
            $query->where('verification_status', $status);
        }

        $relations = $query
            ->latest()
            ->paginate($request->integer('per_page', 10))
            ->withQueryString();

        return Inertia::render('customer-kyc/family-relations/list_family_relation_page', [
            'familyRelations' => $relations,
            'filters' => $request->only([
                'search',
                'verification_status', // ✅ added
                'per_page',
                'page',
            ]),
        ]);
    }

    public function show(CustomerFamilyRelation $familyRelation): Response
    {
        $familyRelation->load(['customer', 'relative', 'customer.photo', 'relative.photo']);

        return Inertia::render('customer-kyc/family-relations/show_family_relation_page', [
            'familyRelation' => $familyRelation,
        ]);
    }

    public function create(Customer $customer): Response
    {
        return Inertia::render('customer-kyc/family-relations/create_family_relation_page', [
            'customer' => $customer->load('photo'),
        ]);
    }

    public function edit(CustomerFamilyRelation $familyRelation): Response
    {
        return Inertia::render('customer-kyc/family-relations/edit_family_relation_page', [
            'family_relation' => $familyRelation->load('customer', 'customer.photo', 'relative', 'relative.photo'),
        ]);
    }

    public function store(StoreFamilyRelationRequest $request)
    {
        $data = $request->validated();

        // ✅ Prevent duplicate relations (both directions)
        $exists = CustomerFamilyRelation::where(function ($q) use ($data) {
            $q->where('customer_id', $data['customer_id'])
                ->where('relative_id', $data['relative_id']);
        })->orWhere(function ($q) use ($data) {
            $q->where('customer_id', $data['relative_id'])
                ->where('relative_id', $data['customer_id']);
        })->exists();

        if ($exists) {
            return response()->json([
                'error' => 'This family relation already exists.',
            ], 422);
        }

        $relation = CustomerFamilyRelation::create($data);

        return redirect()
            ->route('customers.show', $data['customer_id'])
            ->with('success', 'Family relation created successfully.');
    }

    public function update(
        UpdateFamilyRelationRequest $request,
        CustomerFamilyRelation $familyRelation
    ) {
        $data = $request->validated();

        // $exists = CustomerFamilyRelation::where(function ($q) use ($data) {
        //     $q->where('customer_id', $data['customer_id'])
        //         ->where('relative_id', $data['relative_id']);
        // })
        //     ->where('id', '!=', $familyRelation->id)
        //     ->exists();

        // if ($exists) {
        //     return response()->json([
        //         'error' => 'This family relation already exists.',
        //     ], 422);
        // }

        $familyRelation->update($data);

        return redirect()
            ->route('customers.show', $data['customer_id'])
            ->with('success', 'Family relation updated successfully.');
    }

    public function destroy(CustomerFamilyRelation $familyRelation)
    {
        $familyRelation->delete();

        return redirect()->back()->with([
            'success' => 'Family relation deleted successfully.',
        ]);
    }
}
