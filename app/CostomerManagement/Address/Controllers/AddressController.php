<?php

namespace App\CostomerManagement\Address\Controllers;

use App\CostomerManagement\Address\Models\Address;
use App\CostomerManagement\Address\Requests\StoreAddressRequest;
use App\CostomerManagement\Address\Requests\UpdateAddressRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response; // ✅ Add this
use Illuminate\Http\RedirectResponse;

class AddressController extends Controller
{
    public function index(Request $request)
    {
        $query = Address::query()->with('customer');

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('customer', function ($q2) use ($search) {
                    $q2->where('name', 'like', "%{$search}%")
                        ->orWhere('customer_no', 'like', "%{$search}%");
                })
                    ->orWhere('line1', 'like', "%{$search}%")
                    ->orWhere('district', 'like', "%{$search}%");
            });
        }

        // Type filter
        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        // Pagination
        $perPage = $request->get('perPage', 5);
        $addresses = $query->paginate($perPage)->withQueryString();

        return Inertia::render('customer-management/addresses/index', [
            'addresses' => $addresses,
            'filters' => $request->only(['search', 'type', 'perPage', 'page']),
        ]);
    }

    /**
     * Show the form for creating a new address.
     */
    public function create(): Response
    {
        return Inertia::render('customer-management/addresses/create');
    }

    /**
     * Store a newly created address.
     */
    public function store(StoreAddressRequest $request): RedirectResponse
    {
        Address::create($request->validated());

        return redirect()->route('addresses.index')
            ->with('success', 'Address created successfully.');
    }

    /**
     * Display a specific address.
     */
    public function show(Address $address): Response
    {
        $address->load('customer:id,name');

        return Inertia::render('customer-management/addresses/show', [
            'address' => [
                'id' => $address->id,
                'customer_id' => $address->customer_id,
                'customer_name' => $address->customer->name ?? 'N/A',
                'line1' => $address->line1,
                'line2' => $address->line2,
                'division' => $address->division,
                'district' => $address->district,
                'upazila' => $address->upazila,
                'union_ward' => $address->union_ward,
                'village_locality' => $address->village_locality,
                'postal_code' => $address->postal_code,
                'country_code' => $address->country_code,
                'type' => $address->type,
                'created_at' => $address->created_at->toDateTimeString(),
                'updated_at' => $address->updated_at->toDateTimeString(),
            ],
        ]);
    }

    /**
     * Show the form for editing a specific address.
     */
    public function edit(Address $address): Response
    {
        $address->load('customer:id,name');

        return Inertia::render('customer-management/addresses/edit', [
            'address' => [
                'id' => $address->id,
                'customer_id' => $address->customer_id,
                'customer_name' => $address->customer->name ?? 'N/A',
                'line1' => $address->line1,
                'line2' => $address->line2,
                'division' => $address->division,
                'district' => $address->district,
                'upazila' => $address->upazila,
                'union_ward' => $address->union_ward,
                'village_locality' => $address->village_locality,
                'postal_code' => $address->postal_code,
                'country_code' => $address->country_code,
                'type' => $address->type,
                'created_at' => $address->created_at->toDateTimeString(),
                'updated_at' => $address->updated_at->toDateTimeString(),
            ],
        ]);
    }

    /**
     * Delete a specific address.
     */
    public function destroy(Address $address): RedirectResponse
    {
        $address->delete();

        return redirect()->route('addresses.index')
            ->with('success', 'Address deleted successfully.');
    }
}
