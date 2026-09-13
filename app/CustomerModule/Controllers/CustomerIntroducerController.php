<?php

namespace App\CustomerModule\Controllers;

use App\CustomerModule\Application\CustomerIntroducerService;
use App\CustomerModule\Models\Customer;
use App\CustomerModule\Models\CustomerIntroducer;
use App\CustomerModule\Requests\StoreIntroducerRequest;
use App\CustomerModule\Requests\UpdateIntroducerRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CustomerIntroducerController extends Controller
{
    public function __construct(
        private readonly CustomerIntroducerService $customerIntroducerService,
    ) {
        $this->middleware('permission:customer_introducer.view')->only(['index', 'show']);
        $this->middleware('permission:customer_introducer.create')->only(['create']);
        $this->middleware('permission:customer_introducer.update')->only(['update', 'edit']);
        $this->middleware('permission:customer_introducer.delete')->only(['destroy']);
        $this->middleware('permission:customer_introducer.approve')->only(['approve']);
        $this->middleware('permission:customer_introducer.reject')->only(['reject']);
    }


    public function index(Request $request, ?Customer $customer = null): Response
    {
        $query = CustomerIntroducer::query()
            ->with([
                'introducedCustomer:id,name,customer_no',
                'introducerCustomer',
                'introducerCustomer.photo',
            ])
            ->where('verification_status', 'pending')
            ->when($customer, fn($query) => $query->where('introduced_customer_id', $customer->id));

        // 🔍 Search filter
        if ($search = $request->string('search')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('introducedCustomer', function ($qc) use ($search) {
                    $qc->where('name', 'like', "%{$search}%")
                        ->orWhere('customer_no', 'like', "%{$search}%");
                })->orWhereHas('introducerCustomer', function ($qi) use ($search) {
                    $qi->where('name', 'like', "%{$search}%")
                        ->orWhere('customer_no', 'like', "%{$search}%");
                });
            });
        }

        // ✅ Verification status filter
        if (
            $request->filled('verification_status') &&
            $request->verification_status !== 'all'
        ) {
            $query->where(
                'verification_status',
                $request->verification_status
            );
        }

        $introducers = $query
            ->latest()
            ->paginate($request->integer('per_page', 18))
            ->withQueryString();

        return Inertia::render(
            'customer-kyc/introducers/list_introducer_page',
            [
                'paginated_data' => $introducers,
                'filters' => $request->only([
                    'search',
                    'verification_status',
                    'per_page',
                    'page',
                ]),
            ]
        );
    }

    public function show(Customer $customer, CustomerIntroducer $introducer): Response
    {
        abort_unless($introducer->introduced_customer_id === $customer->id, 404);
        $introducer->load([
            'introducedCustomer',
            'introducedCustomer.photo',
            'introducerCustomer',
            'introducerCustomer.photo',
            'audits',
        ]);

        return Inertia::render(
            'customer-kyc/introducers/show_introducer_page',
            [
                'introducer_request' => $introducer,
            ]
        );
    }

    public function create(Customer $customer): Response
    {
        return Inertia::render('customer-kyc/introducers/create_introducer_page', [
            'customer' => $customer->load('photo'),
        ]);
    }

    public function edit(Customer $customer, CustomerIntroducer $introducer): Response
    {
        abort_unless($introducer->introduced_customer_id === $customer->id, 404);
        return Inertia::render(
            'customer-kyc/introducers/edit_introducer_page',
            [
                'introducer' => $introducer->load([
                    'introducedCustomer',
                    'introducedCustomer.photo',
                    'introducerCustomer',
                    'introducerCustomer.photo',
                ]),
            ]
        );
    }

    public function store(StoreIntroducerRequest $request, Customer $customer)
    {
        $data = $request->validated();
        $data['introduced_customer_id'] = $customer->id;

        try {
            $this->customerIntroducerService->createIntroducer($data);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 422);
        }

        return redirect()
            ->route('customers.show', $data['introduced_customer_id'])
            ->with('success', 'Introducer added successfully.');
    }

    public function update(
        UpdateIntroducerRequest $request,
        Customer $customer,
        CustomerIntroducer $introducer
    ) {
        abort_unless($introducer->introduced_customer_id === $customer->id, 404);
        $data = $request->validated();
        $data['introduced_customer_id'] = $customer->id;

        try {
            $this->customerIntroducerService->updateIntroducer($introducer, $data);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 422);
        }

        return redirect()
            ->route('customers.show', $introducer->introduced_customer_id)
            ->with('success', 'Introducer updated successfully.');
    }

    public function verify(
        Request $request,
        CustomerIntroducer $introducer
    ): JsonResponse {
        $data = $request->validate([
            'verification_status' => [
                'required',
                Rule::in(['verified', 'rejected']),
            ],
            'remarks' => ['nullable', 'string'],
        ]);

        $introducer->update([
            'verification_status' => $data['verification_status'],
            'remarks' => $data['remarks'],
            'verified_by' => auth()->id(),
            'verified_at' => now(),
        ]);

        return response()->json([
            'message' => 'Verification status updated.',
        ]);
    }

    public function destroy(Customer $customer, CustomerIntroducer $introducer)
    {
        abort_unless($introducer->introduced_customer_id === $customer->id, 404);
        $this->customerIntroducerService->deleteIntroducer($introducer);

        return redirect()->back()->with([
            'success' => 'Introducer deleted successfully.',
        ]);
    }

    public function approve(Customer $customer, CustomerIntroducer $introducer)
    {
        abort_unless($introducer->introduced_customer_id === $customer->id, 404);
        if ($introducer->verification_status === 'verified') {
            return redirect()->back()->with('info', 'Already verified.');
        }

        $introducer->update([
            'verification_status' => 'verified',
            'verified_at' => now(),
            'verified_by' => auth()->id(),
            'rejection_reason' => null, // reset if previously rejected
        ]);

        return redirect()->back()->with('success', 'Introducer approved successfully.');
    }

    public function reject(Request $request, Customer $customer, CustomerIntroducer $introducer)
    {
        abort_unless($introducer->introduced_customer_id === $customer->id, 404);
        $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
        ]);

        if ($introducer->verification_status === 'rejected') {
            return redirect()->back()->with('info', 'Already rejected.');
        }

        $introducer->update([
            'verification_status' => 'rejected',
            'verified_at' => now(),
            'verified_by' => auth()->id(),
            'rejection_reason' => $request->rejection_reason,
        ]);

        return redirect()->back()->with('success', 'Introducer rejected successfully.');
    }
}
