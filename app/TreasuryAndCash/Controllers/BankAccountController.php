<?php

namespace App\TreasuryAndCash\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class BankAccountController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:banking.view')->only(['index']);
    }

    public function index()
    {
        return Inertia::render('treasury-and-cash/banking/bank-accounts/index', [
            'title' => 'Bank Accounts',
        ]);
    }
}
