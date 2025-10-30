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
        $perPage = $request->input('per_page', 5);
        $page = $request->input('page', 1);
        $search = $request->input('search');
        $type = $request->input('type', 'all');

        // If search is empty, return an empty paginator (same as SignatureController)
        if (empty($search)) {
            $addresses = new \Illuminate\Pagination\LengthAwarePaginator(
                [], // empty items
                0,  // total items
                $perPage,
                $page,
                ['path' => $request->url(), 'query' => $request->query()]
            );
        } else {
            $query = Address::query()->with('customer');

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
        }

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
        Address::create($request->validated());

        return redirect()->route('addresses.index')
            ->with('success', 'Address created successfully.');
    }

    public function show(Address $address): Response
    {
        $address->load('customer:id,name');

        return Inertia::render('customer-management/addresses/show', [
            'address' => $address,
        ]);
    }

    public function edit(Address $address): Response
    {
        $address->load('customer');

        return Inertia::render('customer-management/addresses/edit', [
            'address' => $address,
        ]);
    }

    public function update(UpdateAddressRequest $request, Address $address): RedirectResponse
    {
        $address->update($request->validated());

        return redirect()->route('addresses.index')
            ->with('success', 'Address updated successfully.');
    }

    public function destroy(Address $address): RedirectResponse
    {
        $address->delete();

        return redirect()->route('addresses.index')
            ->with('success', 'Address deleted successfully.');
    }
}
