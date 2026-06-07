<?php

namespace App\DepositModule\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class DepositAccountController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('deposit-module/accounts/account_opening_page');
    }

}