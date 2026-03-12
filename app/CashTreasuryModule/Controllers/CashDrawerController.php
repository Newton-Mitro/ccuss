<?php

namespace App\CashTreasuryModule\Controllers;

use App\CashTreasuryModule\Models\CashDrawer;
use App\Http\Controllers\Controller;
use Illuminate\Http\Client\Request;


class CashDrawerController extends Controller
{
    public function assignDrawer(Request $request)
    {
        $request->validate([
            'teller_session_id' => 'required',
            'vault_id' => 'required',
            'opening_balance' => 'required|numeric'
        ]);

        CashDrawer::create([
            'teller_session_id' => $request->teller_session_id,
            'vault_id' => $request->vault_id,
            'opening_balance' => $request->opening_balance
        ]);

        return back()->with('success', 'Cash drawer assigned');
    }
}