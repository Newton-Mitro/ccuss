<?php

namespace App\CostomerMgmt\Controllers;

use App\CostomerMgmt\Models\CustomerIntroducer;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CustomerIntroducerController extends Controller
{
    /**
     * 📄 All introducers (search + filter)
     */
    public function index(Request $request): Response
    {
        $query = CustomerIntroducer::query()
            ->with([
                'introducedCustomer:id,name,customer_no',
                'introducerCustomer:id,name,customer_no',
                'verifiedBy:id,name',
            ]);

        // 🔍 Search filter
        if ($search = $request->string('search')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('introducedCustomer', function ($qc) use ($search) {
                    $qc->where('name', 'like', "%{$search}%")
                        ->orWhere('customer_no', 'like', "%{$search}%");
                })->orWhereHas('introducerCustomer', function ($qi) use ($search) {
                    $qi->where('name', 'like', "%{$search}%")
                        ->orWhere('customer_no', 'like', "%{$search}%");
                });
            });
        }

        // ✅ Verification status filter
        if (
            $request->filled('verification_status') &&
            $request->verification_status !== 'all'
        ) {
            $query->where(
                'verification_status',
                $request->verification_status
            );
        }

        $introducers = $query
            ->latest()
            ->paginate($request->integer('per_page', 10))
            ->withQueryString();

        return Inertia::render(
            'customer-mgmt/introducers/introducers_index',
            [
                'introducers' => $introducers,
                'filters' => $request->only([
                    'search',
                    'verification_status',
                    'per_page',
                    'page',
                ]),
            ]
        );
    }

    /**
     * 📄 Customer-wise introducer page
     */
    public function customerIntroducers(Request $request): Response
    {
        return Inertia::render(
            'customer-mgmt/introducers/customer_introducers'
        );
    }

    /**
     * 🔄 Get introducers by customer (AJAX)
     */
    public function getCustomerIntroducers(Request $request): JsonResponse
    {
        $customerId = $request->input('customer_id');

        if (!$customerId) {
            return response()->json(
                ['error' => 'customer_id is required'],
                400
            );
        }

        $introducers = CustomerIntroducer::where(
            'introduced_customer_id',
            $customerId
        )
            ->with([
                'introducerCustomer:id,name,customer_no',
                'verifiedBy:id,name',
            ])
            ->latest()
            ->get();

        return response()->json($introducers);
    }

    /**
     * 👁 View introducer
     */
    public function show(CustomerIntroducer $customerIntroducer): Response
    {
        $customerIntroducer->load([
            'introducedCustomer',
            'introducerCustomer',
            'verifiedBy',
        ]);

        return Inertia::render(
            'customer-mgmt/introducers/view_introducer_page',
            [
                'introducer' => $customerIntroducer,
            ]
        );
    }

    /**
     * ➕ Store introducer
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'introduced_customer_id' => ['required', 'exists:customers,id'],
            'introducer_customer_id' => [
                'required',
                'exists:customers,id',
                Rule::different('introduced_customer_id'),
            ],
            'relationship_type' => [
                'required',
                Rule::in(['FAMILY', 'FRIEND', 'BUSINESS', 'COLLEAGUE', 'OTHER']),
            ],
            'remarks' => ['nullable', 'string'],
        ]);

        // ✅ Prevent duplicate introducer
        $exists = CustomerIntroducer::where(
            'introduced_customer_id',
            $data['introduced_customer_id']
        )
            ->where(
                'introducer_customer_id',
                $data['introducer_customer_id']
            )
            ->exists();

        if ($exists) {
            return response()->json([
                'error' => 'This introducer already exists for the customer.',
            ], 422);
        }

        $introducer = CustomerIntroducer::create([
            ...$data,
            'verification_status' => 'PENDING',
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Introducer added successfully.',
            'introducer' => $introducer,
        ]);
    }

    /**
     * ✏️ Update introducer
     */
    public function update(
        Request $request,
        CustomerIntroducer $customerIntroducer
    ): JsonResponse {
        $data = $request->validate([
            'relationship_type' => [
                'required',
                Rule::in(['FAMILY', 'FRIEND', 'BUSINESS', 'COLLEAGUE', 'OTHER']),
            ],
            'remarks' => ['nullable', 'string'],
        ]);

        $customerIntroducer->update([
            ...$data,
            'updated_by' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Introducer updated successfully.',
            'introducer' => $customerIntroducer,
        ]);
    }

    /**
     * ✅ Verify / Reject
     */
    public function verify(
        Request $request,
        CustomerIntroducer $customerIntroducer
    ): JsonResponse {
        $data = $request->validate([
            'verification_status' => [
                'required',
                Rule::in(['VERIFIED', 'REJECTED']),
            ],
            'remarks' => ['nullable', 'string'],
        ]);

        $customerIntroducer->update([
            'verification_status' => $data['verification_status'],
            'remarks' => $data['remarks'],
            'verified_by' => auth()->id(),
            'verified_at' => now(),
        ]);

        return response()->json([
            'message' => 'Verification status updated.',
        ]);
    }

    /**
     * 🗑 Delete introducer
     */
    public function destroy(
        CustomerIntroducer $customerIntroducer
    ): JsonResponse {
        $customerIntroducer->delete();

        return response()->json([
            'message' => 'Introducer deleted successfully.',
        ]);
    }
}
