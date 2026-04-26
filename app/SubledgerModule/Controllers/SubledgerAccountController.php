<?php

namespace App\SubledgerModule\Controllers;

use App\Http\Controllers\Controller;
use App\SubledgerModule\Models\Subledger;
use App\SubledgerModule\Models\SubledgerAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SubledgerAccountController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | List
    |--------------------------------------------------------------------------
    */
    public function index(Request $request): Response
    {
        $query = SubledgerAccount::query()
            ->with([
                'subledger:id,name,subledger_type,subledger_sub_type',
                'accountable',
                'branch:id,name',
                'organization:id,name',
            ]);

        // 🔍 Search
        if ($search = trim($request->input('search'))) {
            $query->where(function ($q) use ($search) {
                $q->where('account_number', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            });
        }

        // 🎯 Status filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // 🏢 Branch filter
        if ($branchId = $request->input('branch_id')) {
            $query->where('branch_id', $branchId);
        }

        // 📊 Subledger filter (NEW)
        if ($subledgerId = $request->input('subledger_id')) {
            $query->where('subledger_id', $subledgerId);
        }

        $accounts = $query
            ->latest()
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        return Inertia::render(
            'subledger-module/subledger-accounts/list-subledger-accounts-page',
            [
                'accounts' => $accounts,
                'filters' => $request->only([
                    'search',
                    'status',
                    'branch_id',
                    'subledger_id',
                    'per_page',
                    'page',
                ]),
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Create
    |--------------------------------------------------------------------------
    */
    public function create(): Response
    {
        return Inertia::render('subledger-module/subledger-accounts/create', [
            'subledgers' => Subledger::active()
                ->select('id', 'name', 'subledger_type', 'subledger_sub_type')
                ->get(),

            'statuses' => [
                SubledgerAccount::STATUS_PENDING,
                SubledgerAccount::STATUS_ACTIVE,
                SubledgerAccount::STATUS_DORMANT,
                SubledgerAccount::STATUS_FROZEN,
                SubledgerAccount::STATUS_CLOSED,
            ],
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
            'account_number' => [
                'required',
                'string',
                'max:50',
                'unique:subledger_accounts,account_number',
            ],
            'name' => ['nullable', 'string', 'max:255'],
            'status' => [
                'required',
                'in:' . implode(',', [
                    SubledgerAccount::STATUS_PENDING,
                    SubledgerAccount::STATUS_ACTIVE,
                    SubledgerAccount::STATUS_DORMANT,
                    SubledgerAccount::STATUS_FROZEN,
                    SubledgerAccount::STATUS_CLOSED,
                ])
            ],

            'accountable_type' => ['required', 'string'],
            'accountable_id' => ['required', 'integer'],

            'subledger_id' => ['required', 'exists:subledgers,id'],
            'organization_id' => ['nullable', 'exists:organizations,id'],
            'branch_id' => ['nullable', 'exists:branches,id'],
        ]);

        $account = DB::transaction(function () use ($validated) {
            return SubledgerAccount::create($validated);
        });

        return redirect()
            ->route('subledger-accounts.index')
            ->with('success', "{$account->account_number} created successfully.");
    }

    /*
    |--------------------------------------------------------------------------
    | Show
    |--------------------------------------------------------------------------
    */
    public function show(SubledgerAccount $subledgerAccount): Response
    {
        $subledgerAccount->load([
            'subledger',
            'accountable',
            'branch',
            'organization',
            'holders',
            'nominees',
        ]);

        return Inertia::render(
            'subledger-module/subledger-accounts/show-subledger-account-page',
            [
                'account' => $subledgerAccount,
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Edit
    |--------------------------------------------------------------------------
    */
    public function edit(SubledgerAccount $subledgerAccount): Response
    {
        return Inertia::render(
            'subledger-module/subledger-accounts/edit-subledger-account-page',
            [
                'account' => $subledgerAccount,
                'subledgers' => Subledger::active()
                    ->select('id', 'name', 'subledger_type')
                    ->get(),

                'statuses' => [
                    SubledgerAccount::STATUS_PENDING,
                    SubledgerAccount::STATUS_ACTIVE,
                    SubledgerAccount::STATUS_DORMANT,
                    SubledgerAccount::STATUS_FROZEN,
                    SubledgerAccount::STATUS_CLOSED,
                ],
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Update
    |--------------------------------------------------------------------------
    */
    public function update(Request $request, SubledgerAccount $subledgerAccount)
    {
        // 🔒 Prevent modifying closed accounts (important)
        if ($subledgerAccount->isClosed()) {
            return back()->with('error', 'Closed account cannot be modified.');
        }

        $validated = $request->validate([
            'account_number' => [
                'required',
                'string',
                'max:50',
                "unique:subledger_accounts,account_number,{$subledgerAccount->id}",
            ],
            'name' => ['nullable', 'string', 'max:255'],
            'status' => [
                'required',
                'in:' . implode(',', [
                    SubledgerAccount::STATUS_PENDING,
                    SubledgerAccount::STATUS_ACTIVE,
                    SubledgerAccount::STATUS_DORMANT,
                    SubledgerAccount::STATUS_FROZEN,
                    SubledgerAccount::STATUS_CLOSED,
                ])
            ],

            'accountable_type' => ['required', 'string'],
            'accountable_id' => ['required', 'integer'],

            'subledger_id' => ['required', 'exists:subledgers,id'],
            'organization_id' => ['nullable', 'exists:organizations,id'],
            'branch_id' => ['nullable', 'exists:branches,id'],
        ]);

        DB::transaction(function () use ($subledgerAccount, $validated) {
            $subledgerAccount->update($validated);
        });

        return redirect()
            ->route('subledger-accounts.index')
            ->with('success', "{$subledgerAccount->account_number} updated successfully.");
    }

    /*
    |--------------------------------------------------------------------------
    | Delete
    |--------------------------------------------------------------------------
    */
    public function destroy(SubledgerAccount $subledgerAccount)
    {
        // 🔒 Prevent deleting active accounts
        if ($subledgerAccount->isActive()) {
            return back()->with('error', 'Active account cannot be deleted.');
        }

        $subledgerAccount->delete();

        return back()->with(
            'success',
            "{$subledgerAccount->account_number} deleted successfully."
        );
    }
}