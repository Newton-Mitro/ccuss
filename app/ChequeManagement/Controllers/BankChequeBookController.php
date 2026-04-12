<?php

namespace App\ChequeManagement\Controllers;

use App\ChequeManagement\Models\BankChequeBook;
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

    public function create()
    {
        return Inertia::render(
            'cheque-module/bank-cheque-books/create-bank-cheque-book-page',
            [
                'accounts' => []
            ]
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'book_no' => 'required|string|max:50|unique:bank_cheque_books,book_no',
            'start_number' => 'required|integer|min:1',
            'end_number' => 'required|integer|gte:start_number',
            'issued_at' => 'nullable|date',
        ]);

        DB::transaction(function () use ($validated) {

            $book = BankChequeBook::create([
                ...$validated,
                'issued_by' => auth()->id(),
            ]);

            $cheques = [];

            for ($i = $book->start_number; $i <= $book->end_number; $i++) {
                $cheques[] = [
                    'bank_cheque_book_id' => $book->id,
                    'cheque_number' => (string) $i,
                    'amount' => 0,
                    'status' => 'issued',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            // 🔥 Bulk insert (FAST + SCALABLE)
            $book->cheques()->insert($cheques);
        });

        return redirect()
            ->route('bank-cheque-books.index')
            ->with('success', 'Cheque book created successfully');
    }

    public function show(BankChequeBook $bankChequeBook)
    {
        return Inertia::render(
            'cheque-module/bank-cheque-books/show-bank-cheque-book-page',
            [
                'book' => $bankChequeBook->load(['issuedBy', 'cheques']),
            ]
        );
    }

    public function edit(BankChequeBook $bankChequeBook)
    {
        return Inertia::render(
            'cheque-module/bank-cheque-books/edit-bank-cheque-book-page',
            [
                'chequeBook' => $bankChequeBook,
            ]
        );
    }

    public function update(Request $request, BankChequeBook $bankChequeBook)
    {
        $validated = $request->validate([
            'issued_at' => 'nullable|date',
        ]);

        $bankChequeBook->update($validated);

        return redirect()
            ->route('bank-cheque-books.index')
            ->with('success', 'Cheque book updated successfully');
    }

    public function destroy(BankChequeBook $bankChequeBook)
    {
        $bankChequeBook->delete();

        return redirect()
            ->back()
            ->with('success', 'Cheque book deleted successfully');
    }
}