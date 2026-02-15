<?php
namespace App\CostomerMgmt\Controllers;

use App\CostomerMgmt\Models\Customer;
use App\CostomerMgmt\Models\CustomerIntroducer;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CustomerIntroducerController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only([
            'search',
            'verification_status',
            'per_page',
            'page',
        ]);

        $introducers = CustomerIntroducer::query()
            ->with([
                'introducedCustomer:id,name',
                'introducerCustomer:id,name',
                'verifiedBy:id,name',
            ])

            // Search by customer names
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->search;

                $q->whereHas(
                    'introducedCustomer',
                    fn($qq) =>
                    $qq->where('name', 'like', "%{$search}%")
                )->orWhereHas(
                        'introducerCustomer',
                        fn($qq) =>
                        $qq->where('name', 'like', "%{$search}%")
                    );
            })

            // Filter by verification status
            ->when(
                $request->verification_status &&
                $request->verification_status !== 'all',
                fn($q) =>
                $q->where(
                    'verification_status',
                    $request->verification_status
                )
            )

            ->latest()
            ->paginate($request->integer('per_page', 10))
            ->withQueryString();

        return Inertia::render('customer-mgmt/introducers/introducers_index', [
            'introducers' => $introducers,
            'filters' => $filters,
        ]);
    }

    /**
     * List introducers for a customer
     */
    public function getCustomerIntroducers(Request $request, Customer $customer)
    {
        return Inertia::render('customer-mgmt/introducers/introducers_index', [
            'customer' => $customer,
            'introducers' => CustomerIntroducer::with([
                'introducerCustomer:id,name',
                'verifiedBy:id,name',
            ])
                ->where('introduced_customer_id', $customer->id)
                ->latest()
                ->paginate(10),

            'relationshipTypes' => [
                'FAMILY',
                'FRIEND',
                'BUSINESS',
                'COLLEAGUE',
                'OTHER',
            ],
        ]);
    }

    /**
     * Store introducer
     */
    public function store(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'introducer_customer_id' => [
                'required',
                'exists:customers,id',
                Rule::different('introduced_customer_id'),
            ],
            'introducer_account_id' => ['nullable', 'integer'],
            'relationship_type' => [
                'required',
                Rule::in(['FAMILY', 'FRIEND', 'BUSINESS', 'COLLEAGUE', 'OTHER']),
            ],
            'remarks' => ['nullable', 'string'],
        ]);

        CustomerIntroducer::create([
            ...$validated,
            'introduced_customer_id' => $customer->id,
            'verification_status' => 'PENDING',
            'created_by' => auth()->id(),
        ]);

        return redirect()
            ->back()
            ->with('success', 'Introducer added successfully');
    }

    /**
     * Update introducer
     */
    public function update(
        Request $request,
        CustomerIntroducer $customerIntroducer
    ) {
        $validated = $request->validate([
            'relationship_type' => [
                'required',
                Rule::in(['FAMILY', 'FRIEND', 'BUSINESS', 'COLLEAGUE', 'OTHER']),
            ],
            'remarks' => ['nullable', 'string'],
        ]);

        $customerIntroducer->update([
            ...$validated,
            'updated_by' => auth()->id(),
        ]);

        return redirect()
            ->back()
            ->with('success', 'Introducer updated successfully');
    }

    /**
     * Verify / Reject
     */
    public function verify(
        Request $request,
        CustomerIntroducer $customerIntroducer
    ) {
        $validated = $request->validate([
            'verification_status' => ['required', Rule::in(['VERIFIED', 'REJECTED'])],
            'remarks' => ['nullable', 'string'],
        ]);

        $customerIntroducer->update([
            'verification_status' => $validated['verification_status'],
            'remarks' => $validated['remarks'],
            'verified_by' => auth()->id(),
            'verified_at' => now(),
        ]);

        return redirect()
            ->back()
            ->with('success', 'Verification status updated');
    }

    /**
     * Delete introducer
     */
    public function destroy(CustomerIntroducer $customerIntroducer)
    {
        $customerIntroducer->delete();

        return redirect()
            ->back()
            ->with('success', 'Introducer removed');
    }
}
