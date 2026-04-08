<?php

namespace App\BankAndChequeModule\Controllers;

use App\BankAndChequeModule\Models\Bank;
use App\BankAndChequeModule\Models\BankAccount;
use App\BankAndChequeModule\Models\BankBranch;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BankAccountController extends Controller
{
    public function index(Request $request)
    {
        $query = BankAccount::with(['bank', 'branch', 'creator', 'approver']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('account_name', 'like', "%{$search}%")
                ->orWhere('account_number', 'like', "%{$search}%")
                ->orWhereHas('bank', fn($q) => $q->where('name', 'like', "%{$search}%"))
                ->orWhereHas('branch', fn($q) => $q->where('name', 'like', "%{$search}%"));
        }

        if ($request->filled('bank_id')) {
            $query->where('bank_id', $request->bank_id);
        }

        if ($request->filled('bank_branch_id')) {
            $query->where('bank_branch_id', $request->bank_branch_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $accounts = $query->latest()
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        return Inertia::render('bank-and-cheque/bank-accounts/list-bank-accounts-page', [
            'accounts' => $accounts,
            'filters' => $request->only(['search', 'bank_id', 'bank_branch_id', 'status', 'per_page', 'page']),
            'banks' => Bank::select('id', 'name')->get(),
            'branches' => BankBranch::select('id', 'name')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('bank-and-cheque/bank-accounts/bank-account-form-page', [
            'banks' => Bank::select('id', 'name')->get(),
            'branches' => BankBranch::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'bank_id' => 'required|exists:banks,id',
            'bank_branch_id' => 'nullable|exists:bank_branches,id',
            'account_name' => 'required|string|max:255',
            'account_number' => 'required|string|unique:bank_accounts,account_number',
            'iban' => 'nullable|string|max:50',
            'balance' => 'nullable|numeric|min:0',
            'currency' => 'required|string|max:10',
            'status' => 'required|in:active,inactive,closed',
            'created_by' => 'nullable|exists:users,id',
            'approved_by' => 'nullable|exists:users,id',
        ]);

        BankAccount::create($request->all());

        return redirect()->route('bank-accounts.index')->with('success', 'Bank account created successfully!');
    }

    public function edit(BankAccount $bankAccount)
    {
        return Inertia::render('bank-and-cheque/bank-accounts/bank-account-form-page', [
            'account' => $bankAccount,
            'banks' => Bank::select('id', 'name')->get(),
            'branches' => BankBranch::select('id', 'name')->get(),
        ]);
    }

    public function show(BankAccount $bankAccount)
    {
        return Inertia::render('bank-and-cheque/bank-accounts/show-bank-account-page', [
            'account' => $bankAccount,
        ]);
    }

    public function update(Request $request, BankAccount $bankAccount)
    {
        $request->validate([
            'bank_id' => 'required|exists:banks,id',
            'bank_branch_id' => 'nullable|exists:bank_branches,id',
            'account_name' => 'required|string|max:255',
            'account_number' => "required|string|unique:bank_accounts,account_number,{$bankAccount->id}",
            'iban' => 'nullable|string|max:50',
            'balance' => 'nullable|numeric|min:0',
            'currency' => 'required|string|max:10',
            'status' => 'required|in:active,inactive,closed',
            'created_by' => 'nullable|exists:users,id',
            'approved_by' => 'nullable|exists:users,id',
        ]);

        $bankAccount->update($request->all());

        return redirect()->route('bank-accounts.index')->with('success', 'Bank account updated successfully!');
    }

    public function destroy(BankAccount $bankAccount)
    {
        $bankAccount->delete();
        return redirect()->route('bank-accounts.index')->with('success', 'Bank account deleted successfully!');
    }
}