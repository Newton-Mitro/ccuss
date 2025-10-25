<?php

namespace App\CostomerManagement\Customers\Controllers;

use App\CostomerManagement\Customers\Models\Customer;
use App\CostomerManagement\Customers\Requests\StoreCustomerRequest;
use App\CostomerManagement\Customers\Requests\UpdateCustomerRequest;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class CustomerController extends Controller
{
    public function index(): Response
    {
        // $customers = Customer::latest()->paginate(10);

        return Inertia::render('customer-management/customers/index', [
            'customers' => 0,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('customer-management/customers/create');
    }

    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        Customer::create($request->validated());

        return redirect()->route('customers.index')
            ->with('success', 'Customer created successfully.');
    }

    public function show(Customer $customer): Response
    {
        return Inertia::render('customer-management/customers/show', [
            'customer' => $customer,
        ]);
    }

    public function edit(Customer $customer): Response
    {
        return Inertia::render('customer-management/customers/edit', [
            'customer' => $customer,
        ]);
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): RedirectResponse
    {
        $customer->update($request->validated());

        return redirect()->route('customers.index')
            ->with('success', 'Customer updated successfully.');
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        $customer->delete();

        return redirect()->route('customers.index')
            ->with('success', 'Customer deleted successfully.');
    }
}
