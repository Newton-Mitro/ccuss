<?php

namespace App\DepositModule\Controllers;

use App\Http\Controllers\Controller;
use App\Models\UnionCheque;
use Illuminate\Http\Request;

class UnionChequeController extends Controller
{
    public function index()
    {
        $cheques = UnionCheque::with('chequeBook')
            ->latest()
            ->paginate(20);

        return response()->json($cheques);
    }

    public function show(UnionCheque $unionCheque)
    {
        return response()->json($unionCheque->load('chequeBook'));
    }

    public function update(Request $request, UnionCheque $unionCheque)
    {
        $validated = $request->validate([
            'cheque_date' => 'nullable|date',
            'amount' => 'nullable|numeric|min:0',
            'payee_name' => 'nullable|string|max:255',
            'remarks' => 'nullable|string',
            'status' => 'required|in:issued,presented,cleared,bounced,cancelled',
            'stop_payment' => 'boolean',
        ]);

        $unionCheque->update($validated);

        return response()->json([
            'message' => 'Cheque updated successfully',
            'data' => $unionCheque,
        ]);
    }

    public function destroy(UnionCheque $unionCheque)
    {
        $unionCheque->delete();

        return response()->json([
            'message' => 'Cheque deleted successfully',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Business Actions (Important 🚀)
    |--------------------------------------------------------------------------
    */

    public function markPresented(UnionCheque $unionCheque)
    {
        $unionCheque->update(['status' => 'presented']);

        return response()->json(['message' => 'Cheque marked as presented']);
    }

    public function markCleared(UnionCheque $unionCheque)
    {
        // ⚠️ Later: integrate journal entry here
        $unionCheque->update(['status' => 'cleared']);

        return response()->json(['message' => 'Cheque cleared successfully']);
    }

    public function markBounced(UnionCheque $unionCheque)
    {
        $unionCheque->update(['status' => 'bounced']);

        return response()->json(['message' => 'Cheque marked as bounced']);
    }

    public function stopPayment(UnionCheque $unionCheque)
    {
        $unionCheque->update(['stop_payment' => true]);

        return response()->json(['message' => 'Stop payment applied']);
    }
}