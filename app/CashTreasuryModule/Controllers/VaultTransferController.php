<?php

namespace App\CashTreasuryModule\Controllers;

use App\CashTreasuryModule\Models\TellerVaultTransfer;
use App\Http\Controllers\Controller;
use Illuminate\Http\Client\Request;

class VaultTransferController extends Controller
{
    public function vaultToTeller(Request $request)
    {
        $request->validate([
            'vault_id' => 'required',
            'teller_session_id' => 'required',
            'amount' => 'required|numeric|min:1'
        ]);

        TellerVaultTransfer::create([
            'vault_id' => $request->vault_id,
            'teller_session_id' => $request->teller_session_id,
            'amount' => $request->amount,
            'type' => 'CASH_TO_TELLER',
            'transfer_date' => now()
        ]);

        return back()->with('success', 'Cash transferred to teller');
    }

    public function tellerToVault(Request $request)
    {
        TellerVaultTransfer::create([
            'vault_id' => $request->vault_id,
            'teller_session_id' => $request->teller_session_id,
            'amount' => $request->amount,
            'type' => 'CASH_TO_VAULT',
            'transfer_date' => now()
        ]);
    }
}