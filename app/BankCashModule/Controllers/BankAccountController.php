<?php

namespace App\BankCashModule\Controllers;

use App\BankCashModule\Models\BankAccount;
use App\Http\Controllers\Controller;
use App\SubledgerModule\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BankAccountController extends Controller
{
    public function index(Request $request)
    {
        $query = BankAccount::query()
            ->with(['account']); // assumes relation exists

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('bank_name', 'like', "%{$search}%")
                    ->orWhere('branch_name', 'like', "%{$search}%")
                    ->orWhere('account_number', 'like', "%{$search}%")
                    ->orWhereHas('account', function ($aq) use ($search) {
                        $aq->where('account_number', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%");
                    });
            });
        }

        $accounts = $query->latest()
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        return Inertia::render('bank-cash/bank-accounts/list-bank-accounts-page', [
            'accounts' => $accounts,
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('bank-cash/bank-accounts/bank-account-form-page');
    }

    public function store(Request $request)
    {
        $organization = Auth::user()->organization;
        $branch = Auth::user()->branch;
        $data = $request->validate([
            // account layer
            'name' => 'nullable|string|max:255',
            'account_number' => 'required|string|unique:accounts,account_number',

            'organization_id' => 'nullable|exists:organizations,id',
            'branch_id' => 'nullable|exists:branches,id',

            // bank layer
            'bank_name' => 'required|string|max:255',
            'branch_name' => 'nullable|string|max:255',
            'swift_code' => 'nullable|string|max:50',
            'routing_number' => 'nullable|string|max:50',
        ]);

        DB::transaction(function () use ($data, $organization, $branch) {
            // 1. Create bank account first
            $bankAccount = BankAccount::create([
                'bank_name' => $data['bank_name'],
                'branch_name' => $data['branch_name'] ?? null,
                'account_number' => $data['account_number'],
                'swift_code' => $data['swift_code'] ?? null,
                'routing_number' => $data['routing_number'] ?? null,
            ]);
            // 2. Create central ledger/account
            $account = Account::create([
                'organization_id' => $organization->id ?? null,
                'branch_id' => $branch->id ?? null,
                'account_number' => $data['account_number'],
                'name' => $data['name'] ?? $data['bank_name'],
                'type' => 'bank',
                'status' => 'active',
                // polymorphic link
                'accountable_type' => BankAccount::class,
                'accountable_id' => $bankAccount->id,
            ]);
            // 3. Optional reverse link (ONLY if you need bidirectional access)
            $bankAccount->update([
                'account_id' => $account->id,
            ]);
        });
        return redirect()->route('bank-accounts.index')->with('success', 'Bank account created successfully!');
    }

    public function show(BankAccount $bankAccount)
    {
        $bankAccount->load('account');
        return Inertia::render('bank-cash/bank-accounts/show-bank-account-page', [
            'account' => $bankAccount,
        ]);
    }

    public function edit(BankAccount $bankAccount)
    {
        $bankAccount->load('account');
        return Inertia::render('bank-cash/bank-accounts/bank-account-form-page', [
            'account' => $bankAccount,
        ]);
    }

    public function update(Request $request, BankAccount $bankAccount)
    {
        $data = $request->validate([
            'name' => 'nullable|string|max:255',
            'bank_name' => 'required|string|max:255',
            'branch_name' => 'nullable|string|max:255',
            'account_number' => "required|string|unique:bank_accounts,account_number,{$bankAccount->id}",
            'swift_code' => 'nullable|string|max:50',
            'routing_number' => 'nullable|string|max:50',
        ]);

        DB::transaction(function () use ($data, $bankAccount) {
            $bankAccount->update([
                'bank_name' => $data['bank_name'],
                'branch_name' => $data['branch_name'] ?? null,
                'account_number' => $data['account_number'],
                'swift_code' => $data['swift_code'] ?? null,
                'routing_number' => $data['routing_number'] ?? null,
            ]);
            $bankAccount->account?->update([
                'name' => $data['name'] ?? $data['bank_name'],
                'account_number' => $data['account_number'],
            ]);
        });

        return redirect()->route('bank-accounts.index')->with('success', 'Bank account updated successfully!');
    }

    public function destroy(BankAccount $bankAccount)
    {
        DB::transaction(function () use ($bankAccount) {
            $bankAccount->account?->delete();
            $bankAccount->delete();
        });
        return redirect()->route('bank-accounts.index')->with('success', 'Bank account deleted successfully!');
    }
}