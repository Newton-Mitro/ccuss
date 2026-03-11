<?php

namespace App\CostomerModule\Controllers;

use App\CostomerModule\Models\Customer;
use App\CostomerModule\Requests\StoreCustomerRequest;
use App\CostomerModule\Requests\UpdateCustomerRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class CustomerController extends Controller
{
    /* ==========================
     * Search Customers (AJAX)
     * ========================== */
    public function searchCustomers(Request $request): JsonResponse
    {
        $search = $request->query('search');

        if (empty($search)) {
            return response()->json(['data' => []]);
        }

        $query = Customer::query()->with(['photo', 'kycProfile', 'kycDocuments']);

        $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('customer_no', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%");
        });

        $status = $request->input('status');
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $customers = $query->latest()->get();

        return response()->json($customers);
    }

    /* ==========================
     * Find Customer by ID
     * ========================== */
    public function findCustomer(int $id): JsonResponse
    {
        $customer = Customer::with([
            'photo',
            'addresses',
            'familyRelations',
            'familyRelations.relative',
            'familyRelations.relative.photo',
            'introducers.introducerCustomer',
            'introducers.introducedCustomer',
            'kycProfile',
            'kycDocuments'
        ])->findOrFail($id);

        return response()->json($customer);
    }

    /* ==========================
     * List Customers
     * ========================== */
    public function index(Request $request): Response
    {
        $query = Customer::with(['photo', 'kycProfile']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('customer_no', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        $customers = $query->latest()
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        return Inertia::render('customer-mgmt/customers/index', [
            'customers' => $customers,
            'filters' => $request->only(['search', 'status', 'per_page', 'page']),
        ]);
    }

    /* ==========================
     * Create Customer Page
     * ========================== */
    public function create(): Response
    {
        return Inertia::render('customer-mgmt/customers/create', [
            'backUrl' => url()->previous(),
        ]);
    }

    /* ==========================
     * Store Customer
     * ========================== */
    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if (empty($data['phone']) && empty($data['email'])) {
            return back()->withInput()->with('error', 'Please provide at least a phone number or an email address.');
        }

        $exists = Customer::where('identification_number', $data['identification_number'])
            ->when(!empty($data['email']), fn($q) => $q->orWhere('email', $data['email']))
            ->when(!empty($data['phone']), fn($q) => $q->orWhere('phone', $data['phone']))
            ->exists();

        if ($exists) {
            return back()->withInput()->with('error', 'A customer with the same identification number, email, or phone already exists.');
        }

        DB::transaction(function () use (&$data) {
            $typePrefix = $data['type'] === 'INDIVIDUAL' ? 'IND' : 'ORG';
            $lastId = Customer::lockForUpdate()->max('id') ?? 0;
            $nextNumber = str_pad($lastId + 1, 5, '0', STR_PAD_LEFT);
            $data['customer_no'] = "{$typePrefix}-{$nextNumber}";

            Customer::create($data);
        });

        return redirect()->route('customers.index')->with('success', 'Customer created successfully.');
    }

    /* ==========================
     * Show Customer
     * ========================== */
    public function show(Customer $customer): Response
    {
        $customer->load([
            'photo',
            'addresses',
            'familyRelations',
            'familyRelations.relative',
            'familyRelations.relative.photo',
            'introducers.introducerCustomer',
            'introducers.introducedCustomer',
            'kycProfile',
            'kycDocuments',
            'onlineServiceClient'
        ]);

        return Inertia::render('customer-mgmt/customers/show', [
            'customer' => $customer,
            'backUrl' => url()->previous(),
        ]);
    }

    /* ==========================
     * Edit Customer Page
     * ========================== */
    public function edit(Customer $customer): Response
    {
        $customer->load(['photo', 'kycProfile', 'kycDocuments']);

        return Inertia::render('customer-mgmt/customers/edit', [
            'customer' => $customer,
            'backUrl' => url()->previous(),
        ]);
    }

    /* ==========================
     * Update Customer
     * ========================== */
    public function update(UpdateCustomerRequest $request, Customer $customer): RedirectResponse
    {
        $data = $request->validated();

        if (empty($data['phone']) && empty($data['email'])) {
            return redirect()->back()->withInput()->with('error', 'Please provide at least a phone number or an email address.');
        }

        $exists = Customer::where(function ($q) use ($data) {
            $q->where('identification_number', $data['identification_number']);
            if (!empty($data['email']))
                $q->orWhere('email', $data['email']);
            if (!empty($data['phone']))
                $q->orWhere('phone', $data['phone']);
        })->where('id', '!=', $customer->id)->exists();

        if ($exists) {
            return redirect()->back()->withInput()->with('error', 'Another customer with the same identification number, email, or phone already exists.');
        }

        // Regenerate customer_no if type or identification type changed
        if ($data['type'] !== $customer->type || $data['identification_type'] !== $customer->identification_type) {
            $typePrefix = $data['type'] === 'INDIVIDUAL' ? 'IND' : 'ORG';
            $data['customer_no'] = "{$typePrefix}-" . str_pad($customer->id, 5, '0', STR_PAD_LEFT);
        }

        $customer->update($data);

        return redirect()->back()->with('success', 'Customer updated successfully.');
    }

    /* ==========================
     * Delete Customer
     * ========================== */
    public function destroy(Customer $customer): RedirectResponse
    {
        $customer->delete();

        return redirect()->route('customers.index')->with('success', 'Customer deleted successfully.');
    }
}