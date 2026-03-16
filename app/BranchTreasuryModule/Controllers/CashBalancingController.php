<?php

namespace App\BranchTreasuryModule\Controllers;

use App\BranchTreasuryModule\Models\CashBalancing;
use App\BranchTreasuryModule\Models\CashTransaction;
use App\Http\Controllers\Controller;
use Illuminate\Http\Client\Request;

class CashBalancingController extends Controller
{
    public function balance(Request $request)
    {
        $expected = CashTransaction::where('cash_drawer_id', $request->cash_drawer_id)
            ->sum('amount');

        $difference = $request->actual_balance - $expected;

        CashBalancing::create([
            'cash_drawer_id' => $request->cash_drawer_id,
            'expected_balance' => $expected,
            'actual_balance' => $request->actual_balance,
            'difference' => $difference,
            'balanced_at' => now()
        ]);

        return back()->with('success', 'Cash balanced');
    }
}