<?php

namespace App\SystemAdministration\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class OrganizationContextController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'organization_id' => ['required', 'integer', 'exists:organizations,id'],
        ]);

        $request->session()->put('active_organization_id', $validated['organization_id']);

        return redirect()->back()->with('success', 'Organization context switched successfully.');
        // return redirect()->intended(route('dashboard'));
    }
}