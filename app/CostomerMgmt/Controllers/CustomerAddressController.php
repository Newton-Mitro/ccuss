<?php

namespace App\CostomerMgmt\Controllers;

use App\CostomerMgmt\Models\CustomerAddress;
use App\CostomerMgmt\Requests\StoreAddressRequest;
use App\CostomerMgmt\Requests\UpdateAddressRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response; // ✅ Add this
use Illuminate\Http\RedirectResponse;

class CustomerAddressController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 5);
        $page = $request->input('page', 1);
        $search = $request->input('search');
        $type = $request->input('type', 'all');

        $query = CustomerAddress::query()->with('customer');

        // 🔍 Search filter
        $query->where(function ($q) use ($search) {
            $q->whereHas('customer', function ($q2) use ($search) {
                $q2->where('name', 'like', "%{$search}%")
                    ->orWhere('customer_no', 'like', "%{$search}%");
            })
                ->orWhere('line1', 'like', "%{$search}%")
                ->orWhere('district', 'like', "%{$search}%");
        });

        // 🏷️ Type filter
        if (!empty($type) && $type !== 'all') {
            $query->where('type', $type);
        }

        // 📄 Paginate with query string
        $addresses = $query->latest()->paginate($perPage)->withQueryString();

        // ✅ Inertia response with filters
        return Inertia::render('customer-management/addresses/index', [
            'addresses' => $addresses,
            'filters' => $request->only(['search', 'type', 'per_page', 'page']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('customer-management/addresses/create');
    }

    public function store(StoreAddressRequest $request): RedirectResponse
    {
        $data = $request->validated();

        // ✅ Check if this person already has an address of this type
        $exists = CustomerAddress::where('customer_id', $data['customer_id'])
            ->where('type', $data['type'])
            ->exists();

        if ($exists) {
            return redirect()
                ->back()
                ->withErrors(['type' => 'This person already has an address of this type.'])
                ->withInput();
        }

        // ✅ Otherwise, create a new address
        CustomerAddress::create($data);

        return redirect()
            ->route('addresses.index')
            ->with('success', 'Address created successfully.');
    }

    public function show(CustomerAddress $address): Response
    {
        $address->load('customer:id,name');

        return Inertia::render('customer-management/addresses/show', [
            'address' => $address,
        ]);
    }

    public function edit(CustomerAddress $address): Response
    {
        $address->load('customer');

        return Inertia::render('customer-management/addresses/edit', [
            'address' => $address,
        ]);
    }

    public function update(UpdateAddressRequest $request, CustomerAddress $address): RedirectResponse
    {
        $data = $request->validated();

        // ✅ Check if another address with the same customer & type already exists
        $exists = CustomerAddress::where('customer_id', $data['customer_id'])
            ->where('type', $data['type'])
            ->where('id', '!=', $address->id)
            ->exists();

        if ($exists) {
            return redirect()
                ->back()
                ->withErrors(['type' => 'This person already has an address of this type.'])
                ->withInput();
        }

        $address->update($data);

        return redirect()
            ->route('addresses.index')
            ->with('success', 'Address updated successfully.');
    }

    public function destroy(CustomerAddress $address): RedirectResponse
    {
        $address->delete();

        return redirect()->route('addresses.index')
            ->with('success', 'Address deleted successfully.');
    }
}
