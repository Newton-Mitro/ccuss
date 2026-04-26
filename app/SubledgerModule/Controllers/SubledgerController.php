<?php

namespace App\SubledgerModule\Controllers;

use App\GeneralAccounting\Models\LedgerAccount;
use App\Http\Controllers\Controller;
use App\SubledgerModule\Models\Subledger;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubledgerController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | List
    |--------------------------------------------------------------------------
    */
    public function index(Request $request): Response
    {
        $query = Subledger::query()
            ->with('glAccount:id,name,code');

        // 🔍 Search
        if ($search = trim($request->input('search'))) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        // ✅ Filter by subledger_type
        if ($type = $request->input('subledger_type')) {
            $query->where('subledger_type', $type);
        }

        // ✅ Filter by subledger_sub_type
        if ($subType = $request->input('subledger_sub_type')) {
            $query->where('subledger_sub_type', $subType);
        }

        // ✅ Active filter (optional but useful)
        if (!is_null($request->input('is_active'))) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $subledgers = $query
            ->latest()
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        return Inertia::render('subledger-module/subledgers/list-subledgers-page', [
            'subledgers' => $subledgers,
            'filters' => $request->only([
                'search',
                'per_page',
                'page',
                'subledger_type',
                'subledger_sub_type',
                'is_active',
            ]),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Create
    |--------------------------------------------------------------------------
    */
    public function create(): Response
    {
        return Inertia::render('subledger-module/subledgers/create-subledger-page', [
            'glAccounts' => LedgerAccount::query()
                ->where('is_control_account', true)
                ->where('is_active', true)
                ->select('id', 'name', 'code')
                ->get(),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Store
    |--------------------------------------------------------------------------
    */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:20|unique:subledgers,code',
            'name' => 'required|string|max:255',
            'short_name' => 'nullable|string|max:100',

            'subledger_type' => 'nullable|string|max:150',
            'subledger_sub_type' => 'nullable|string|max:150',

            'gl_account_id' => 'required|exists:ledger_accounts,id',
            'is_active' => 'boolean',
        ]);

        $subledger = Subledger::create($validated);

        return redirect()
            ->route('subledgers.index')
            ->with('success', "{$subledger->name} created successfully.");
    }

    /*
    |--------------------------------------------------------------------------
    | Show
    |--------------------------------------------------------------------------
    */
    public function show(Subledger $subledger): Response
    {
        return Inertia::render('subledger-module/subledgers/show-subledger-page', [
            'subledger' => $subledger->load('glAccount'),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Edit
    |--------------------------------------------------------------------------
    */
    public function edit(Subledger $subledger): Response
    {
        return Inertia::render('subledger-module/subledgers/edit-subledger-page', [
            'subledger' => $subledger,
            'glAccounts' => LedgerAccount::query()
                ->where('is_control_account', true)
                ->where('is_active', true)
                ->select('id', 'name', 'code')
                ->get(),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Update
    |--------------------------------------------------------------------------
    */
    public function update(Request $request, Subledger $subledger)
    {
        $validated = $request->validate([
            'code' => "required|string|max:20|unique:subledgers,code,{$subledger->id}",
            'name' => 'required|string|max:255',
            'short_name' => 'nullable|string|max:100',

            'subledger_type' => 'nullable|string|max:150',
            'subledger_sub_type' => 'nullable|string|max:150',

            'gl_account_id' => 'required|exists:ledger_accounts,id',
            'is_active' => 'boolean',
        ]);

        $subledger->update($validated);

        return redirect()
            ->route('subledgers.index')
            ->with('success', "{$subledger->name} updated successfully.");
    }

    /*
    |--------------------------------------------------------------------------
    | Delete
    |--------------------------------------------------------------------------
    */
    public function destroy(Subledger $subledger)
    {
        // 🔒 Prevent delete if accounts exist (important)
        if ($subledger->accounts()->exists()) {
            return back()->with('error', 'Cannot delete subledger with accounts.');
        }

        $subledger->delete();

        return back()->with('success', "{$subledger->name} deleted successfully.");
    }
}