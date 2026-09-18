<?php

namespace App\TreasuryAndCash\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class CashTransactionController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:cash_transactions.create');
    }

    public function deposit(): RedirectResponse
    {
        return redirect()->route('financial-transactions.create', ['type' => 'DEPOSIT']);
    }

    public function withdrawal(): RedirectResponse
    {
        return redirect()->route('financial-transactions.create', ['type' => 'WITHDRAWAL']);
    }
}
