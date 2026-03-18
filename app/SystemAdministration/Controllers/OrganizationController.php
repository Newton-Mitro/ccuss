<?php

namespace App\SystemAdministration\Controllers;

use App\Http\Controllers\Controller;
use App\SystemAdministration\Models\Organization;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrganizationController extends Controller
{
    // Display list
    public function index(Request $request)
    {
        // Get filters from query
        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);

        $query = Organization::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $organizations = $query->orderBy('name')->paginate($perPage)->withQueryString();

        return Inertia::render('system-administration/organizations/index', [
            'organizations' => $organizations,
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }

    // Show create form
    public function create()
    {
        return Inertia::render('system-administration/organizations/create');
    }

    // Store new organization
    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|unique:organizations,code|max:20',
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
            'logo_path' => 'nullable|max:255',
        ]);

        Organization::create($data);

        return redirect()->route('organizations.index')->with('success', 'Organization created successfully!');
    }

    // Show single organization
    public function show(Organization $organization)
    {
        return Inertia::render('system-administration/organizations/show', [
            'organization' => $organization,
        ]);
    }

    // Show edit form
    public function edit(Organization $organization)
    {
        return Inertia::render('system-administration/organizations/edit', [
            'organization' => $organization,
        ]);
    }

    // Update organization
    public function update(Request $request, Organization $organization)
    {
        $data = $request->validate([
            'code' => 'required|unique:organizations,code,' . $organization->id . '|max:20',
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
            'logo_path' => 'nullable|max:255',
        ]);

        $organization->update($data);

        return redirect()->route('organizations.index')->with('success', 'Organization updated successfully!');
    }

    // Delete
    public function destroy(Organization $organization)
    {
        $organization->delete();
        return redirect()->route('organizations.index')->with('success', 'Organization deleted!');
    }
}