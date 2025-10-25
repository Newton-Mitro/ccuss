<?php

namespace App\CostomerManagement\Addresses\Controllers;

use App\CostomerManagement\Addresses\Models\Address;
use App\CostomerManagement\Addresses\Requests\StoreAddressRequest;
use App\CostomerManagement\Addresses\Requests\UpdateAddressRequest;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index()
    {
        // Fetch addresses with customer name (assuming Address belongsTo Customer)
        $addresses = Address::all();

        return Inertia::render('customer-management/addresses/index', [
            'addresses' => $addresses
        ]);
    }

    public function create()
    {
        return Inertia::render('customer-management/addresses/create');
    }

    public function store(StoreAddressRequest $request)
    {
        Address::create($request->validated());

        return redirect()->route('addresses.index')
            ->with('success', 'Address created successfully.');
    }

    public function show(Address $address)
    {
        $address->load('customer:id,name');

        return Inertia::render('customer-management/addresses/show', [
            'address' => $address
        ]);
    }

    public function edit(Address $address)
    {
        return Inertia::render('customer-management/addresses/edit', [
            'address' => $address
        ]);
    }

    public function update(UpdateAddressRequest $request, Address $address)
    {
        $address->update($request->validated());

        return redirect()->route('addresses.index')
            ->with('success', 'Address updated successfully.');
    }

    public function destroy(Address $address)
    {
        $address->delete();

        return redirect()->route('addresses.index')
            ->with('success', 'Address deleted successfully.');
    }
}
