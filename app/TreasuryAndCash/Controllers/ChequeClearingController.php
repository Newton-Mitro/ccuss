<?php

namespace App\TreasuryAndCash\Controllers;

use App\Http\Controllers\Controller;
use App\TreasuryAndCash\Application\ChequeClearingService;
use App\TreasuryAndCash\Models\Cheque;
use App\TreasuryAndCash\Models\ChequeClearing;
use App\TreasuryAndCash\Requests\StoreChequeClearingRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChequeClearingController extends Controller
{
    public function __construct(private readonly ChequeClearingService $service)
    {
        $this->middleware('permission:cheques.view')->only('index');
        $this->middleware('permission:cheques.present')->only(['store', 'send', 'present']);
        $this->middleware('permission:cheques.clear')->only('settle');
        $this->middleware('permission:cheques.bounce')->only('bounce');
        $this->middleware('permission:cheques.cancel')->only('cancel');
    }

    public function index(Request $request): Response
    {
        $organizationId = (int) $request->attributes->get('active_organization')->id;
        return Inertia::render('treasury-cash/cheques/clearings', [
            'clearings' => ChequeClearing::query()->whereHas('cheque.chequeBook.bankAccount', fn($query) => $query->where('organization_id', $organizationId))->with('cheque')->latest('clearing_date')->paginate(20),
            'cheques' => Cheque::query()->where('status', 'PRESENTED')->whereHas('chequeBook.bankAccount', fn($query) => $query->where('organization_id', $organizationId))->get(['id', 'cheque_no', 'amount']),
        ]);
    }

    public function store(StoreChequeClearingRequest $request)
    {
        $this->service->create($request->validated(), (int) $request->attributes->get('active_organization')->id, $request->user()->id);
        return back()->with('success', 'Cheque clearing created.');
    }

    public function transition(Request $request, ChequeClearing $chequeClearing, string $action)
    {
        $this->service->transition($chequeClearing, $action, (int) $request->attributes->get('active_organization')->id, $request->user()->id, $request->string('reason')->value() ?: null);
        return back()->with('success', 'Cheque clearing updated.');
    }
}