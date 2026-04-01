<?php

namespace App\BankCashModule\Controllers;

use App\BankCashModule\Models\Bank;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BankController extends Controller
{
    public function index(Request $request)
    {
        $query = Bank::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('short_name', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $banks = $query->latest()
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        return Inertia::render('bank-and-cheque/banks/list-banks-page', [
            'banks' => $banks,
            'filters' => $request->only(['search', 'status', 'per_page', 'page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Bank/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'short_name' => 'nullable|string|max:50',
            'swift_code' => 'nullable|string|max:50',
            'routing_number' => 'nullable|string|max:50',
            'status' => 'required|in:active,inactive',
        ]);

        Bank::create($request->all());

        return redirect()->route('banks.index')->with('success', 'Bank created successfully!');
    }

    public function edit(Bank $bank)
    {
        return Inertia::render('Bank/Edit', [
            'bank' => $bank,
        ]);
    }

    public function update(Request $request, Bank $bank)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'short_name' => 'nullable|string|max:50',
            'swift_code' => 'nullable|string|max:50',
            'routing_number' => 'nullable|string|max:50',
            'status' => 'required|in:active,inactive',
        ]);

        $bank->update($request->all());

        return redirect()->route('banks.index')->with('success', 'Bank updated successfully!');
    }

    public function destroy(Bank $bank)
    {
        $bank->delete();
        return redirect()->route('banks.index')->with('success', 'Bank deleted successfully!');
    }
}