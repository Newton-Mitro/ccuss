<?php

namespace App\CostomerMgmt\Controllers;

use App\CostomerMgmt\Models\CustomerSignature;
use App\CostomerMgmt\Requests\StoreSignatureRequest;
use App\CostomerMgmt\Requests\UpdateSignatureRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerSignatureController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('customer-management/signatures/index');
    }

    public function getCustomerSignature(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
        ]);

        $signature = CustomerSignature::with('customer:id,name,customer_no')
            ->where('customer_id', $validated['customer_id'])
            ->latest()
            ->first();

        if (!$signature) {
            return response()->json([
                'message' => 'No signature found for this customer'
            ], 404);
        }

        return response()->json([
            'data' => $signature
        ]);
    }


    public function store(StoreSignatureRequest $request): JsonResponse
    {
        $data = $request->validated();

        // One signature per customer
        $exists = CustomerSignature::where('customer_id', $data['customer_id'])
            ->exists();

        if ($exists) {
            return response()->json([
                'error' => 'This customer already has a signature.'
            ], 422);
        }

        $signature = CustomerSignature::create([
            'customer_id' => $data['customer_id'],
            'signature_id' => $data['signature_id'],
        ]);

        return response()->json([
            'message' => 'Signature created successfully.',
            'signature' => $signature->load('customer:id,name,customer_no'),
        ]);
    }

    public function update(
        UpdateSignatureRequest $request,
        CustomerSignature $signature
    ): JsonResponse {
        $data = $request->validated();

        // Prevent assigning another customer's signature
        $exists = CustomerSignature::where('customer_id', $data['customer_id'])
            ->where('id', '!=', $signature->id)
            ->exists();

        if ($exists) {
            return response()->json([
                'error' => 'This customer already has a signature.'
            ], 422);
        }

        $signature->update([
            'customer_id' => $data['customer_id'],
            'signature_id' => $data['signature_id'] ?? $signature->signature_id,
        ]);

        return response()->json([
            'message' => 'Signature updated successfully.',
            'signature' => $signature->load('customer:id,name,customer_no'),
        ]);
    }

    public function destroy(CustomerSignature $signature): JsonResponse
    {
        $signature->delete();

        return response()->json([
            'message' => 'Signature deleted successfully.',
        ]);
    }
}
