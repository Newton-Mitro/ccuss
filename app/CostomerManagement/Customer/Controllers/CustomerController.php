<?php

namespace App\CostomerManagement\Customer\Controllers;

use App\CostomerManagement\Customer\Models\Customer;
use App\CostomerManagement\Customer\Requests\StoreCustomerRequest;
use App\CostomerManagement\Customer\Requests\UpdateCustomerRequest;
use App\Http\Controllers\Controller;
use App\Media\Models\Media;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
class CustomerController extends Controller
{
    public function searchCustomers(Request $request): JsonResponse
    {
        $search = $request->query('search');

        // If search is empty, return empty array
        if (empty($search)) {
            return response()->json(['data' => []]);
        }

        $query = Customer::query()->with('photo');

        // Apply search filter
        $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('customer_no', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%");
        });

        // ✅ Status filter
        $status = $request->input('status');
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        // ✅ Get all results
        $customers = $query->latest()->get();

        return response()->json($customers);

    }

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

    public function create(Request $request): Response
    {
        $media = $this->filterMedia($request);

        return Inertia::render('customer-management/customers/create', [
            'media' => $media,
        ]);
    }

    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        $data = $request->validated();

        // ✅ Require at least phone or email
        if (empty($data['phone']) && empty($data['email'])) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Please provide at least a phone number or an email address.');
        }

        // ✅ Check if customer already exists (by identification number, email, or phone)
        $exists = Customer::where(function ($q) use ($data) {
            $q->where('identification_number', $data['identification_number']);

            if (!empty($data['email'])) {
                $q->orWhere('email', $data['email']);
            }

            if (!empty($data['phone'])) {
                $q->orWhere('phone', $data['phone']);
            }
        })->exists();

        if ($exists) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'A customer with the same identification number, email, or phone already exists.');
        }

        // ✅ Generate intelligent customer number
        $typePrefix = strtoupper(substr($data['type'], 0, 3)); // IND or ORG
        $genderPrefix = $data['type'] === 'Individual'
            ? strtoupper(substr($data['gender'] ?? 'X', 0, 1)) // M, F, O, or X
            : ''; // skip gender for org
        $idPrefix = match ($data['identification_type']) {
            'NID' => 'NID',
            'PASSPORT' => 'PAS',
            'DRIVING_LICENSE' => 'DRV',
            'NBR' => 'NBR',
            default => 'UNK',
        };

        // ✅ Generate customer number prefix
        $typePrefix = strtoupper(substr($data['type'], 0, 1)); // I or O
        $genderPrefix = $data['type'] === 'Individual'
            ? strtoupper(substr($data['gender'] ?? 'X', 0, 1)) // M, F, O, or X
            : ''; // skip for orgs
        $idPrefix = strtoupper(substr($data['identification_type'], 0, 1)); // N, P, D, etc.

        // ✅ Sequential number
        $latestCustomer = Customer::latest('id')->first();
        $nextNumber = $latestCustomer ? $latestCustomer->id + 1 : 1;
        $formattedNumber = str_pad($nextNumber, 5, '0', STR_PAD_LEFT);

        // ✅ Build final customer_no (e.g., IND-M-NID-00001)
        $parts = array_filter([$typePrefix, $genderPrefix, $idPrefix]);
        $data['customer_no'] = implode('', $parts) . '' . $formattedNumber;

        // ✅ Create new customer
        $customer = Customer::create($data);

        return redirect()->route('customers.index')
            ->with('success', 'Customer created successfully.');
    }


    public function show(Customer $customer): Response
    {
        $customer->load('photo');

        return Inertia::render('customer-management/customers/show', [
            'customer' => $customer,
        ]);
    }

    public function edit(Request $request, Customer $customer): Response
    {
        $media = $this->filterMedia($request);

        $customer->load('photo');

        return Inertia::render('customer-management/customers/edit', [
            'customer' => $customer,
            'media' => $media,
        ]);
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): RedirectResponse
    {
        $data = $request->validated();

        // ✅ Require at least phone or email
        if (empty($data['phone']) && empty($data['email'])) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Please provide at least a phone number or an email address.');
        }

        // ✅ Check for duplicate record (excluding current customer)
        $exists = Customer::where(function ($q) use ($data, $customer) {
            $q->where('identification_number', $data['identification_number']);

            if (!empty($data['email'])) {
                $q->orWhere('email', $data['email']);
            }

            if (!empty($data['phone'])) {
                $q->orWhere('phone', $data['phone']);
            }
        })
            ->where('id', '!=', $customer->id)
            ->exists();

        if ($exists) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Another customer with the same identification number, email, or phone already exists.');
        }

        // ✅ Rebuild customer_no if key fields changed
        $shouldRegenerateNo =
            $data['type'] !== $customer->type ||
            $data['identification_type'] !== $customer->identification_type ||
            ($data['type'] === 'Individual' && $data['gender'] !== $customer->gender);

        if ($shouldRegenerateNo) {
            $typePrefix = strtoupper(substr($data['type'], 0, 1)); // I or O
            $genderPrefix = $data['type'] === 'Individual'
                ? strtoupper(substr($data['gender'] ?? 'X', 0, 1)) // M, F, O, or X
                : '';
            $idPrefix = strtoupper(substr($data['identification_type'], 0, 1)); // N, P, D, etc.

            $formattedNumber = str_pad($customer->id, 5, '0', STR_PAD_LEFT);
            $parts = array_filter([$typePrefix, $genderPrefix, $idPrefix]);
            $data['customer_no'] = implode('', $parts) . '' . $formattedNumber;
        }

        // ✅ Update record
        $customer->update($data);

        return redirect()->route('customers.index')
            ->with('success', 'Customer updated successfully.');
    }


    public function destroy(Customer $customer): RedirectResponse
    {
        $customer->delete();

        return redirect()->route('customers.index')
            ->with('success', 'Customer deleted successfully.');
    }

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