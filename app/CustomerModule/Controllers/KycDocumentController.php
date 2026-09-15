<?php
namespace App\CustomerModule\Controllers;

use App\CustomerModule\Application\KycDocumentService;
use App\CustomerModule\Models\Customer;
use App\CustomerModule\Models\KycDocument;
use App\CustomerModule\Requests\StoreKycDocumentRequest;
use App\CustomerModule\Requests\UpdateKycDocumentRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KycDocumentController extends Controller
{
    public function __construct(
        private readonly KycDocumentService $kycDocumentService,
    ) {
        $this->middleware('permission:customer_kyc_document.view')->only(['index', 'show']);
        $this->middleware('permission:customer_kyc_document.create')->only(['create']);
        $this->middleware('permission:customer_kyc_document.update')->only(['update', 'edit']);
        $this->middleware('permission:customer_kyc_document.delete')->only(['destroy']);
        $this->middleware('permission:customer_kyc_document.approve')->only(['approve']);
        $this->middleware('permission:customer_kyc_document.reject')->only(['reject']);
    }

    public function index(Request $request, ?Customer $customer = null)
    {
        $query = KycDocument::with('customer')
            ->where('verification_status', KycDocument::STATUS_PENDING)
            ->when($customer, fn($query) => $query->where('customer_id', $customer->id));

        // 🔍 Search (by customer name)
        if ($search = $request->string('search')->toString()) {
            $query->whereHas('customer', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        // 📄 Document type filter
        if ($type = $request->input('document_type')) {
            if ($type !== 'all') {
                $query->where('document_type', $type);
            }
        }

        // ✅ Verification status filter
        if ($status = $request->input('verification_status')) {
            if ($status !== 'all') {
                $query->where('verification_status', $status);
            }
        }

        $documents = $query
            ->latest()
            ->paginate($request->integer('per_page', 18))
            ->withQueryString();

        return Inertia::render('customer-kyc/kyc-documents/list_kyc_documents_page', [
            'paginated_data' => $documents,
            'filters' => $request->only([
                'search',
                'document_type',
                'verification_status',
                'per_page',
                'page',
            ]),
        ]);
    }

    public function create(Customer $customer)
    {
        return Inertia::render('customer-kyc/kyc-documents/create_kyc_document_page', [
            'customer' => $customer->load(['photo']),
        ]);
    }

    public function store(StoreKycDocumentRequest $request, Customer $customer)
    {
        $data = $request->validated();
        $data['customer_id'] = $customer->id;

        $file = $request->file('file');

        try {
            $this->kycDocumentService->createDocument($file, $data);
        } catch (\InvalidArgumentException $e) {
            return redirect()->back()->withErrors(['document' => $e->getMessage()]);
        }

        return redirect()
            ->route('customers.show', $request->customer_id)
            ->with('success', 'KYC document added successfully.');
    }

    public function edit(Customer $customer, KycDocument $kycDocument)
    {
        abort_unless($kycDocument->customer_id === $customer->id, 404);
        return Inertia::render('customer-kyc/kyc-documents/edit_kyc_document_page', [
            'document' => $kycDocument->load('customer', 'customer.photo'),
        ]);
    }

    public function update(
        UpdateKycDocumentRequest $request,
        Customer $customer,
        KycDocument $kycDocument,
    ) {
        abort_unless($kycDocument->customer_id === $customer->id, 404);

        try {
            $document = $this->kycDocumentService->updateDocument(
                $kycDocument,
                $request->validated(),
                $request->file('file'),
            );
        } catch (\InvalidArgumentException $e) {
            return redirect()->back()->withErrors(['document' => $e->getMessage()]);
        }

        return redirect()
            ->route('customers.kyc-documents.show', [
                $document->customer_id,
                $document->id,
            ])
            ->with('success', 'KYC document updated successfully.');
    }

    public function show(Customer $customer, KycDocument $kycDocument)
    {
        abort_unless($kycDocument->customer_id === $customer->id, 404);
        return Inertia::render('customer-kyc/kyc-documents/show_kyc_document_page', [
            'document' => $kycDocument->load('customer', 'customer.photo', 'audits'),
        ]);
    }

    public function destroy(Customer $customer, KycDocument $kycDocument)
    {
        abort_unless($kycDocument->customer_id === $customer->id, 404);
        $this->kycDocumentService->deleteDocument($kycDocument);

        return redirect()->back()->with([
            'success' => 'KYC document deleted successfully.',
        ]);
    }

    public function approve(Customer $customer, KycDocument $kycDocument)
    {
        abort_unless($kycDocument->customer_id === $customer->id, 404);
        if ($kycDocument->verification_status === KycDocument::STATUS_VERIFIED) {
            return redirect()->back()->with('info', 'Already verified.');
        }

        $kycDocument->update([
            'verification_status' => KycDocument::STATUS_VERIFIED,
            'verified_at' => now(),
            'verified_by' => auth()->id(),
            'rejection_reason' => null, // reset if previously rejected
        ]);

        return redirect()->back()->with('success', 'KYC document verified successfully.');
    }

    public function reject(Request $request, Customer $customer, KycDocument $kycDocument)
    {
        abort_unless($kycDocument->customer_id === $customer->id, 404);
        $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
        ]);

        if ($kycDocument->verification_status === KycDocument::STATUS_REJECTED) {
            return redirect()->back()->with('info', 'Already rejected.');
        }

        $kycDocument->update([
            'verification_status' => KycDocument::STATUS_REJECTED,
            'verified_at' => now(),
            'verified_by' => auth()->id(),
            'rejection_reason' => $request->rejection_reason,
        ]);

        return redirect()->back()->with('success', 'KYC document rejected successfully.');
    }
}