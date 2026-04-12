<?php

namespace App\ChequeManagement\Controllers;

use App\ChequeManagement\Models\BankCheque;
use App\ChequeManagement\Models\BankChequeBook;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BankChequeController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $perPage = $request->input('per_page', 10);

        $cheques = BankCheque::query()
            ->with(['chequeBook'])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('cheque_number', 'like', "%{$search}%")
                        ->orWhere('payee_name', 'like', "%{$search}%")
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
            'cheque-module/bank-cheques/list-bank-cheques-page',
            [
                'paginated_data' => $cheques,
                'filters' => $request->only(['search', 'status', 'per_page', 'page']),
            ]
        );
    }

    public function create()
    {
        return Inertia::render(
            'cheque-module/bank-cheques/create-bank-cheque-page',
            [
                'chequeBooks' => BankChequeBook::select('id', 'book_no')->get(),
            ]
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'bank_cheque_book_id' => 'required|exists:bank_cheque_books,id',
            'cheque_number' => 'required|string',
            'cheque_date' => 'nullable|date',
            'amount' => 'nullable|numeric|min:0',
            'payee_name' => 'nullable|string|max:255',
            'remarks' => 'nullable|string',
        ]);

        BankCheque::create([
            ...$validated,
            'status' => BankCheque::STATUS_ISSUED,
        ]);

        return redirect()
            ->route('bank-cheques.index')
            ->with('success', 'Cheque created successfully');
    }

    public function show(BankCheque $bankCheque)
    {
        return Inertia::render(
            'cheque-module/bank-cheques/show-bank-cheque-page',
            [
                'cheque' => $bankCheque->load('chequeBook'),
            ]
        );
    }

    public function edit(BankCheque $bankCheque)
    {
        return Inertia::render(
            'cheque-module/bank-cheques/edit-bank-cheque-page',
            [
                'cheque' => $bankCheque,
                'chequeBooks' => BankChequeBook::select('id', 'book_no')->get(),
            ]
        );
    }

    public function update(Request $request, BankCheque $bankCheque)
    {
        $validated = $request->validate([
            'cheque_date' => 'nullable|date',
            'amount' => 'nullable|numeric|min:0',
            'payee_name' => 'nullable|string|max:255',
            'remarks' => 'nullable|string',
            'stop_payment' => 'boolean',
        ]);

        $bankCheque->update($validated);

        return redirect()
            ->route('bank-cheques.index')
            ->with('success', 'Cheque updated successfully');
    }

    public function destroy(BankCheque $bankCheque)
    {
        $bankCheque->delete();

        return back()->with('success', 'Cheque deleted successfully');
    }

    /*
    |--------------------------------------------------------------------------
    | 🚀 Lifecycle Actions (SAFE STATE MACHINE STYLE)
    |--------------------------------------------------------------------------
    */

    public function markPresented(BankCheque $bankCheque)
    {
        if ($bankCheque->stop_payment) {
            return back()->with('error', 'Stop payment active');
        }

        if ($bankCheque->status !== BankCheque::STATUS_ISSUED) {
            return back()->with('error', 'Only issued cheques can be presented');
        }

        $bankCheque->update([
            'status' => BankCheque::STATUS_PRESENTED,
        ]);

        return back()->with('success', 'Cheque presented');
    }

    public function markCleared(BankCheque $bankCheque)
    {
        if ($bankCheque->stop_payment) {
            return back()->with('error', 'Stopped cheque cannot be cleared');
        }

        if ($bankCheque->status !== BankCheque::STATUS_PRESENTED) {
            return back()->with('error', 'Only presented cheques can be cleared');
        }

        DB::transaction(function () use ($bankCheque) {
            $bankCheque->update([
                'status' => BankCheque::STATUS_CLEARED,
                'cleared_at' => now(),
            ]);

            // 🔥 Future hook: ledger posting
        });

        return back()->with('success', 'Cheque cleared');
    }

    public function markBounced(BankCheque $bankCheque)
    {
        if ($bankCheque->status === BankCheque::STATUS_CLEARED) {
            return back()->with('error', 'Cleared cheque cannot be bounced');
        }

        $bankCheque->update([
            'status' => BankCheque::STATUS_BOUNCED,
            'bounced_at' => now(),
        ]);

        return back()->with('success', 'Cheque bounced');
    }

    public function stopPayment(BankCheque $bankCheque)
    {
        if ($bankCheque->status === BankCheque::STATUS_CLEARED) {
            return back()->with('error', 'Cannot stop a cleared cheque');
        }

        $bankCheque->update([
            'stop_payment' => true,
        ]);

        return back()->with('success', 'Stop payment applied');
    }
}