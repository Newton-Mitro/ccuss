<?php

namespace App\TreasuryAndCash\Controllers;

use App\Http\Controllers\Controller;
use App\TreasuryAndCash\Application\BankingDataService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BankingController extends Controller
{
    public function __construct(
        private readonly BankingDataService $bankingDataService,
    ) {
        $this->middleware('permission:banking.view')->only(['accounts']);
    }

    public function accounts(Request $request): Response
    {
        $accounts = $this->bankingDataService->listAccounts(
            $request->attributes->get('active_organization')->id,
            $request->input('search'),
            $request->input('per_page', 18),
        );

        return Inertia::render('treasury-cash/banking/accounts/index', [
            'accounts' => $accounts,
            'filters' => $request->only(['search', 'per_page', 'page']),
        ]);
    }
}
