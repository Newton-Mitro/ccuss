<?php

namespace App\TreasuryAndCash\Controllers;

use App\Http\Controllers\Controller;
use App\TreasuryAndCash\Application\ChequeDataService;
use App\TreasuryAndCash\Application\ChequeService;
use App\TreasuryAndCash\Models\BankAccount;
use App\TreasuryAndCash\Models\Cheque;
use App\TreasuryAndCash\Requests\StoreChequeBookRequest;
use App\TreasuryAndCash\Requests\UpdateChequeRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChequeController extends Controller
{
    public function __construct(
        private readonly ChequeDataService $chequeDataService,
        private readonly ChequeService $chequeService,
    ) {
        $this->middleware('permission:cheque_books.view')->only(['books', 'createBook']);
        $this->middleware('permission:cheques.view')->only(['cheques']);
        $this->middleware('permission:cheque_books.create')->only('storeBook');
        $this->middleware('permission:cheques.issue')->only('issue');
        $this->middleware('permission:cheques.present')->only('present');
        $this->middleware('permission:cheques.clear')->only('clear');
        $this->middleware('permission:cheques.bounce')->only('bounce');
        $this->middleware('permission:cheques.stop')->only('stop');
        $this->middleware('permission:cheques.cancel')->only('cancel');
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

    public function createBook(Request $request): Response
    {
        return Inertia::render('treasury-cash/cheques/books/create', [
            'bank_accounts' => BankAccount::query()
                ->where('organization_id', $request->attributes->get('active_organization')->id)
                ->with('bank')
                ->where('status', 'ACTIVE')
                ->orderBy('account_name')
                ->get(['id', 'account_name', 'account_number', 'bank_id']),
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

    public function storeBook(StoreChequeBookRequest $request): RedirectResponse
    {
        $this->chequeService->createBook($request->validated(), $request->user()->id);
        return back()->with('success', 'Cheque book created successfully.');
    }

    public function update(Request $request, Cheque $cheque, UpdateChequeRequest $validatedRequest): RedirectResponse
    {
        $this->authorizeCheque($request, $cheque);
        $this->chequeService->update($cheque, $validatedRequest->validated());
        return back()->with('success', 'Cheque updated successfully.');
    }

    public function issue(Request $request, Cheque $cheque, UpdateChequeRequest $validatedRequest): RedirectResponse
    {
        return $this->transition($request, $cheque, $validatedRequest, 'issue');
    }
    public function present(Request $request, Cheque $cheque): RedirectResponse
    {
        return $this->transition($request, $cheque, null, 'present');
    }
    public function clear(Request $request, Cheque $cheque): RedirectResponse
    {
        return $this->transition($request, $cheque, null, 'clear');
    }
    public function bounce(Request $request, Cheque $cheque, UpdateChequeRequest $validatedRequest): RedirectResponse
    {
        return $this->transition($request, $cheque, $validatedRequest, 'bounce');
    }
    public function stop(Request $request, Cheque $cheque, UpdateChequeRequest $validatedRequest): RedirectResponse
    {
        return $this->transition($request, $cheque, $validatedRequest, 'stop');
    }
    public function cancel(Request $request, Cheque $cheque): RedirectResponse
    {
        return $this->transition($request, $cheque, null, 'cancel');
    }

    private function transition(Request $request, Cheque $cheque, ?UpdateChequeRequest $validatedRequest, string $action): RedirectResponse
    {
        $this->authorizeCheque($request, $cheque);
        $this->chequeService->transition($cheque, $action, $request->user()->id, $validatedRequest?->validated() ?? []);
        return back()->with('success', 'Cheque status updated successfully.');
    }

    private function authorizeCheque(Request $request, Cheque $cheque): void
    {
        abort_unless($cheque->chequeBook()->whereHas('bankAccount', fn($query) => $query->where('organization_id', $request->attributes->get('active_organization')->id))->exists(), 404);
    }
}
