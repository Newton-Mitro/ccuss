<?php

namespace App\CostomerManagement\Signature\Controllers;

use App\CostomerManagement\Signature\Models\Signature;
use App\CostomerManagement\Signature\Requests\StoreSignatureRequest;
use App\CostomerManagement\Signature\Requests\UpdateSignatureRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;

class SignatureController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);
        if (!empty($search)) {
            $signatures = Signature::with(['customer'])->whereHas('customer', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")->orWhere('customer_no', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%")->orWhere('phone', 'like', "%{$search}%");
            })->latest()->paginate($perPage)->withQueryString();
        } else {
            // Return an empty LengthAwarePaginator instead of a plain collection 
            $signatures = new \Illuminate\Pagination\LengthAwarePaginator(
                [], // empty items 
                0, // total items 
                $perPage,
                $request->input('page', 1),
                ['path' => $request->url(), 'query' => $request->query()]
            );
        }
        return Inertia::render('customer-management/signatures/index', ['signatures' => $signatures, 'filters' => $request->only(['search', 'per_page', 'page']),]);
    }

    public function create(): Response
    {
        return Inertia::render('customer-management/signatures/create');
    }

    public function store(StoreSignatureRequest $request): RedirectResponse
    {
        // Check if a signature already exists for this customer
        $exists = Signature::where('customer_id', $request->customer_id)->exists();

        if ($exists) {
            return redirect()
                ->back()
                ->withErrors(['customer_id' => 'This customer already has a signature.'])
                ->withInput();
        }

        Signature::create([
            'customer_id' => $request->customer_id,
            'signature_id' => $request->signature_id,
        ]);

        return redirect()->route('signatures.index')
            ->with('success', 'Signature added successfully.');
    }

    public function show(Signature $signature): Response
    {
        return Inertia::render('customer-management/signatures/show', [
            'signature' => $signature->load('customer', 'signature'),
        ]);
    }

    public function edit(Signature $signature): Response
    {
        return Inertia::render('customer-management/signatures/edit', [
            'signature' => $signature->load('customer', 'signature'),
        ]);
    }

    public function update(UpdateSignatureRequest $request, Signature $signature): RedirectResponse
    {
        $data = ['customer_id' => $request->customer_id];

        if ($request->filled('signature_id')) {
            $data['signature_id'] = $request->signature_id;
        }

        $signature->update($data);

        return redirect()->route('signatures.index')
            ->with('success', 'Signature updated successfully.');
    }

    public function destroy(Signature $signature): RedirectResponse
    {
        $signature->delete();

        return redirect()->route('signatures.index')
            ->with('success', 'Signature deleted successfully.');
    }
}
