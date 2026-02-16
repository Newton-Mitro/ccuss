<?php

namespace App\CostomerMgmt\Controllers;

use App\CostomerMgmt\Models\CustomerFamilyRelation;
use App\CostomerMgmt\Requests\StoreFamilyRelationRequest;
use App\CostomerMgmt\Requests\UpdateFamilyRelationRequest;
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

        $relations = $query
            ->latest()
            ->paginate($request->integer('per_page', 10))
            ->withQueryString();

        return Inertia::render('customer-mgmt/family-relations/family_relation_index', [
            'familyRelations' => $relations,
            'filters' => $request->only([
                'search',
                'per_page',
                'page',
            ]),
        ]);
    }

    public function customerRelations(Request $request): Response
    {
        return Inertia::render('customer-mgmt/family-relations/customer_family_relations');
    }

    public function getCustomerRelations(Request $request): JsonResponse
    {
        $customerId = $request->input('customer_id');

        if (!$customerId) {
            return response()->json(
                ['error' => 'customer_id is required'],
                400
            );
        }

        $relations = CustomerFamilyRelation::where(function ($q) use ($customerId) {
            $q->where('customer_id', $customerId)
                ->orWhere('relative_id', $customerId);
        })
            ->with([
                'customer:id,name,customer_no',
                'relative:id,name,customer_no',
            ])
            ->latest()
            ->get();

        return response()->json($relations);
    }

    public function show(CustomerFamilyRelation $familyRelation): Response
    {
        $familyRelation->load(['customer', 'relative']);

        return Inertia::render('customer-mgmt/family-relations/view_family_relation', [
            'familyRelation' => $familyRelation,
        ]);
    }

    public function store(StoreFamilyRelationRequest $request): JsonResponse
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

        return response()->json([
            'message' => 'Family relation created successfully.',
            'familyRelation' => $relation,
        ]);
    }

    public function update(
        UpdateFamilyRelationRequest $request,
        CustomerFamilyRelation $familyRelation
    ): JsonResponse {
        $data = $request->validated();

        $exists = CustomerFamilyRelation::where(function ($q) use ($data) {
            $q->where('customer_id', $data['customer_id'])
                ->where('relative_id', $data['relative_id']);
        })
            ->where('id', '!=', $familyRelation->id)
            ->exists();

        if ($exists) {
            return response()->json([
                'error' => 'This family relation already exists.',
            ], 422);
        }

        $familyRelation->update($data);

        return response()->json([
            'message' => 'Family relation updated successfully.',
            'familyRelation' => $familyRelation,
        ]);
    }

    public function destroy(CustomerFamilyRelation $familyRelation): JsonResponse
    {
        $familyRelation->delete();

        return response()->json([
            'message' => 'Family relation deleted successfully.',
        ]);
    }
}
