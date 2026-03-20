<?php
namespace App\CustomerModule\Controllers;

use App\CustomerModule\Models\KycDocument;
use App\CustomerModule\Models\KycProfile;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KycProfileController extends Controller
{
    public function index(Request $request)
    {
        $query = KycProfile::with('customer', 'verifier');

        // 🔍 Search filter (by customer name)
        if ($search = $request->string('search')->toString()) {
            $query->whereHas('customer', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        // ✅ Verification status filter
        if ($status = $request->input('verification_status')) {
            if ($status !== 'all') {
                $query->where('verification_status', $status);
            }
        }

        $profiles = $query
            ->latest()
            ->paginate($request->integer('per_page', 10))
            ->withQueryString();

        return Inertia::render('customer-kyc/kyc-profiles/list_kyc_profile_page', [
            'profiles' => $profiles,
            'filters' => $request->only([
                'search',
                'verification_status',
                'per_page',
                'page',
            ]),
        ]);
    }

    public function create()
    {
        return Inertia::render('customer-kyc/kyc-profiles/create_kyc_profile_page');
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'kyc_level' => 'required|in:BASIC,FULL,ENHANCED',
            'risk_level' => 'required|in:LOW,MEDIUM,HIGH',
            'remarks' => 'nullable|string',
        ]);

        KycProfile::create($request->only([
            'customer_id',
            'kyc_level',
            'risk_level',
            'remarks'
        ]));

        return redirect()->route('kyc-profiles.index')->with('success', 'KYC profile created.');
    }

    public function edit(KycProfile $kycProfile)
    {
        return Inertia::render('customer-kyc/kyc-profiles/edit_kyc_profile_page', [
            'profile' => $kycProfile
        ]);
    }

    public function update(Request $request, KycProfile $kycProfile)
    {
        $request->validate([
            'kyc_level' => 'nullable|in:BASIC,FULL,ENHANCED',
            'risk_level' => 'nullable|in:LOW,MEDIUM,HIGH',
            'verification_status' => 'nullable|in:PENDING,APPROVED,REJECTED',
            'verified_by' => 'nullable|exists:users,id',
            'remarks' => 'nullable|string',
        ]);

        $kycProfile->update($request->only([
            'kyc_level',
            'risk_level',
            'verification_status',
            'verified_by',
            'remarks'
        ]));

        if ($request->verification_status === 'APPROVED') {
            $kycProfile->verified_at = now();
            $kycProfile->save();
        }

        return redirect()->route('kyc-profiles.index')->with('success', 'KYC profile updated.');
    }

    public function destroy(KycProfile $kycProfile)
    {
        $kycProfile->delete();
        return redirect()->route('kyc-profiles.index')->with('success', 'KYC profile deleted.');
    }

    public function show(KycProfile $kycProfile)
    {
        $kycDocuments = KycDocument::where('customer_id', $kycProfile->customer_id)->get();
        return Inertia::render('customer-kyc/kyc-profiles/show_kyc_profile_page', [
            'profile' => $kycProfile->load('customer', 'verifier'),
            'kyc_documents' => $kycDocuments
        ]);
    }
}