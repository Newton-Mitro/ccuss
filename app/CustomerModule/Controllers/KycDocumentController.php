<?php
namespace App\CustomerModule\Controllers;

use App\CustomerModule\Models\Customer;
use App\CustomerModule\Models\KycDocument;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class KycDocumentController extends Controller
{
    public function index(Request $request)
    {
        $query = KycDocument::with('customer', 'verifier');

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
            ->paginate($request->integer('per_page', 10))
            ->withQueryString();

        return Inertia::render('customer-kyc/kyc-documents/list_kyc_documents_page', [
            'documents' => $documents,
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

    public function store(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'document_type' => 'required|in:NID_FRONT,NID_BACK,SMART_NID,PASSPORT,DRIVING_LICENSE,BIRTH_CERTIFICATE,UTILITY_BILL,ELECTRICITY_BILL,WATER_BILL,GAS_BILL,BANK_STATEMENT,RENTAL_AGREEMENT,TIN_CERTIFICATE,TAX_RETURN,SALARY_SLIP,INCOME_CERTIFICATE,TRADE_LICENSE,CERTIFICATE_OF_INCORPORATION,MEMORANDUM_OF_ASSOCIATION,ARTICLES_OF_ASSOCIATION,PARTNERSHIP_DEED,PHOTO,SIGNATURE,LIVE_SELFIE,PEP_DECLARATION,FATCA_FORM',
            'file' => 'required|file|max:10240', // 10MB
            'alt_text' => 'nullable|string|max:255',
        ]);

        $file = $request->file('file');
        $path = $file->store('customers/' . $request->customer_id, 'public');

        KycDocument::create([
            'customer_id' => $request->customer_id,
            'document_type' => $request->document_type,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'mime' => $file->getClientMimeType(),
            'alt_text' => $request->alt_text,
        ]);

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
            'document' => $kycDocument->load('customer', 'customer.photo', 'verifier'),
        ]);
    }

    public function destroy(KycDocument $kycDocument)
    {
        Storage::delete($kycDocument->file_path);
        $kycDocument->delete();

        return redirect()->back()->with([
            'success' => 'KYC document deleted successfully.',
        ]);
    }

    public function approve(KycDocument $kycDocument)
    {
        if ($kycDocument->verification_status === 'VERIFIED') {
            return redirect()->back()->with('info', 'Already verified.');
        }

        $kycDocument->update([
            'verification_status' => 'VERIFIED',
            'verified_at' => now(),
            'verified_by' => auth()->id(),
            'rejection_reason' => null, // reset if previously rejected
        ]);

        return redirect()->back()->with('success', 'Family relation verified successfully.');
    }

    public function reject(Request $request, KycDocument $kycDocument)
    {
        $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
        ]);

        if ($kycDocument->verification_status === 'REJECTED') {
            return redirect()->back()->with('info', 'Already rejected.');
        }

        $kycDocument->update([
            'verification_status' => 'REJECTED',
            'verified_at' => now(),
            'verified_by' => auth()->id(),
            'rejection_reason' => $request->rejection_reason,
        ]);

        return redirect()->back()->with('success', 'Family relation rejected successfully.');
    }
}