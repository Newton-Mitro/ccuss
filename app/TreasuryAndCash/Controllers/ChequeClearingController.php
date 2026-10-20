<?php

namespace App\TreasuryAndCash\Controllers;

use App\Http\Controllers\Controller;
use App\SystemAdministration\Models\Branch;
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
        $this->middleware('permission:cheques.present')->only(['create', 'store', 'send', 'present']);
        $this->middleware('permission:cheques.clear')->only('settle');
        $this->middleware('permission:cheques.bounce')->only('bounce');
        $this->middleware('permission:cheques.cancel')->only('cancel');
    }

    public function index(Request $request): Response
    {
        $organizationId = (int) $request->attributes->get('active_organization')->id;

        return Inertia::render('treasury-cash/cheques/clearings', [
            'clearings' => ChequeClearing::query()->whereHas('cheque.chequeBook.bankAccount', fn ($query) => $query->where('organization_id', $organizationId))->with('cheque')->latest('clearing_date')->paginate(20),
        ]);
    }

    public function create(Request $request): Response
    {
        $organizationId = (int) $request->attributes->get('active_organization')->id;

        return Inertia::render('treasury-cash/cheques/clearings-create', [
            'cheques' => Cheque::query()
                ->where('status', 'PRESENTED')
                ->whereHas('chequeBook.bankAccount', fn ($query) => $query->where('organization_id', $organizationId))
                ->orderBy('cheque_no')
                ->get(['id', 'cheque_no', 'amount']),
            'branches' => Branch::query()
                ->where('organization_id', $organizationId)
                ->orderBy('name')
                ->get(['id', 'code', 'name']),
            'default_branch_id' => $request->user()->branch_id,
        ]);
    }

    public function store(StoreChequeClearingRequest $request)
    {
        try {
            $this->service->create($request->validated(), (int) $request->attributes->get('active_organization')->id, $request->user()->id);

            return redirect()->route('cheque-clearings.index')->with('success', 'Cheque clearing created.');
        } catch (\RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }
    }

    public function transition(Request $request, ChequeClearing $chequeClearing, string $action)
    {
        $this->service->transition($chequeClearing, $action, (int) $request->attributes->get('active_organization')->id, $request->user()->id, $request->string('reason')->value() ?: null);

        return back()->with('success', 'Cheque clearing updated.');
    }
}
