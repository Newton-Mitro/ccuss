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
        $query = CustomerAddress::query()->with('customer');

        // 🔍 Search filter
        if ($search = $request->string('search')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('line1', 'like', "%{$search}%")
                    ->orWhere('line2', 'like', "%{$search}%")
                    ->orWhere('district', 'like', "%{$search}%")
                    ->orWhere('country', 'like', "%{$search}%");
            });
        }

        // ✅ Verification status filter
        if ($status = $request->input('verification_status')) {
            if ($status !== 'all') {
                $query->where('verification_status', $status);
            }
        }

        $addresses = $query
            ->latest()
            ->paginate($request->integer('per_page', 10))
            ->withQueryString();

        return Inertia::render('customer-management/addresses/addresses_index', [
            'addresses' => $addresses,
            'filters' => $request->only([
                'search',
                'verification_status',
                'per_page',
                'page',
            ]),
        ]);
    }

    public function customerAddresses(Request $request): Response
    {
        return Inertia::render('customer-management/addresses/customer_addresses');
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

    public function show(CustomerAddress $address): Response
    {
        // Load the related customer info
        $address->load('customer');

        return Inertia::render('customer-management/addresses/view_address_page', [
            'address' => $address,
        ]);
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
