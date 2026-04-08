<?php

namespace App\ChequeManagement\Controllers;

use App\ChequeManagement\Models\BankChequeBook;
use App\Models\DepositAccount;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BankChequeBookController extends Controller
{
    public function index(Request $request)
    {
        $search = trim($request->input('search'));
        $perPage = (int) $request->input('per_page', 10);

        $books = BankChequeBook::query()
            ->with(['issuedBy'])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {

                    $q->where('book_no', 'like', "%{$search}%")
                        ->orWhere('start_number', 'like', "%{$search}%")
                        ->orWhere('end_number', 'like', "%{$search}%")

                        // Search by issued user
                        ->orWhereHas('issuedBy', function ($userQuery) use ($search) {
                            $userQuery->where('name', 'like', "%{$search}%");
                        });

                });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render(
            'cheque-module/bank-cheque-books/list-bank-cheque-books-page',
            [
                'paginated_data' => $books,
                'filters' => $request->only(['search', 'per_page', 'page']),
            ]
        );
    }

    /**
     * ✅ Create Page (IMPORTANT for Inertia)
     */
    public function create()
    {
        return Inertia::render(
            'cheque-module/bank-cheque-books/create-bank-cheque-book-page',
            [
                'accounts' => [],
            ]
        );
    }

    /**
     * ✅ Store (Redirect instead of JSON)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'deposit_account_id' => 'nullable|exists:deposit_accounts,id',
            'bank_account_id' => 'nullable|exists:bank_accounts,id',
            'book_no' => 'required|string|max:50',
            'start_number' => 'required|integer',
            'end_number' => 'required|integer|gte:start_number',
            'issued_at' => 'nullable|date',
        ]);

        DB::transaction(function () use ($validated) {

            $book = BankChequeBook::create([
                ...$validated,
                'issued_by' => auth()->id(),
            ]);

            // 🔥 Auto-generate cheques
            for ($i = $book->start_number; $i <= $book->end_number; $i++) {
                $book->cheques()->create([
                    'cheque_number' => $i,
                    'amount' => 0,
                    'status' => 'issued',
                ]);
            }
        });

        return redirect()
            ->route('bank-cheque-books.index')
            ->with('success', 'Cheque book created successfully');
    }

    /**
     * ✅ Show Page (optional UI page)
     */
    public function show(BankChequeBook $bankChequeBook)
    {
        return Inertia::render(
            'cheque-module/bank-cheque-books/show-bank-cheque-book-page',
            [
                'book' => $bankChequeBook->load(['depositAccount', 'cheques']),
            ]
        );
    }

    /**
     * ✅ Edit Page
     */
    public function edit(BankChequeBook $bankChequeBook)
    {
        return Inertia::render(
            'cheque-module/bank-cheque-books/edit-bank-cheque-book-page',
            [
                'chequeBook' => $bankChequeBook,
                'accounts' => [],
            ]
        );
    }

    /**
     * ✅ Update (Redirect style)
     */
    public function update(Request $request, BankChequeBook $bankChequeBook)
    {
        $validated = $request->validate([
            'book_no' => 'sometimes|string|max:50',
            'issued_at' => 'nullable|date',
        ]);

        $bankChequeBook->update($validated);

        return redirect()
            ->route('bank-cheque-books.index')
            ->with('success', 'Cheque book updated successfully');
    }

    /**
     * ✅ Destroy (Redirect back)
     */
    public function destroy(BankChequeBook $bankChequeBook)
    {
        $bankChequeBook->delete();

        return redirect()
            ->back()
            ->with('success', 'Cheque book deleted successfully');
    }
}