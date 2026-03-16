<?php

namespace App\BranchTreasuryModule\Controllers;

use App\BranchTreasuryModule\Models\BranchDay;
use App\BranchTreasuryModule\Models\Teller;
use App\BranchTreasuryModule\Models\TellerSession;
use App\Http\Controllers\Controller;
use Illuminate\Http\Client\Request;

class TellerSessionController extends Controller
{
    public function openSession(Request $request)
    {
        $request->validate([
            'opening_cash' => 'required|numeric|min:0'
        ]);

        $branchDay = BranchDay::where('branch_id', auth()->user()->branch_id)
            ->where('status', 'OPEN')
            ->firstOrFail();

        $teller = Teller::where('user_id', auth()->id())->firstOrFail();

        $session = TellerSession::create([
            'teller_id' => $teller->id,
            'branch_day_id' => $branchDay->id,
            'opening_cash' => $request->opening_cash,
            'opened_at' => now()
        ]);

        return back()->with('success', 'Session opened');
    }

    public function closeSession(Request $request, $id)
    {
        $session = TellerSession::findOrFail($id);

        $request->validate([
            'closing_cash' => 'required|numeric'
        ]);

        $session->update([
            'closing_cash' => $request->closing_cash,
            'closed_at' => now(),
            'status' => 'CLOSED'
        ]);

        return back()->with('success', 'Session closed');
    }
}