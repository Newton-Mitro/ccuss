<?php

namespace App\ChequeManagement\Controllers;

use App\ChequeManagement\Models\Cheque;
use App\ChequeManagement\Models\ChequeBook;
use App\Http\Controllers\Controller;
use App\SubledgerModule\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ChequeController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | 📄 LIST
    |--------------------------------------------------------------------------
    */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $perPage = $request->input('per_page', 10);

        $cheques = Cheque::query()
            ->with(['chequeBook', 'issuerAccount'])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('cheque_number', 'like', "%{$search}%")
                        ->orWhere('payee_name', 'like', "%{$search}%")
                        ->orWhere('issuer_bank_name', 'like', "%{$search}%")
                        ->orWhereHas('chequeBook', function ($cq) use ($search) {
                            $cq->where('book_no', 'like', "%{$search}%");
                        });
                });
            })
            ->when($status, fn($q) => $q->where('status', $status))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render(
            'cheque-module/cheques/list-cheques-page',
            [
                'paginated_data' => $cheques,
                'filters' => $request->only(['search', 'status', 'per_page', 'page']),
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ➕ CREATE
    |--------------------------------------------------------------------------
    */
    public function create()
    {
        return Inertia::render(
            'cheque-module/cheques/create-cheque-page',
            [
                'cheque_books' => ChequeBook::select('id', 'book_no')->get(),
                'accounts' => Account::select('id', 'name')->get(),
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | 💾 STORE
    |--------------------------------------------------------------------------
    */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'cheque_book_id' => 'nullable|exists:cheque_books,id',
            'issuer_account_id' => 'nullable|exists:accounts,id',

            'issuer_bank_name' => 'nullable|string|max:255',
            'issuer_branch' => 'nullable|string|max:255',

            'cheque_number' => 'required|string|max:100',
            'cheque_date' => 'nullable|date',

            'amount' => 'required|numeric|min:0',

            'payee_name' => 'nullable|string|max:255',
            'remarks' => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated) {
            Cheque::create([
                ...$validated,
                'status' => Cheque::STATUS_ISSUED,
                'stop_payment' => false,
            ]);
        });

        return redirect()
            ->route('cheques.index')
            ->with('success', 'Cheque created successfully');
    }

    /*
    |--------------------------------------------------------------------------
    | 👁 SHOW
    |--------------------------------------------------------------------------
    */
    public function show(Cheque $cheque)
    {
        return Inertia::render(
            'cheque-module/cheques/show-cheque-page',
            [
                'cheque' => $cheque->load(['chequeBook', 'issuerAccount']),
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ✏️ EDIT
    |--------------------------------------------------------------------------
    */
    public function edit(Cheque $cheque)
    {
        return Inertia::render(
            'cheque-module/cheques/edit-cheque-page',
            [
                'cheque' => $cheque,
                'cheque_books' => ChequeBook::select('id', 'book_no')->get(),
                'accounts' => Account::select('id', 'name')->get(),
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | 🔄 UPDATE
    |--------------------------------------------------------------------------
    */
    public function update(Request $request, Cheque $cheque)
    {
        $validated = $request->validate([
            'cheque_book_id' => 'nullable|exists:cheque_books,id',
            'issuer_account_id' => 'nullable|exists:accounts,id',

            'issuer_bank_name' => 'nullable|string|max:255',
            'issuer_branch' => 'nullable|string|max:255',

            'cheque_date' => 'nullable|date',
            'amount' => 'required|numeric|min:0',

            'payee_name' => 'nullable|string|max:255',
            'remarks' => 'nullable|string',

            'stop_payment' => 'boolean',
        ]);

        $cheque->update($validated);

        return redirect()
            ->route('cheques.index')
            ->with('success', 'Cheque updated successfully');
    }

    /*
    |--------------------------------------------------------------------------
    | 🗑 DELETE
    |--------------------------------------------------------------------------
    */
    public function destroy(Cheque $cheque)
    {
        $cheque->delete();

        return back()->with('success', 'Cheque deleted successfully');
    }

    /*
    |--------------------------------------------------------------------------
    | 🚀 STATE MACHINE ACTIONS
    |--------------------------------------------------------------------------
    */

    public function markPresented(Cheque $cheque)
    {
        if ($cheque->stop_payment) {
            return back()->with('error', 'Stop payment is active');
        }

        if ($cheque->status !== Cheque::STATUS_ISSUED) {
            return back()->with('error', 'Only issued cheques can be presented');
        }

        $cheque->update([
            'status' => Cheque::STATUS_PRESENTED,
        ]);

        return back()->with('success', 'Cheque marked as presented');
    }

    public function markCleared(Cheque $cheque)
    {
        if ($cheque->stop_payment) {
            return back()->with('error', 'Stopped cheque cannot be cleared');
        }

        if ($cheque->status !== Cheque::STATUS_PRESENTED) {
            return back()->with('error', 'Only presented cheques can be cleared');
        }

        DB::transaction(function () use ($cheque) {
            $cheque->update([
                'status' => Cheque::STATUS_CLEARED,
                'cleared_at' => now(),
            ]);

            // 🔥 Future upgrade: ledger posting (debit/credit)
        });

        return back()->with('success', 'Cheque cleared successfully');
    }

    public function markBounced(Cheque $cheque)
    {
        if ($cheque->status === Cheque::STATUS_CLEARED) {
            return back()->with('error', 'Cleared cheque cannot be bounced');
        }

        $cheque->update([
            'status' => Cheque::STATUS_BOUNCED,
            'bounced_at' => now(),
        ]);

        return back()->with('success', 'Cheque marked as bounced');
    }

    public function stopPayment(Cheque $cheque)
    {
        if ($cheque->status === Cheque::STATUS_CLEARED) {
            return back()->with('error', 'Cannot stop payment on cleared cheque');
        }

        $cheque->update([
            'stop_payment' => true,
        ]);

        return back()->with('success', 'Stop payment applied successfully');
    }
}