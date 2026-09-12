<?php

namespace App\CustomerModule\Controllers;

use App\CustomerModule\Application\CustomerService;
use App\CustomerModule\Models\Customer;
use App\CustomerModule\Requests\StoreCustomerRequest;
use App\CustomerModule\Requests\UpdateCustomerRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function __construct(
        private readonly CustomerService $customerService,
    ) {
        $this->middleware('permission:customer.view')->only(['index', 'show']);
        $this->middleware('permission:customer.create')->only(['create']);
        $this->middleware('permission:customer.update')->only(['update', 'edit']);
        $this->middleware('permission:customer.delete')->only(['destroy']);
        $this->middleware('permission:customer.search')->only(['search']);
    }

    public function search(Request $request): JsonResponse
    {
        $search = $request->query('search');

        if (!$search) {
            return response()->json(['data' => []]);
        }

        return response()->json(
            $this->customerService->searchCustomers($search, $request->input('status'))
        );
    }

    public function index(Request $request): Response
    {
        $customers = $this->customerService->listCustomers(
            $request->input('search'),
            $request->input('status'),
            $request->input('per_page', 18),
        );

        return Inertia::render('customer-kyc/customers/list_customer_page', [
            'paginated_data' => $customers,
            'filters' => $request->only(['search', 'status', 'per_page', 'page']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('customer-kyc/customers/create_customer_page');
    }

    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['organization_id'] = auth()->user()->organization_id;
        $data['branch_id'] = auth()->user()->branch_id;

        try {
            $customer = $this->customerService->createCustomer(
                $data,
                $request->hasFile('photo') ? $request->file('photo') : null,
            );
        } catch (\InvalidArgumentException | \RuntimeException $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }

        return redirect()->route('customers.show', $customer->id)
            ->with('success', 'Customer ' . $customer->name . ' created successfully.');
    }

    public function show(Customer $customer): Response
    {
        $customer->load([
            'photo',
            'addresses',
            'familyRelations.relative.photo',
            'introducers.introducedCustomer.photo',
            'introducers.introducerCustomer.photo',
            'kycProfile',
            'kycDocuments',
            'audits',
        ]);

        return Inertia::render('customer-kyc/customers/show_customer_page', [
            'customer' => $customer,
        ]);
    }

    public function edit(Customer $customer): Response
    {
        $customer->load(['photo', 'kycProfile', 'kycDocuments']);

        return Inertia::render('customer-kyc/customers/edit_customer_page', [
            'customer' => $customer,
        ]);
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): RedirectResponse
    {
        $data = $request->validated();

        try {
            $this->customerService->updateCustomer(
                $customer,
                $data,
                $request->hasFile('photo') ? $request->file('photo') : null,
            );
        } catch (\InvalidArgumentException | \RuntimeException $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }

        return redirect()->route('customers.show', $customer->id)
            ->with('success', 'Customer ' . $customer->name . ' updated successfully.');
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        $this->customerService->deleteCustomer($customer);

        return redirect()->route('customers.index')
            ->with('success', 'Customer ' . $customer->name . ' deleted successfully.');
    }
}