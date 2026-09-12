<?php
namespace App\CustomerModule\Controllers;

use App\CustomerModule\Application\KycDocumentService;
use App\CustomerModule\Models\Customer;
use App\CustomerModule\Models\KycDocument;
use App\CustomerModule\Requests\StoreKycDocumentRequest;
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

    public function index(Request $request)
    {
        $query = KycDocument::with('customer');

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

    public function store(StoreKycDocumentRequest $request)
    {
        $data = $request->validated();

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

    public function edit(KycDocument $kycDocument)
    {
        return Inertia::render('customer-kyc/kyc-documents/edit_kyc_document_page', [
            'document' => $kycDocument,
        ]);
    }

    public function show(KycDocument $kycDocument)
    {
        return Inertia::render('customer-kyc/kyc-documents/show_kyc_document_page', [
            'document' => $kycDocument->load('customer', 'customer.photo', 'audits'),
        ]);
    }

    public function destroy(KycDocument $kycDocument)
    {
        $this->kycDocumentService->deleteDocument($kycDocument);

        return redirect()->back()->with([
            'success' => 'KYC document deleted successfully.',
        ]);
    }

    public function approve(KycDocument $kycDocument)
    {
        if ($kycDocument->verification_status === 'verified') {
            return redirect()->back()->with('info', 'Already verified.');
        }

        $kycDocument->update([
            'verification_status' => 'verified',
            'verified_at' => now(),
            'verified_by' => auth()->id(),
            'rejection_reason' => null, // reset if previously rejected
        ]);

        return redirect()->back()->with('success', 'KYC document verified successfully.');
    }

    public function reject(Request $request, KycDocument $kycDocument)
    {
        $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
        ]);

        if ($kycDocument->verification_status === 'rejected') {
            return redirect()->back()->with('info', 'Already rejected.');
        }

        $kycDocument->update([
            'verification_status' => 'rejected',
            'verified_at' => now(),
            'verified_by' => auth()->id(),
            'rejection_reason' => $request->rejection_reason,
        ]);

        return redirect()->back()->with('success', 'KYC document rejected successfully.');
    }
}