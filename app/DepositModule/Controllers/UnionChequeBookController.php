<?php

namespace App\DepositModule\Controllers;

use App\DepositModule\Models\UnionChequeBook;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UnionChequeBookController extends Controller
{
    public function index()
    {
        $books = UnionChequeBook::with('depositAccount', 'issuedBy')
            ->latest()
            ->paginate(15);

        return response()->json($books);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'deposit_account_id' => 'required|exists:deposit_accounts,id',
            'book_no' => 'required|string|max:50',
            'start_number' => 'required|integer',
            'end_number' => 'required|integer|gte:start_number',
            'issued_at' => 'nullable|date',
        ]);

        return DB::transaction(function () use ($validated, $request) {

            $book = UnionChequeBook::create([
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

            return response()->json([
                'message' => 'Cheque book created successfully',
                'data' => $book->load('cheques'),
            ]);
        });
    }

    public function show(UnionChequeBook $unionChequeBook)
    {
        return response()->json(
            $unionChequeBook->load('cheques')
        );
    }

    public function update(Request $request, UnionChequeBook $unionChequeBook)
    {
        $validated = $request->validate([
            'book_no' => 'sometimes|string|max:50',
            'issued_at' => 'nullable|date',
        ]);

        $unionChequeBook->update($validated);

        return response()->json([
            'message' => 'Cheque book updated successfully',
            'data' => $unionChequeBook,
        ]);
    }

    public function destroy(UnionChequeBook $unionChequeBook)
    {
        $unionChequeBook->delete();

        return response()->json([
            'message' => 'Cheque book deleted successfully',
        ]);
    }
}