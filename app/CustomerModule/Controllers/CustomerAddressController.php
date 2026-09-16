<?php

namespace App\CustomerModule\Controllers;

use App\CustomerModule\Application\CustomerAddressService;
use App\CustomerModule\Models\Customer;
use App\CustomerModule\Models\CustomerAddress;
use App\CustomerModule\Requests\StoreAddressRequest;
use App\CustomerModule\Requests\UpdateAddressRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerAddressController extends Controller
{
    public function __construct(
        private readonly CustomerAddressService $customerAddressService,
    ) {
        $this->middleware('permission:customer_address.view')->only(['index', 'show']);
        $this->middleware('permission:customer_address.create')->only(['create']);
        $this->middleware('permission:customer_address.update')->only(['update', 'edit']);
        $this->middleware('permission:customer_address.delete')->only(['destroy']);
        $this->middleware('permission:customer_address.approve')->only(['approve']);
        $this->middleware('permission:customer_address.reject')->only(['reject']);
    }

    public function index(Request $request, ?Customer $customer = null): Response
    {
        $query = CustomerAddress::query()
            ->with('customer')
            ->where('verification_status', CustomerAddress::STATUS_PENDING)
            ->whereHas('customer', fn($customerQuery) => $customerQuery->where(
                'organization_id',
                $request->attributes->get('active_organization')->id,
            ))
            ->when($customer, fn($query) => $query->where('customer_id', $customer->id));

        if ($search = $request->string('search')->toString()) {
            $query->whereHas('customer', function ($customerQuery) use ($search) {
                $customerQuery
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('customer_no', 'like', "%{$search}%");
            });
        }

        $addresses = $query
            ->latest()
            ->paginate($request->integer('per_page', 18))
            ->withQueryString();

        return Inertia::render('customer-kyc/addresses/list_address_page', [
            'paginated_data' => $addresses,
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }

    public function show(Customer $customer, CustomerAddress $address): Response
    {
        abort_unless($address->customer_id === $customer->id, 404);
        abort_unless(
            $customer->organization_id === request()->attributes->get('active_organization')->id,
            404,
        );
        $address->load(['customer', 'customer.photo']);

        return Inertia::render('customer-kyc/addresses/show_address_page', [
            'address' => $address,
        ]);
    }

    public function approve(Customer $customer, CustomerAddress $address)
    {
        abort_unless($address->customer_id === $customer->id, 404);

        if ($address->verification_status === CustomerAddress::STATUS_VERIFIED) {
            return redirect()->back()->with('info', 'Already verified.');
        }

        $address->update([
            'verification_status' => CustomerAddress::STATUS_VERIFIED,
            'verified_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Address approved successfully.');
    }

    public function reject(Request $request, Customer $customer, CustomerAddress $address)
    {
        abort_unless($address->customer_id === $customer->id, 404);
        $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
        ]);

        if ($address->verification_status === CustomerAddress::STATUS_REJECTED) {
            return redirect()->back()->with('info', 'Already rejected.');
        }

        $address->update([
            'verification_status' => CustomerAddress::STATUS_REJECTED,
            'verified_at' => now(),
            'remarks' => $request->string('rejection_reason')->toString(),
        ]);

        return redirect()->back()->with('success', 'Address rejected successfully.');
    }

    public function create(Customer $customer): Response
    {
        return Inertia::render('customer-kyc/addresses/create_address_page', [
            'customer' => $customer->load('photo'),
        ]);
    }

    public function edit(Customer $customer, CustomerAddress $address): Response
    {
        abort_unless($address->customer_id === $customer->id, 404);
        return Inertia::render('customer-kyc/addresses/edit_address_page', [
            'address' => $address->load('customer', 'customer.photo'),
        ]);
    }

    public function store(StoreAddressRequest $request, Customer $customer)
    {
        $data = $request->validated();
        $data['customer_id'] = $customer->id;

        try {
            $address = $this->customerAddressService->createAddress($data);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 422);
        }

        return redirect()
            ->route('customers.show', $data['customer_id'])
            ->with('success', $address->type . ' address added successfully.');
    }

    public function update(
        UpdateAddressRequest $request,
        Customer $customer,
        CustomerAddress $address,
    ) {
        $data = $request->validated();
        $data['customer_id'] = $customer->id;

        try {
            $address = $this->customerAddressService->updateAddress($address, $data);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 422);
        }

        return redirect()
            ->route('customers.show', $data['customer_id'])
            ->with('success', $address->type . ' address updated successfully.');
    }

    public function destroy(Customer $customer, CustomerAddress $address)
    {
        abort_unless($address->customer_id === $customer->id, 404);
        $this->customerAddressService->deleteAddress($address);

        return redirect()->back()->with([
            'success' => $address->type . ' address deleted successfully.',
        ]);
    }
}
