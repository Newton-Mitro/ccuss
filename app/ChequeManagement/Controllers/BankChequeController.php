<?php

namespace App\ChequeManagement\Controllers;

use App\ChequeManagement\Models\BankCheque;
use App\ChequeManagement\Models\BankChequeBook;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
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
            ->when($status && $status !== '', function ($query) use ($status) {
                $query->where('status', $status);
            })
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

    /**
     * ✅ Create Page
     */
    public function create()
    {
        return Inertia::render(
            'cheque-module/bank-cheques/create-bank-cheque-page',
            [
                'chequeBooks' => BankChequeBook::select('id', 'book_no')->get(),
            ]
        );
    }

    /**
     * ❗ Optional (if you allow manual creation)
     */
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
            'status' => 'issued',
        ]);

        return redirect()
            ->route('bank-cheques.index')
            ->with('success', 'Cheque created successfully');
    }

    /**
     * ✅ Show Page
     */
    public function show(BankCheque $bankCheque)
    {
        return Inertia::render(
            'cheque-module/bank-cheques/show-bank-cheque-page',
            [
                'cheque' => $bankCheque->load('chequeBook'),
            ]
        );
    }

    /**
     * ✅ Edit Page
     */
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

    /**
     * ✅ Update
     */
    public function update(Request $request, BankCheque $bankCheque)
    {
        $validated = $request->validate([
            'cheque_date' => 'nullable|date',
            'amount' => 'nullable|numeric|min:0',
            'payee_name' => 'nullable|string|max:255',
            'remarks' => 'nullable|string',
            'status' => 'required|in:issued,presented,cleared,bounced,cancelled',
            'stop_payment' => 'boolean',
        ]);

        $bankCheque->update($validated);

        return redirect()
            ->route('bank-cheques.index')
            ->with('success', 'Cheque updated successfully');
    }

    /**
     * ✅ Destroy
     */
    public function destroy(BankCheque $bankCheque)
    {
        $bankCheque->delete();

        return redirect()
            ->back()
            ->with('success', 'Cheque deleted successfully');
    }

    /*
    |--------------------------------------------------------------------------
    | 🚀 Business Actions (Lifecycle)
    |--------------------------------------------------------------------------
    */

    public function markPresented(BankCheque $bankCheque)
    {
        if ($bankCheque->stop_payment) {
            return back()->with('error', 'Cannot present a stopped cheque');
        }

        $bankCheque->update(['status' => 'presented']);

        return back()->with('success', 'Cheque marked as presented');
    }

    public function markCleared(BankCheque $bankCheque)
    {
        if ($bankCheque->stop_payment) {
            return back()->with('error', 'Stopped cheque cannot be cleared');
        }

        // ⚠️ Future: integrate accounting (journal entry)
        $bankCheque->update(['status' => 'cleared']);

        return back()->with('success', 'Cheque cleared successfully');
    }

    public function markBounced(BankCheque $bankCheque)
    {
        $bankCheque->update(['status' => 'bounced']);

        return back()->with('success', 'Cheque marked as bounced');
    }

    public function stopPayment(BankCheque $bankCheque)
    {
        $bankCheque->update(['stop_payment' => true]);

        return back()->with('success', 'Stop payment applied');
    }
}