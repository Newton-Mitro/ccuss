<?php

namespace App\ChequeManagement\Controllers;

use App\ChequeManagement\Models\ChequeBook;
use App\ChequeManagement\Models\Cheque;
use App\Http\Controllers\Controller;
use App\SubledgerModule\Models\SubledgerAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ChequeBookController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | 📄 LIST
    |--------------------------------------------------------------------------
    */
    public function index(Request $request)
    {
        $search = trim($request->input('search'));
        $perPage = (int) $request->input('per_page', 10);

        $books = ChequeBook::query()
            ->with(['cheques', 'subledgerAccount'])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('book_no', 'like', "%{$search}%")
                        ->orWhere('start_number', 'like', "%{$search}%")
                        ->orWhere('end_number', 'like', "%{$search}%")
                        ->orWhereHas('subledgerAccount', function ($aq) use ($search) {
                            $aq->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render(
            'cheque-module/cheque-books/list-cheque-books-page',
            [
                'paginated_data' => $books,
                'filters' => $request->only(['search', 'per_page', 'page']),
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
        $subledger_accounts = SubledgerAccount::query()
            ->where('status', 'active')
            ->whereHas('subledger', function ($q) {
                $q->where('subledger_sub_type', 'bank_accounts');
            })
            ->with('subledger:id,subledger_sub_type')
            ->select('id', 'name', 'subledger_id')
            ->get();
        return Inertia::render(
            'cheque-module/cheque-books/create-cheque-book-page',
            [
                'subledger_accounts' => $subledger_accounts,
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
            'book_no' => 'required|string|max:50|unique:cheque_books,book_no',
            'subledger_account_id' => 'required|exists:subledger_accounts,id',
            'start_number' => 'required|integer|min:1',
            'end_number' => 'required|integer|gte:start_number',
            'issued_at' => 'nullable|date',
        ]);

        $chequeBook = DB::transaction(function () use ($validated) {

            $book = ChequeBook::create($validated);

            $cheques = [];

            for ($i = $book->start_number; $i <= $book->end_number; $i++) {
                $cheques[] = [
                    'cheque_book_id' => $book->id,

                    // issuer info not set here (belongs to cheque usage stage)
                    'issuer_account_id' => $book->subledger_account_id,

                    'cheque_number' => (string) $i,
                    'cheque_date' => null,

                    'amount' => 0,
                    'payee_name' => null,
                    'remarks' => null,

                    'status' => 'issued',
                    'stop_payment' => false,

                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            // ⚡ Correct bulk insert
            Cheque::insert($cheques);

            return $book;
        });

        return redirect()
            ->route('cheque-books.index')
            ->with('success', 'Cheque book ' . $chequeBook->book_no . ' created successfully');
    }

    /*
    |--------------------------------------------------------------------------
    | 👁 SHOW
    |--------------------------------------------------------------------------
    */
    public function show(ChequeBook $chequeBook)
    {
        return Inertia::render(
            'cheque-module/cheque-books/show-cheque-book-page',
            [
                'cheque_book' => $chequeBook->load(['cheques', 'subledgerAccount']),
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ✏️ EDIT
    |--------------------------------------------------------------------------
    */
    public function edit(ChequeBook $chequeBook)
    {
        return Inertia::render(
            'cheque-module/cheque-books/edit-cheque-book-page',
            [
                'cheque_book' => $chequeBook->load('subledgerAccount'),
                'subledger_accounts' => SubledgerAccount::select('id', 'name')->get(),
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | 🔄 UPDATE
    |--------------------------------------------------------------------------
    */
    public function update(Request $request, ChequeBook $chequeBook)
    {
        $validated = $request->validate([
            'subledger_account_id' => 'required|exists:subledger_accounts,id',
            'issued_at' => 'nullable|date',
        ]);

        $chequeBook->update($validated);

        return redirect()
            ->route('cheque-books.index')
            ->with('success', 'Cheque book ' . $chequeBook->book_no . ' updated successfully');
    }

    /*
    |--------------------------------------------------------------------------
    | 🗑 DELETE
    |--------------------------------------------------------------------------
    */
    public function destroy(ChequeBook $chequeBook)
    {
        DB::transaction(function () use ($chequeBook) {
            $chequeBook->cheques()->delete(); // soft delete safe
            $chequeBook->delete();
        });

        return back()->with('success', 'Cheque book ' . $chequeBook->book_no . ' deleted successfully');
    }
}