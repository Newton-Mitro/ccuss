<?php

namespace App\BranchTreasuryModule\Controllers;

use App\BranchTreasuryModule\Models\CashTransaction;
use App\Http\Controllers\Controller;
use Illuminate\Http\Client\Request;

class CashTransactionController extends Controller
{
    public function storeCashIn(Request $request)
    {
        CashTransaction::create([
            'cash_drawer_id' => $request->cash_drawer_id,
            'amount' => $request->amount,
            'type' => 'CASH_IN',
            'reference' => $request->reference,
            'transaction_date' => now()
        ]);

        return back()->with('success', 'Cash received');
    }

    public function storeCashOut(Request $request)
    {
        CashTransaction::create([
            'cash_drawer_id' => $request->cash_drawer_id,
            'amount' => $request->amount,
            'type' => 'CASH_OUT',
            'reference' => $request->reference,
            'transaction_date' => now()
        ]);

        return back()->with('success', 'Cash paid');
    }
}