<?php

namespace App\TreasuryAndCash\Controllers;

use App\Http\Controllers\Controller;
use App\TreasuryAndCash\Application\ChequeDataService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChequeController extends Controller
{
    public function __construct(
        private readonly ChequeDataService $chequeDataService,
    ) {
        $this->middleware('permission:cheque_books.view')->only(['books']);
        $this->middleware('permission:cheques.view')->only(['cheques']);
    }

    public function books(Request $request): Response
    {
        $books = $this->chequeDataService->listBooks(
            $request->attributes->get('active_organization')->id,
            $request->input('search'),
            $request->input('per_page', 18),
        );

        return Inertia::render('treasury-cash/cheques/books/index', [
            'books' => $books,
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }

    public function cheques(Request $request): Response
    {
        $cheques = $this->chequeDataService->listCheques(
            $request->attributes->get('active_organization')->id,
            $request->input('search'),
            $request->input('per_page', 18),
        );

        return Inertia::render('treasury-cash/cheques/index', [
            'cheques' => $cheques,
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }
}
