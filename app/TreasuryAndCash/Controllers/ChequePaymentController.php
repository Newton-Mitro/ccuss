<?php

namespace App\TreasuryAndCash\Controllers;

use App\CustomerModule\Models\Customer;
use App\Http\Controllers\Controller;
use App\TreasuryAndCash\Application\ChequePaymentService;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\Cheque;
use App\TreasuryAndCash\Models\ChequePayment;
use App\TreasuryAndCash\Models\TellerSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChequePaymentController extends Controller
{
    public function __construct(private readonly ChequePaymentService $service)
    {
    }

    public function index(Request $request): Response
    {
        $organizationId = (int) $request->attributes->get('active_organization')->id;
        $branchId = (int) $request->user()->branch_id;

        return Inertia::render('treasury-cash/cheques/payments/index', [
            'payments' => ChequePayment::query()
                ->where('organization_id', $organizationId)
                ->with(['cheque', 'financialAccount', 'receivedBy', 'verifiedBy', 'approvedBy', 'paidBy'])
                ->latest()
                ->paginate(20),
            'available_cheques' => Cheque::query()
                ->where('status', 'ISSUED')
                ->whereNotIn('id', ChequePayment::query()
                    ->whereNotIn('status', ['RETURNED'])
                    ->select('cheque_id'))
                ->where(function ($query) use ($organizationId): void {
                    $query->whereHas('financialAccount', fn($account) => $account
                        ->where('organization_id', $organizationId)
                        ->where('status', 'ACTIVE'))
                        ->orWhereHas('chequeBook.financialAccount', fn($account) => $account
                            ->where('organization_id', $organizationId)
                            ->where('status', 'ACTIVE'));
                })
                ->with(['financialAccount', 'chequeBook.financialAccount'])
                ->orderBy('cheque_no')
                ->get()
                ->map(function (Cheque $cheque): array {
                    $account = $cheque->financialAccount ?? $cheque->chequeBook?->financialAccount;

                    return [
                        'id' => $cheque->id,
                        'cheque_no' => $cheque->cheque_no,
                        'amount' => (float) $cheque->amount,
                        'cheque_date' => $cheque->cheque_date?->toDateString(),
                        'payee' => $cheque->payee,
                        'financial_account_id' => $account?->id,
                        'account_no' => $account?->account_no,
                        'account_name' => $account?->name,
                    ];
                })
                ->values(),
            'teller_sessions' => TellerSession::query()
                ->where('status', 'OPEN')
                ->whereHas('branchDay', fn($branchDay) => $branchDay
                    ->where('organization_id', $organizationId)
                    ->where('branch_id', $branchId)
                    ->where('status', BranchDay::STATUS_OPEN))
                ->with('teller')
                ->latest('opened_at')
                ->get(['id', 'branch_day_id', 'teller_id'])
                ->map(fn(TellerSession $session): array => [
                    'id' => $session->id,
                    'label' => $session->teller?->name ?? "Teller session {$session->id}",
                ]),
        ]);
    }

    public function show(Request $request, ChequePayment $chequePayment): Response
    {
        $organizationId = (int) $request->attributes->get('active_organization')->id;
        $payment = ChequePayment::query()
            ->where('organization_id', $organizationId)
            ->with([
                'cheque',
                'financialAccount.holder.signature',
                'financialAccount.holders.signature',
                'financialAccount.authorizedPersons.customer.signature',
                'tellerSession.teller',
                'signatory',
                'receivedBy',
                'verifiedBy',
                'approvedBy',
                'paidBy',
                'financialTransaction',
                'events.performedBy',
            ])
            ->findOrFail($chequePayment->id);

        $account = $payment->financialAccount;
        $signatories = collect();
        if ($account->holder instanceof Customer) {
            $signatories->push($this->signatoryData($account->holder, 'Primary account holder', null, true));
        }
        foreach ($account->holders as $holder) {
            if (!$signatories->contains('id', $holder->id)) {
                $signatories->push($this->signatoryData($holder, strtoupper(str_replace('_', ' ', $holder->pivot->role)), null, true));
            }
        }
        foreach ($account->authorizedPersons as $authorizedPerson) {
            if ($authorizedPerson->customer && $authorizedPerson->authorization_type === 'SIGNATORY') {
                $isEffective = $authorizedPerson->is_active
                    && (!$authorizedPerson->effective_from || $authorizedPerson->effective_from->lte(today()))
                    && (!$authorizedPerson->effective_to || $authorizedPerson->effective_to->gte(today()))
                    && ($authorizedPerson->transaction_limit === null || (float) $authorizedPerson->transaction_limit >= (float) $payment->amount);
                $signatories->push($this->signatoryData(
                    $authorizedPerson->customer,
                    strtoupper(str_replace('_', ' ', $authorizedPerson->authorization_type)),
                    $authorizedPerson->transaction_limit,
                    $isEffective,
                ));
            }
        }

        return Inertia::render('treasury-cash/cheques/payments/show', [
            'payment' => $payment,
            'account_check' => [
                'status' => $account->status,
                'available_balance' => (float) $account->available_balance,
                'balance_sufficient' => (float) $account->available_balance >= (float) $payment->amount,
            ],
            'signatories' => $signatories->values(),
        ]);
    }

    public function receive(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'cheque_id' => ['required', 'integer', 'exists:cheques,id'],
            'teller_session_id' => ['required', 'integer', 'exists:teller_sessions,id'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);
        $user = $request->user();
        abort_unless($user->branch_id, 422, 'A branch assignment is required to receive a cheque.');

        $payment = $this->service->receive(
            Cheque::query()->findOrFail($data['cheque_id']),
            (int) $data['teller_session_id'],
            (int) $request->attributes->get('active_organization')->id,
            (int) $user->branch_id,
            (int) $user->id,
            $data['note'] ?? null,
        );

        return redirect()->route('cheque-payments.show', $payment)->with('success', 'Cheque received for verification.');
    }

    public function verify(Request $request, ChequePayment $chequePayment): RedirectResponse
    {
        $data = $request->validate([
            'signatory_customer_id' => ['required', 'integer', 'exists:customers,id'],
            'details_verified' => ['required', 'accepted'],
            'signature_match' => ['required', 'accepted'],
        ]);
        $this->service->verify(
            $chequePayment,
            (int) $data['signatory_customer_id'],
            true,
            true,
            (int) $request->attributes->get('active_organization')->id,
            (int) $request->user()->id,
        );

        return back()->with('success', 'Cheque checks passed and the payment is pending approval.');
    }

    public function approve(Request $request, ChequePayment $chequePayment): RedirectResponse
    {
        $this->service->approve(
            $chequePayment,
            (int) $request->attributes->get('active_organization')->id,
            (int) $request->user()->id,
        );

        return back()->with('success', 'Cheque payment approved.');
    }

    public function returnPayment(Request $request, ChequePayment $chequePayment): RedirectResponse
    {
        $data = $request->validate(['reason' => ['required', 'string', 'max:1000']]);
        $this->service->return(
            $chequePayment,
            $data['reason'],
            (int) $request->attributes->get('active_organization')->id,
            (int) $request->user()->id,
        );

        return back()->with('success', 'Cheque returned with a recorded reason.');
    }

    public function pay(Request $request, ChequePayment $chequePayment): RedirectResponse
    {
        $this->service->pay(
            $chequePayment,
            (int) $request->attributes->get('active_organization')->id,
            (int) $request->user()->branch_id,
            (int) $request->user()->id,
        );

        return back()->with('success', 'Cheque payment posted and marked paid.');
    }

    private function signatoryData(Customer $customer, string $detail, mixed $transactionLimit, bool $eligible): array
    {
        return [
            'id' => $customer->id,
            'name' => $customer->name,
            'detail' => $detail,
            'eligible' => $eligible,
            'transaction_limit' => $transactionLimit === null ? null : (float) $transactionLimit,
            'signature' => $customer->signature ? [
                'url' => $customer->signature->url,
                'verification_status' => $customer->signature->verification_status,
            ] : null,
        ];
    }
}