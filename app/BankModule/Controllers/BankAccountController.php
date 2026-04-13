<?php

namespace App\BankModule\Controllers;

use App\BankModule\Models\BankAccount;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class BankAccountController extends Controller
{
    public function index(Request $request)
    {
        $query = BankAccount::query();

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('bank_name', 'like', "%{$search}%")
                    ->orWhere('account_number', 'like', "%{$search}%")
                    ->orWhere('branch_name', 'like', "%{$search}%");
            });
        }

        $accounts = $query->latest()
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        return Inertia::render('bank-and-cheque/bank-accounts/list-bank-accounts-page', [
            'accounts' => $accounts,
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('bank-and-cheque/bank-accounts/bank-account-form-page');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'bank_name' => 'required|string|max:255',
            'branch_name' => 'nullable|string|max:255',
            'account_number' => 'required|string|unique:bank_accounts,account_number',
            'iban' => 'nullable|string|max:50',
            'swift_code' => 'nullable|string|max:50',
            'routing_number' => 'nullable|string|max:50',
        ]);

        BankAccount::create($data);

        return redirect()
            ->route('bank-accounts.index')
            ->with('success', 'Bank account created successfully!');
    }

    public function show(BankAccount $bankAccount)
    {
        return Inertia::render('bank-and-cheque/bank-accounts/show-bank-account-page', [
            'account' => $bankAccount,
        ]);
    }

    public function edit(BankAccount $bankAccount)
    {
        return Inertia::render('bank-and-cheque/bank-accounts/bank-account-form-page', [
            'account' => $bankAccount,
        ]);
    }

    public function update(Request $request, BankAccount $bankAccount)
    {
        $data = $request->validate([
            'bank_name' => 'required|string|max:255',
            'branch_name' => 'nullable|string|max:255',
            'account_number' => "required|string|unique:bank_accounts,account_number,{$bankAccount->id}",
            'iban' => 'nullable|string|max:50',
            'swift_code' => 'nullable|string|max:50',
            'routing_number' => 'nullable|string|max:50',
        ]);

        $bankAccount->update($data);

        return redirect()
            ->route('bank-accounts.index')
            ->with('success', 'Bank account updated successfully!');
    }

    public function destroy(BankAccount $bankAccount)
    {
        $bankAccount->delete();

        return redirect()
            ->route('bank-accounts.index')
            ->with('success', 'Bank account deleted successfully!');
    }
}