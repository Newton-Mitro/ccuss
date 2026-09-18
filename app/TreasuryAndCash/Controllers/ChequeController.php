<?php

namespace App\TreasuryAndCash\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ChequeController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:cheques.view')->only(['index']);
    }

    public function index()
    {
        return Inertia::render('treasury-and-cash/cheque-management/cheque-books/index', [
            'title' => 'Cheque Books',
        ]);
    }
}
