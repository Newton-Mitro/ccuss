<?php

namespace App\TreasuryAndCash\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class PettyCashController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:petty_cash.view')->only(['index']);
    }

    public function index()
    {
        return Inertia::render('treasury-and-cash/petty-cash/index', [
            'title' => 'Petty Cash',
        ]);
    }
}
