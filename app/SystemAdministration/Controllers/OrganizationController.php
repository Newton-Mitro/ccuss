<?php

namespace App\SystemAdministration\Controllers;

use App\Http\Controllers\Controller;
use App\SystemAdministration\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class OrganizationController extends Controller
{
    /**
     * Display list
     */
    public function index(Request $request)
    {
        $organizations = Organization::query()
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        return Inertia::render('system-administration/organizations/index', [
            'organizations' => $organizations,
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }

    /**
     * Show create form
     */
    public function create()
    {
        return Inertia::render('system-administration/organizations/create');
    }

    /**
     * Store new organization
     */
    public function store(Request $request)
    {
        $data = $this->validateData($request);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            $data['logo_path'] = $request->file('logo')->store('uploads/organizations', 'public');
        }

        Organization::create($data);

        return redirect()
            ->route('organizations.index')
            ->with('success', 'Organization created successfully!');
    }

    /**
     * Show single organization
     */
    public function show(Organization $organization)
    {
        return Inertia::render('system-administration/organizations/show', [
            'organization' => $organization,
        ]);
    }

    /**
     * Show edit form
     */
    public function edit(Organization $organization)
    {
        return Inertia::render('system-administration/organizations/edit', [
            'organization' => $organization,
        ]);
    }

    /**
     * Update organization
     */
    public function update(Request $request, Organization $organization)
    {
        $data = $this->validateData($request, $organization->id);

        // Handle logo update
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($organization->logo) {
                Storage::disk('public')->delete($organization->logo);
            }

            $data['logo_path'] = $request->file('logo')->store('uploads/organizations', 'public');
        }

        $organization->update($data);

        return redirect()
            ->route('organizations.index')
            ->with('success', 'Organization updated successfully!');
    }

    /**
     * Delete organization
     */
    public function destroy(Organization $organization)
    {
        // Delete logo if exists
        if ($organization->logo_path) {
            Storage::disk('public')->delete($organization->logo_path);
        }

        $organization->delete();

        return redirect()
            ->route('organizations.index')
            ->with('success', 'Organization deleted!');
    }

    /**
     * Centralized validation logic
     */
    private function validateData(Request $request, $id = null)
    {
        return $request->validate([
            'code' => 'required|max:20|unique:organizations,code,' . $id,
            'name' => 'required|max:150',
            'short_name' => 'nullable|max:50',
            'registration_no' => 'nullable|max:100',
            'tax_id' => 'nullable|max:50',
            'phone' => 'nullable|max:30',
            'email' => 'nullable|email|max:100',
            'website' => 'nullable|max:150',
            'address_line1' => 'nullable|max:255',
            'address_line2' => 'nullable|max:255',
            'city' => 'nullable|max:100',
            'state' => 'nullable|max:100',
            'postal_code' => 'nullable|max:20',
            'country' => 'nullable|max:100',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);
    }
}