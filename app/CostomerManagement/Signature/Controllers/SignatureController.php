<?php

namespace App\CostomerManagement\Signature\Controllers;

use App\CostomerManagement\Customer\Models\Customer;
use App\CostomerManagement\Signature\Models\Signature;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;

class SignatureController extends Controller
{
    public function index(): Response
    {
        $signatures = Signature::with('customer')->latest()->paginate(10)->withQueryString();

        return Inertia::render('customer-management/signatures/index', [
            'signatures' => $signatures,
            'filters' => request()->only('search'),
        ]);
    }

    // Show form to create a signature
    public function create(): Response
    {
        return Inertia::render('customer-management/signatures/create');
    }

    // Store signature
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'signature_path' => 'required|file|mimes:png,jpg,jpeg|max:2048',
        ]);

        // Upload file
        $path = $request->file('signature_path')->store('signatures', 'public');

        Signature::create([
            'customer_id' => $request->customer_id,
            'signature_path' => $path,
        ]);

        return redirect()->route('signatures.index')->with('success', 'Signature added successfully.');
    }

    // Show single signature
    public function show(Signature $signature): Response
    {
        return Inertia::render('customer-management/signatures/show', [
            'signature' => $signature->load('customer'),
        ]);
    }

    // Show edit form
    public function edit(Signature $signature): Response
    {
        return Inertia::render('customer-management/signatures/edit', [
            'signature' => $signature->load('customer'),
        ]);
    }

    // Update signature
    public function update(Request $request, Signature $signature): RedirectResponse
    {
        $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'signature_path' => 'nullable|file|mimes:png,jpg,jpeg|max:2048',
        ]);

        $data = ['customer_id' => $request->customer_id];

        if ($request->hasFile('signature_path')) {
            $data['signature_path'] = $request->file('signature_path')->store('signatures', 'public');
        }

        $signature->update($data);

        return redirect()->route('signatures.index')->with('success', 'Signature updated successfully.');
    }

    // Delete signature
    public function destroy(Signature $signature): RedirectResponse
    {
        $signature->delete();

        return redirect()->route('signatures.index')->with('success', 'Signature deleted successfully.');
    }
}
