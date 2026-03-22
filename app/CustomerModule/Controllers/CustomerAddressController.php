<?php

namespace App\CustomerModule\Controllers;

use App\CustomerModule\Models\Customer;
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
    public function show(CustomerAddress $address): Response
    {
        // Load the related customer info
        $address->load(['customer', 'customer.photo']);

        return Inertia::render('customer-kyc/addresses/view_address_page', [
            'address' => $address,
        ]);
    }

    public function create(Customer $customer): Response
    {
        return Inertia::render('customer-kyc/addresses/create_address_page', [
            'customer' => $customer->load('photo'),
        ]);
    }

    public function edit(CustomerAddress $address): Response
    {
        return Inertia::render('customer-kyc/addresses/edit_address_page', [
            'address' => $address->load('customer', 'customer.photo'),
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

    public function destroy(CustomerAddress $address)
    {
        $address->delete();

        return redirect()->back()->with([
            'success' => 'Address deleted successfully.',
        ]);
    }
}
