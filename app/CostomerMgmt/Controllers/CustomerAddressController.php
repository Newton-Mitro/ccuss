<?php

namespace App\CostomerMgmt\Controllers;

use App\CostomerMgmt\Models\CustomerAddress;
use App\CostomerMgmt\Requests\StoreAddressRequest;
use App\CostomerMgmt\Requests\UpdateAddressRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerAddressController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('customer-management/addresses/index');
    }

    public function getCustomerAddresses(Request $request): JsonResponse
    {
        $customer_id = $request->input('customer_id');

        if (!$customer_id) {
            return response()->json(['error' => 'customer_id is required'], 400);
        }

        $addresses = CustomerAddress::where('customer_id', $customer_id)
            ->with('customer:id,name')
            ->latest()
            ->get();

        return response()->json($addresses);
    }

    public function store(StoreAddressRequest $request): JsonResponse
    {
        $data = $request->validated();

        $exists = CustomerAddress::where('customer_id', $data['customer_id'])
            ->where('type', $data['type'])
            ->exists();

        if ($exists) {
            return response()->json([
                'error' => 'This customer already has an address of this type.'
            ], 422);
        }

        $address = CustomerAddress::create($data);

        return response()->json([
            'message' => 'Address created successfully.',
            'address' => $address,
        ]);
    }

    public function update(UpdateAddressRequest $request, CustomerAddress $address): JsonResponse
    {
        $data = $request->validated();

        $exists = CustomerAddress::where('customer_id', $data['customer_id'])
            ->where('type', $data['type'])
            ->where('id', '!=', $address->id)
            ->exists();

        if ($exists) {
            return response()->json([
                'error' => 'This customer already has an address of this type.'
            ], 422);
        }

        $address->update($data);

        return response()->json([
            'message' => 'Address updated successfully.',
            'address' => $address,
        ]);
    }

    public function destroy(CustomerAddress $address): JsonResponse
    {
        $address->delete();

        return response()->json([
            'message' => 'Address deleted successfully.',
        ]);
    }
}
