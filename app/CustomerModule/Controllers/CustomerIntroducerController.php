<?php

namespace App\CustomerModule\Controllers;

use App\CustomerModule\Models\Customer;
use App\CustomerModule\Models\CustomerIntroducer;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CustomerIntroducerController extends Controller
{
    public function index(Request $request): Response
    {
        $query = CustomerIntroducer::query()
            ->with([
                'introducedCustomer:id,name,customer_no',
                'introducer:id,name,customer_no',
                'verifier:id,name',
            ]);

        // 🔍 Search filter
        if ($search = $request->string('search')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('introducedCustomer', function ($qc) use ($search) {
                    $qc->where('name', 'like', "%{$search}%")
                        ->orWhere('customer_no', 'like', "%{$search}%");
                })->orWhereHas('introducer', function ($qi) use ($search) {
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
            ->paginate($request->integer('per_page', 10))
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

    public function show(CustomerIntroducer $introducer): Response
    {
        $introducer->load([
            'introducedCustomer',
            'introducedCustomer.photo',
            'introducer',
            'introducer.photo',
            'verifier',
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

    public function edit(CustomerIntroducer $introducer): Response
    {
        return Inertia::render(
            'customer-kyc/introducers/edit_introducer_page',
            [
                'introducer' => $introducer->load([
                    'introducedCustomer',
                    'introducedCustomer.photo',
                    'introducer',
                    'introducer.photo',
                ]),
            ]
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'introduced_customer_id' => ['required', 'exists:customers,id'],

            'introducer_customer_id' => [
                'required',
                'exists:customers,id',
                'different:introduced_customer_id', // ✅ FIXED
            ],

            'relationship_type' => [
                'required',
                Rule::in(['family', 'friend', 'business', 'colleague', 'other']),
            ],

            'remarks' => ['nullable', 'string'],
        ]);

        // ✅ Prevent duplicate introducer
        $exists = CustomerIntroducer::where(
            'introduced_customer_id',
            $data['introduced_customer_id']
        )
            ->where(
                'introducer_customer_id',
                $data['introducer_customer_id']
            )
            ->exists();

        if ($exists) {
            return response()->json([
                'error' => 'This introducer already exists for the customer.',
            ], 422);
        }

        $introducer = CustomerIntroducer::create([
            ...$data,
            'verification_status' => 'pending',
            'created_by' => auth()->id(),
        ]);

        return redirect()
            ->route('customers.show', $data['introduced_customer_id'])
            ->with('success', 'Introducer added successfully.');
    }

    public function update(
        Request $request,
        CustomerIntroducer $introducer
    ) {
        $data = $request->validate([
            'relationship_type' => [
                'required',
                Rule::in(['family', 'friend', 'business', 'colleague', 'other']),
            ],
            'remarks' => ['nullable', 'string'],
        ]);

        $introducer->update([
            ...$data,
            'updated_by' => auth()->id(),
        ]);

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

    public function destroy(CustomerIntroducer $introducer)
    {
        $introducer->delete();
        return redirect()->back()->with([
            'success' => 'Introducer deleted successfully.',
        ]);
    }

    public function approve(CustomerIntroducer $introducer)
    {
        if ($introducer->verification_status === 'verified') {
            return redirect()->back()->with('info', 'Already verified.');
        }

        $introducer->update([
            'verification_status' => 'verified',
            'verified_at' => now(),
            'verified_by' => auth()->id(),
            'rejection_reason' => null, // reset if previously rejected
        ]);

        return redirect()->back()->with('success', 'Family relation verified successfully.');
    }

    public function reject(Request $request, CustomerIntroducer $introducer)
    {
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

        return redirect()->back()->with('success', 'Family relation rejected successfully.');
    }
}
