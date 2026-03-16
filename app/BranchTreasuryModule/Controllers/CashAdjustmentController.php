<?php

namespace App\BranchTreasuryModule\Controllers;

use App\BranchTreasuryModule\Models\CashAdjustment;
use App\Http\Controllers\Controller;
use Illuminate\Http\Client\Request;

class CashAdjustmentController extends Controller
{
    public function approveAdjustment(Request $request)
    {
        CashAdjustment::create([
            'cash_drawer_id' => $request->cash_drawer_id,
            'amount' => $request->amount,
            'type' => $request->type,
            'reason' => $request->reason,
            'approved_by' => auth()->id()
        ]);

        return back()->with('success', 'Adjustment approved');
    }
}