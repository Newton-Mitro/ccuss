<?php

namespace App\CustomerModule\Controllers;

use App\CustomerModule\Models\CustomerAddress;
use App\CustomerModule\Requests\StoreAddressRequest;
use App\CustomerModule\Requests\UpdateAddressRequest;
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

        return Inertia::render('customer-kyc/addresses/list_address_page', [
            'addresses' => $addresses,
            'filters' => $request->only([
                'search',
                'verification_status',
                'per_page',
                'page',
            ]),
        ]);
    }

    public function show(CustomerAddress $address): Response
    {
        // Load the related customer info
        $address->load(['customer', 'customer.photo']);

        return Inertia::render('customer-kyc/addresses/view_address_page', [
            'address' => $address,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('customer-kyc/addresses/create_address_page');
    }

    public function edit(CustomerAddress $address): Response
    {
        return Inertia::render('customer-kyc/addresses/edit_address_page', [
            'address' => $address,
        ]);
    }

    public function store(StoreAddressRequest $request)
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

        return redirect()
            ->route('customers.show', $data['customer_id'])
            ->with('success', 'Address created successfully.');
    }

    public function update(UpdateAddressRequest $request, CustomerAddress $address)
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

        return redirect()
            ->route('customers.show', $data['customer_id'])
            ->with('success', 'Address updated successfully.');
    }

    public function destroy(CustomerAddress $address): JsonResponse
    {
        $address->delete();

        return response()->json([
            'message' => 'Address deleted successfully.',
        ]);
    }
}
