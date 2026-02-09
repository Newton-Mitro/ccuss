<?php

namespace App\CostomerMgmt\Controllers;

use App\CostomerMgmt\Models\Customer;
use App\CostomerMgmt\Requests\StoreCustomerRequest;
use App\CostomerMgmt\Requests\UpdateCustomerRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Symfony\Component\HttpKernel\Exception\HttpException;

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

        return Inertia::render('customer-management/customers/create', [
            'backUrl' => url()->previous(),
        ]);
    }

    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        $data = $request->validated();

        // ✅ Require at least phone or email
        if (empty($data['phone']) && empty($data['email'])) {

            return back()
                ->withInput()
                ->with('error', 'Please provide at least a phone number or an email address.');
        }

        // ✅ Check if customer already exists
        $exists = Customer::where('identification_number', $data['identification_number'])
            ->when(!empty($data['email']), fn($q) => $q->orWhere('email', $data['email']))
            ->when(!empty($data['phone']), fn($q) => $q->orWhere('phone', $data['phone']))
            ->exists();

        if ($exists) {
            return back()
                ->withInput()
                ->with('error', 'A customer with the same identification number, email, or phone already exists.');
        }

        DB::transaction(function () use (&$data) {

            // ✅ Type prefix
            $typePrefix = $data['type'] === 'Individual' ? 'IND' : 'ORG';

            // ✅ Safe sequential number (locked)
            $lastId = Customer::lockForUpdate()->max('id') ?? 0;
            $nextNumber = str_pad($lastId + 1, 5, '0', STR_PAD_LEFT);

            // ✅ Build customer_no
            $parts = array_filter([
                $typePrefix,
                $nextNumber,
            ]);

            $data['customer_no'] = implode('-', $parts);

            Customer::create($data);
        });

        return redirect()
            ->route('customers.index')
            ->with('success', 'Customer created successfully.');
    }

    public function show(Customer $customer): Response
    {
        // Eager load all related data
        $customer->load([
            'photo',                 // Customer photo
            'addresses',             // Customer addresses
            'familyRelations',       // Family relations
            'introducers',           // Introducer info
        ]);

        return Inertia::render('customer-management/customers/show', [
            'customer' => $customer,
            'backUrl' => url()->previous(),
        ]);
    }


    public function edit(Request $request, Customer $customer): Response
    {

        $customer->load('photo');

        return Inertia::render('customer-management/customers/edit', [
            'customer' => $customer,
            'backUrl' => url()->previous(),
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

        // ✅ Check for duplicate (excluding current customer)
        $exists = Customer::where(function ($q) use ($data) {
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

        // ✅ Check if we need to regenerate customer_no
        $shouldRegenerateNo =
            $data['type'] !== $customer->type ||
            $data['identification_type'] !== $customer->identification_type;

        if ($shouldRegenerateNo) {
            // ✅ Determine type prefix
            $typePrefix = $data['type'] === 'Individual' ? 'IND' : 'ORG';

            // ✅ Keep existing numeric ID sequence
            $formattedNumber = str_pad($customer->id, 5, '0', STR_PAD_LEFT);

            // ✅ Build new customer_no
            $parts = [$typePrefix, $formattedNumber];

            $data['customer_no'] = strtoupper(implode('', $parts));
        }

        // ✅ Update record
        $customer->update($data);

        return redirect()->back()
            ->with('success', 'Customer updated successfully.');
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        $customer->delete();

        return redirect()->route('customers.index')
            ->with('success', 'Customer deleted successfully.');
    }


}