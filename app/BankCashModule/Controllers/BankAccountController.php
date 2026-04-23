<?php

namespace App\BankCashModule\Controllers;

use App\BankCashModule\Models\BankAccount;
use App\Http\Controllers\Controller;
use App\SubledgerModule\Models\SubledgerAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BankAccountController extends Controller
{
    public function index(Request $request)
    {
        $query = BankAccount::query()
            ->with(['subledgerAccount']);

        // 🔍 Search
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('bank_name', 'like', "%{$search}%")
                    ->orWhere('branch_name', 'like', "%{$search}%")
                    ->orWhere('account_number', 'like', "%{$search}%")
                    ->orWhereHas('subledgerAccount', function ($aq) use ($search) {
                        $aq->where('account_number', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%");
                    });
            });
        }

        // ✅ Status Filter (NEW)
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $paginatedData = $query->latest()
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        return Inertia::render('bank-cash/bank-accounts/list-bank-accounts-page', [
            'paginatedData' => $paginatedData,
            'filters' => $request->only(['search', 'status', 'per_page', 'page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('bank-cash/bank-accounts/bank-account-form-page');
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        $data = $request->validate([
            // account layer
            'name' => 'nullable|string|max:255',
            'account_number' => 'required|string|max:255|unique:subledger_accounts,account_number',

            'organization_id' => 'nullable|exists:organizations,id',
            'branch_id' => 'nullable|exists:branches,id',

            // bank layer
            'bank_name' => 'required|string|max:255',
            'branch_name' => 'nullable|string|max:255',
            'swift_code' => 'nullable|string|max:50',
            'routing_number' => 'nullable|string|max:50',
            'status' => 'nullable|in:active,inactive',
        ]);

        $bankAccount = DB::transaction(function () use ($data, $user) {

            /* ---------------------------------------------
            | 1. Create Bank Account
            --------------------------------------------- */
            $bankAccount = BankAccount::create([
                'bank_name' => $data['bank_name'],
                'branch_name' => $data['branch_name'] ?? null,
                'account_number' => $data['account_number'],
                'swift_code' => $data['swift_code'] ?? null,
                'routing_number' => $data['routing_number'] ?? null,
                'status' => $data['status'] ?? 'active',
            ]);

            /* ---------------------------------------------
            | 2. Create Subledger Account
            --------------------------------------------- */
            $subledgerAccount = SubledgerAccount::create([
                'organization_id' => $user->organization_id ?? null,
                'branch_id' => $user->branch_id ?? null,
                'account_number' => $data['account_number'],
                'name' => $data['name'] ?? $data['bank_name'],
                'type' => 'bank',
                'status' => 'active',
                'accountable_type' => BankAccount::class,
                'accountable_id' => $bankAccount->id,
            ]);

            /* ---------------------------------------------
            | 3. Link Back (bi-directional consistency)
            --------------------------------------------- */
            $bankAccount->update([
                'subledger_account_id' => $subledgerAccount->id,
            ]);

            return $bankAccount;
        });

        return redirect()
            ->route('bank-accounts.index')
            ->with('success', "{$bankAccount->bank_name} bank account created successfully!");
    }

    public function show(BankAccount $bankAccount)
    {
        $bankAccount->load('subledgerAccount');

        return Inertia::render('bank-cash/bank-accounts/show-bank-account-page', [
            'bankAccount' => $bankAccount,
        ]);
    }

    public function edit(BankAccount $bankAccount)
    {
        $bankAccount->load('subledgerAccount');

        return Inertia::render('bank-cash/bank-accounts/bank-account-form-page', [
            'bankAccount' => $bankAccount,
        ]);
    }

    public function update(Request $request, BankAccount $bankAccount)
    {
        $data = $request->validate([
            'name' => 'nullable|string|max:255',
            'bank_name' => 'required|string|max:255',
            'branch_name' => 'nullable|string|max:255',
            'account_number' => "required|string|max:255|unique:bank_accounts,account_number,{$bankAccount->id},id,deleted_at,NULL",
            'swift_code' => 'nullable|string|max:50',
            'routing_number' => 'nullable|string|max:50',
            'status' => 'required|in:active,inactive', // ✅ NEW
        ]);

        DB::transaction(function () use ($data, $bankAccount) {

            $bankAccount->update([
                'bank_name' => $data['bank_name'],
                'branch_name' => $data['branch_name'] ?? null,
                'account_number' => $data['account_number'],
                'swift_code' => $data['swift_code'] ?? null,
                'routing_number' => $data['routing_number'] ?? null,
                'status' => $data['status'], // ✅ NEW
            ]);

            $bankAccount->account?->update([
                'name' => $data['name'] ?? $data['bank_name'],
                'account_number' => $data['account_number'],
            ]);
        });

        return redirect()
            ->route('bank-accounts.index')
            ->with('success', $bankAccount->bank_name . ' Bank account updated successfully!');
    }

    public function destroy(BankAccount $bankAccount)
    {
        DB::transaction(function () use ($bankAccount) {
            $bankAccount->subledgerAccount?->delete();
            $bankAccount->delete();
        });

        return redirect()
            ->route('bank-accounts.index')
            ->with('success', $bankAccount->bank_name . ' Bank account deleted successfully!');
    }
}