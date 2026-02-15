<?php

namespace App\CostomerMgmt\Controllers;

use App\CostomerMgmt\Models\CustomerSignature;
use App\CostomerMgmt\Requests\StoreSignatureRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CustomerSignatureController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('customer-mgmt/signatures/index');
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

        // Enforce one signature per customer
        $exists = CustomerSignature::where('customer_id', $data['customer_id'])->exists();

        if ($exists) {
            return response()->json([
                'error' => 'This customer already has a signature.',
            ], 422);
        }

        $file = $request->file('signature');

        // Store file
        $path = $file->store('customer/signatures', 'public');

        $signature = CustomerSignature::create([
            'customer_id' => $data['customer_id'],
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'mime' => $file->getMimeType(),
            'alt_text' => 'Customer Signature',
        ]);

        return response()->json([
            'message' => 'Signature created successfully.',
            'signature' => $signature,
        ], 201);
    }

    public function destroy(CustomerSignature $signature): JsonResponse
    {
        // Delete file from storage if it exists
        if ($signature->file_path && Storage::disk('public')->exists($signature->file_path)) {
            Storage::disk('public')->delete($signature->file_path);
        }

        // Delete DB record
        $signature->delete();

        return response()->json([
            'message' => 'Signature deleted successfully.',
        ]);
    }
}
