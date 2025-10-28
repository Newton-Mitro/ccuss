<?php

namespace App\CostomerManagement\Customer\Controllers;

use App\CostomerManagement\Customer\Models\Customer;
use App\CostomerManagement\Customer\Requests\StoreCustomerRequest;
use App\CostomerManagement\Customer\Requests\UpdateCustomerRequest;
use App\Http\Controllers\Controller;
use App\Media\Models\Media;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
class CustomerController extends Controller
{
    /**
     * Display a listing of customers.
     */
    public function index(Request $request): Response
    {
        $query = Customer::query()
            ->with('photo'); // eager load media

        // ✅ Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('customer_no', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // ✅ Status filter
        if ($status = $request->input('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        $customers = $query->latest()
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        return Inertia::render('customer-management/customers/index', [
            'customers' => $customers,
            'filters' => $request->only(['search', 'status', 'per_page', 'page']),
        ]);
    }

    /**
     * Show the form for creating a new customer.
     */
    public function create(Request $request): Response
    {
        $media = $this->filterMedia($request);

        return Inertia::render('customer-management/customers/create', [
            'media' => $media,
        ]);
    }

    /**
     * Store a newly created customer.
     */
    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $customer = Customer::create($data);

        // ✅ Attach media if selected
        if (!empty($data['media'])) {
            $customer->media()->associate(Media::find($data['media']))->save();
        }

        return redirect()->route('customers.index')
            ->with('success', 'Customer created successfully.');
    }

    /**
     * Display the specified customer.
     */
    public function show(Customer $customer): Response
    {
        $customer->load('photo');

        return Inertia::render('customer-management/customers/show', [
            'customer' => $customer,
        ]);
    }

    /**
     * Show the form for editing the specified customer.
     */
    public function edit(Request $request, Customer $customer): Response
    {
        $media = $this->filterMedia($request);

        $customer->load('photo');

        return Inertia::render('customer-management/customers/edit', [
            'customer' => $customer,
            'media' => $media,
        ]);
    }

    /**
     * Update the specified customer.
     */
    public function update(UpdateCustomerRequest $request, Customer $customer): RedirectResponse
    {
        $data = $request->validated();

        $customer->update($data);

        // ✅ Update media association
        if (isset($data['media'])) {
            $media = $data['media']
                ? Media::find($data['media'])
                : null;

            $customer->media()->associate($media);
            $customer->save();
        }

        return redirect()->route('customers.index')
            ->with('success', 'Customer updated successfully.');
    }

    /**
     * Remove the specified customer.
     */
    public function destroy(Customer $customer): RedirectResponse
    {
        $customer->delete();

        return redirect()->route('customers.index')
            ->with('success', 'Customer deleted successfully.');
    }

    /**
     * Filter media library by file type or pagination.
     */
    private function filterMedia(Request $request)
    {
        $type = $request->input('type', 'all');
        $perPage = $request->input('perPage', 20);

        $query = Media::query()->where('uploaded_by', auth()->id());

        match ($type) {
            'images' => $query->where('file_type', 'like', 'image/%'),
            'videos' => $query->where('file_type', 'like', 'video/%'),
            'audio' => $query->where('file_type', 'like', 'audio/%'),
            'pdf' => $query->where('file_type', 'application/pdf'),
            default => null,
        };

        return $query->latest()->paginate($perPage)->withQueryString();
    }
}