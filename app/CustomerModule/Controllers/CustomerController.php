<?php

namespace App\CustomerModule\Controllers;

use App\CustomerModule\Models\Customer;
use App\CustomerModule\Models\KycProfile;
use App\CustomerModule\Requests\StoreCustomerRequest;
use App\CustomerModule\Requests\UpdateCustomerRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class CustomerController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:customer.view')->only(['index', 'show']);
        $this->middleware('permission:customer.create')->only(['create']);
        $this->middleware('permission:customer.update')->only(['update', 'edit']);
        $this->middleware('permission:customer.delete')->only(['destroy']);
        $this->middleware('permission:customer.search')->only(['search']);
    }

    /* ==========================
     * Search Customers (AJAX)
     * ========================== */
    public function search(Request $request): JsonResponse
    {
        $search = $request->query('search');

        if (!$search) {
            return response()->json(['data' => []]);
        }

        $query = Customer::with(['photo', 'kycProfile']);

        $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('customer_no', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%");
        });

        if ($kycStatus = $request->input('kyc_status')) {
            if ($kycStatus !== 'all') {
                $query->where('kyc_status', $kycStatus);
            }
        }

        return response()->json(
            $query->latest()->limit(20)->get()
        );
    }

    /* ==========================
     * List Customers
     * ========================== */
    public function index(Request $request): Response
    {
        $query = Customer::with(['photo', 'kycProfile']);

        if ($search = $request->input('search')) {
            $query->where(
                fn($q) =>
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('customer_no', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
            );
        }

        if ($kycStatus = $request->input('kyc_status')) {
            if ($kycStatus !== 'all') {
                $query->where('kyc_status', $kycStatus);
            }
        }

        $customers = $query->latest()
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        return Inertia::render('customer-kyc/customers/list_customer_page', [
            'paginated_data' => $customers,
            'filters' => $request->only(['search', 'kyc_status', 'per_page', 'page']),
        ]);
    }

    /* ==========================
     * Create Customer Page
     * ========================== */
    public function create(): Response
    {
        return Inertia::render('customer-kyc/customers/create_customer_page');
    }

    /* ==========================
     * Store Customer
     * ========================== */
    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['organization_id'] = auth()->user()->organization_id;
        $data['branch_id'] = auth()->user()->branch_id;

        if (empty($data['phone']) && empty($data['email'])) {
            return back()->withInput()->with('error', 'Phone or email is required.');
        }

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
            return back()->withInput()->with('error', 'Duplicate customer detected. (ID, Email, Phone) already exists.');
        }

        $customer = null; // ✅ declare outside

        DB::transaction(function () use ($request, $data, &$customer) {

            $typePrefix = $data['type'] === 'individual' ? 'IND' : 'ORG';

            $lastId = Customer::lockForUpdate()->max('id') ?? 0;
            $nextNumber = str_pad($lastId + 1, 5, '0', STR_PAD_LEFT);

            $data['customer_no'] = "{$typePrefix}-{$nextNumber}";

            /** =========================
             * Create Customer
             * ========================= */
            $customer = Customer::create($data);

            /** =========================
             * Create KYC Profile
             * ========================= */
            KycProfile::create([
                'customer_id' => $customer->id,
                'kyc_level' => KycProfile::LEVEL_BASIC,
                'risk_level' => KycProfile::RISK_HIGH
            ]);

            /** =========================
             * Handle Photo Upload
             * ========================= */
            if ($request->hasFile('photo')) {

                $file = $request->file('photo');
                $path = $file->store('uploads/customers/' . $customer->id, 'public');

                $customer->kycDocuments()->create([
                    'document_type' => 'photo',
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'mime' => $file->getClientMimeType(),
                    'url' => asset('storage/' . $path),
                    'verification_status' => 'pending',
                ]);
            }
        });

        return redirect()->route('customers.show', $customer->id)
            ->with('success', 'Customer ' . $customer->name . ' created successfully.');
    }

    /* ==========================
     * Show Customer
     * ========================== */
    public function show(Customer $customer): Response
    {
        $customer->load([
            'photo',
            'addresses',
            'relatedToMe.customer.photo',
            'familyRelations.relative.photo',
            'introducers.introducer.photo',
            'kycProfile',
            'kycDocuments',
            'onlineServiceClient.organization',
            'onlineServiceClient.branch',
            'audits',
        ]);

        return Inertia::render('customer-kyc/customers/show_customer_page', [
            'customer' => $customer,
        ]);
    }

    /* ==========================
     * Edit Customer Page
     * ========================== */
    public function edit(Customer $customer): Response
    {
        $customer->load(['photo', 'kycProfile', 'kycDocuments']);

        return Inertia::render('customer-kyc/customers/edit_customer_page', [
            'customer' => $customer,
        ]);
    }

    /* ==========================
     * Update Customer
     * ========================== */
    public function update(UpdateCustomerRequest $request, Customer $customer): RedirectResponse
    {
        $data = $request->validated();


        if (empty($data['phone']) && empty($data['email'])) {
            return back()->withInput()->with('error', 'Phone or email is required.');
        }

        $exists = Customer::where(function ($q) use ($data) {
            $q->where('identification_number', $data['identification_number']);

            if (!empty($data['email'])) {
                $q->orWhere('email', $data['email']);
            }

            if (!empty($data['phone'])) {
                $q->orWhere('phone', $data['phone']);
            }
        })->where('id', '!=', $customer->id)->exists();

        if ($exists) {
            return back()->withInput()->with('error', 'Duplicate customer detected.');
        }

        DB::transaction(function () use ($request, $customer, $data) {

            /** =========================
             * Regenerate Customer No
             * ========================= */
            if (
                $data['type'] !== $customer->type ||
                $data['identification_type'] !== $customer->identification_type
            ) {
                $prefix = $data['type'] === 'individual' ? 'IND' : 'ORG';
                $data['customer_no'] = "{$prefix}-" . str_pad($customer->id, 5, '0', STR_PAD_LEFT);
            }

            /** =========================
             * Update Customer
             * ========================= */
            $customer->update($data);

            /** =========================
             * Handle Photo Update
             * ========================= */
            if ($request->hasFile('photo')) {

                // Delete old photo (DB + file)
                $oldPhoto = $customer->photo;

                if ($oldPhoto) {
                    // delete file from storage
                    if (\Storage::disk('public')->exists($oldPhoto->file_path)) {
                        \Storage::disk('public')->delete($oldPhoto->file_path);
                    }

                    // delete DB record
                    $oldPhoto->delete();
                }

                // Store new photo
                $file = $request->file('photo');
                $path = $file->store('uploads/customers/' . $customer->id, 'public');

                $customer->kycDocuments()->create([
                    'document_type' => 'photo',
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'mime' => $file->getClientMimeType(),
                    'url' => asset('storage/' . $path),
                    'verification_status' => 'pending',
                ]);
            }
        });

        return redirect()->route('customers.show', $customer->id)
            ->with('success', 'Customer ' . $customer->name . ' updated successfully.');
    }

    /* ==========================
     * Delete Customer
     * ========================== */
    public function destroy(Customer $customer): RedirectResponse
    {
        $customer->delete();

        return redirect()->route('customers.index')
            ->with('success', 'Customer ' . $customer->name . ' deleted successfully.');
    }
}