<?php

namespace App\TreasuryAndCash\Application;

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Models\FinancialAccount;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\Cheque;
use App\TreasuryAndCash\Models\ChequePayment;
use App\TreasuryAndCash\Models\ChequePaymentEvent;
use App\TreasuryAndCash\Models\TellerSession;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ChequePaymentService
{
    public function receive(Cheque $cheque, int $tellerSessionId, int $organizationId, int $branchId, int $userId, ?string $note = null): ChequePayment
    {
        return DB::transaction(function () use ($cheque, $tellerSessionId, $organizationId, $branchId, $userId, $note): ChequePayment {
            $cheque = Cheque::query()->whereKey($cheque->id)->lockForUpdate()->firstOrFail();
            $cheque->load('chequeBook.financialAccount', 'financialAccount');

            if ($cheque->status !== 'ISSUED') {
                throw ValidationException::withMessages(['cheque_id' => 'Only issued, non-stopped cheques can be received for payment.']);
            }

            $account = $cheque->financialAccount ?? $cheque->chequeBook?->financialAccount;
            if (!$account || $account->organization_id !== $organizationId || $account->status !== 'ACTIVE') {
                throw ValidationException::withMessages(['cheque_id' => 'The cheque must belong to an active account in this organization.']);
            }

            if ((float) $cheque->amount <= 0 || ($cheque->cheque_date && $cheque->cheque_date->isFuture())) {
                throw ValidationException::withMessages(['cheque_id' => 'The cheque amount or cheque date is invalid.']);
            }

            $alreadyInWorkflow = ChequePayment::query()
                ->where('cheque_id', $cheque->id)
                ->whereNotIn('status', ['RETURNED'])
                ->exists();
            if ($alreadyInWorkflow) {
                throw ValidationException::withMessages(['cheque_id' => 'This cheque already has a payment record.']);
            }

            $session = TellerSession::query()
                ->whereKey($tellerSessionId)
                ->where('status', 'OPEN')
                ->whereHas('branchDay', fn($query) => $query
                    ->where('organization_id', $organizationId)
                    ->where('branch_id', $branchId)
                    ->where('status', BranchDay::STATUS_OPEN))
                ->first();
            if (!$session) {
                throw ValidationException::withMessages(['teller_session_id' => 'Select an open teller session for this branch.']);
            }

            $payment = ChequePayment::create([
                'organization_id' => $organizationId,
                'branch_id' => $branchId,
                'financial_account_id' => $account->id,
                'cheque_id' => $cheque->id,
                'teller_session_id' => $session->id,
                'status' => 'RECEIVED',
                'amount' => $cheque->amount,
                'note' => $note,
                'received_by' => $userId,
            ]);

            $this->event($payment, 'RECEIVED', $userId, ['cheque_no' => $cheque->cheque_no]);

            return $payment;
        });
    }

    public function verify(ChequePayment $payment, int $signatoryCustomerId, bool $detailsVerified, bool $signatureMatch, int $organizationId, int $userId): ChequePayment
    {
        return DB::transaction(function () use ($payment, $signatoryCustomerId, $detailsVerified, $signatureMatch, $organizationId, $userId): ChequePayment {
            $payment = ChequePayment::query()->whereKey($payment->id)->lockForUpdate()->firstOrFail();
            $this->assertOrganization($payment, $organizationId);
            if ($payment->status !== 'RECEIVED') {
                throw ValidationException::withMessages(['workflow' => 'Only received cheques can be verified.']);
            }
            if (!$detailsVerified || !$signatureMatch) {
                throw ValidationException::withMessages(['checks' => 'Confirm cheque details and signature verification before submitting for approval.']);
            }

            $account = FinancialAccount::query()->whereKey($payment->financial_account_id)->lockForUpdate()->firstOrFail();
            $cheque = Cheque::query()->whereKey($payment->cheque_id)->lockForUpdate()->firstOrFail();
            $this->assertChequeIsPayable($cheque, $account, $payment->amount);
            $signatory = $this->authorizedSignatory($account, $signatoryCustomerId, (float) $payment->amount);
            if (!$signatory || $signatory->signature?->verification_status !== 'VERIFIED') {
                throw ValidationException::withMessages(['signatory_customer_id' => 'Choose an active account signatory with a verified specimen signature and sufficient authority.']);
            }

            $checks = [
                'details_verified' => true,
                'account_active' => true,
                'balance_sufficient' => true,
                'signature_match' => true,
                'signature_specimen_verified' => true,
                'authorized_signatory' => true,
                'stop_payment_clear' => true,
                'cheque_valid' => true,
            ];

            $payment->update([
                'status' => 'PENDING_APPROVAL',
                'checks' => $checks,
                'signatory_customer_id' => $signatory->id,
                'verified_by' => $userId,
                'verified_at' => now(),
            ]);
            $this->event($payment, 'VERIFIED', $userId, $checks);

            return $payment->refresh();
        });
    }

    public function approve(ChequePayment $payment, int $organizationId, int $userId): ChequePayment
    {
        return DB::transaction(function () use ($payment, $organizationId, $userId): ChequePayment {
            $payment = ChequePayment::query()->whereKey($payment->id)->lockForUpdate()->firstOrFail();
            $this->assertOrganization($payment, $organizationId);
            if ($payment->status !== 'PENDING_APPROVAL') {
                throw ValidationException::withMessages(['workflow' => 'Only verified cheques can be approved.']);
            }
            if ($payment->received_by === $userId || $payment->verified_by === $userId) {
                throw ValidationException::withMessages(['workflow' => 'The receiver and verifier cannot approve the same cheque.']);
            }

            $payment->update([
                'status' => 'APPROVED',
                'approved_by' => $userId,
                'approved_at' => now(),
            ]);
            $this->event($payment, 'APPROVED', $userId);

            return $payment->refresh();
        });
    }

    public function return(ChequePayment $payment, string $reason, int $organizationId, int $userId): ChequePayment
    {
        return DB::transaction(function () use ($payment, $reason, $organizationId, $userId): ChequePayment {
            $payment = ChequePayment::query()->whereKey($payment->id)->lockForUpdate()->firstOrFail();
            $this->assertOrganization($payment, $organizationId);
            if (!in_array($payment->status, ['RECEIVED', 'PENDING_APPROVAL'], true)) {
                throw ValidationException::withMessages(['workflow' => 'Only received or pending cheques can be returned.']);
            }

            $payment->update(['status' => 'RETURNED', 'return_reason' => $reason]);
            $this->event($payment, 'RETURNED', $userId, [], $reason);

            return $payment->refresh();
        });
    }

    public function pay(ChequePayment $payment, int $organizationId, int $branchId, int $userId): ChequePayment
    {
        return DB::transaction(function () use ($payment, $organizationId, $branchId, $userId): ChequePayment {
            $payment = ChequePayment::query()->whereKey($payment->id)->lockForUpdate()->firstOrFail();
            $this->assertOrganization($payment, $organizationId);
            if ($payment->status !== 'APPROVED') {
                throw ValidationException::withMessages(['workflow' => 'Only approved cheques can be posted.']);
            }
            if ($payment->approved_by === $userId || $payment->received_by === $userId) {
                throw ValidationException::withMessages(['workflow' => 'The receiver and approver cannot post the same cheque.']);
            }

            $account = FinancialAccount::query()->whereKey($payment->financial_account_id)->lockForUpdate()->firstOrFail();
            $cheque = Cheque::query()->whereKey($payment->cheque_id)->lockForUpdate()->firstOrFail();
            $this->assertChequeIsPayable($cheque, $account, $payment->amount);
            $signatory = $this->authorizedSignatory($account, (int) $payment->signatory_customer_id, (float) $payment->amount);
            if (!$signatory || $signatory->signature?->verification_status !== 'VERIFIED') {
                throw ValidationException::withMessages(['signatory_customer_id' => 'The approved signatory is no longer eligible for this payment.']);
            }

            $tellerTransaction = app(ChequeService::class)->withdrawFromTeller(
                $cheque,
                $payment->teller_session_id,
                $organizationId,
                $branchId,
                $userId,
                true,
            );

            $payment->update([
                'status' => 'PAID',
                'financial_transaction_id' => $tellerTransaction->financial_transaction_id,
                'paid_by' => $userId,
                'paid_at' => now(),
            ]);
            $this->event($payment, 'PAID', $userId, ['financial_transaction_id' => $tellerTransaction->financial_transaction_id]);

            return $payment->refresh();
        });
    }

    private function assertOrganization(ChequePayment $payment, int $organizationId): void
    {
        if ($payment->organization_id !== $organizationId) {
            abort(404);
        }
    }

    private function assertChequeIsPayable(Cheque $cheque, FinancialAccount $account, string|float $amount): void
    {
        if ($cheque->status !== 'ISSUED') {
            throw ValidationException::withMessages(['cheque' => 'The cheque is stopped, expired, or already processed.']);
        }
        if ($account->status !== 'ACTIVE') {
            throw ValidationException::withMessages(['account' => 'The account is not active.']);
        }
        if ((float) $account->available_balance < (float) $amount) {
            throw ValidationException::withMessages(['account' => 'The account does not have enough available balance.']);
        }
        if ($cheque->cheque_date?->isFuture()) {
            throw ValidationException::withMessages(['cheque' => 'Post-dated cheques cannot be paid.']);
        }
    }

    private function authorizedSignatory(FinancialAccount $account, int $customerId, float $amount): ?Customer
    {
        $account->loadMissing(['holder.signature', 'holders.signature']);
        $customer = Customer::query()
            ->where('organization_id', $account->organization_id)
            ->with('signature')
            ->find($customerId);
        if (!$customer) {
            return null;
        }

        $isHolder = ($account->holder_type === Customer::class && $account->holder_id === $customerId)
            || $account->holders->contains('id', $customerId);
        if ($isHolder) {
            return $customer;
        }

        $authorizedPerson = $account->authorizedPersons()
            ->where('customer_id', $customerId)
            ->where('authorization_type', 'SIGNATORY')
            ->where('is_active', true)
            ->where(fn($query) => $query->whereNull('effective_from')->orWhereDate('effective_from', '<=', today()))
            ->where(fn($query) => $query->whereNull('effective_to')->orWhereDate('effective_to', '>=', today()))
            ->first();
        if (!$authorizedPerson || ($authorizedPerson->transaction_limit !== null && $amount > (float) $authorizedPerson->transaction_limit)) {
            return null;
        }

        return $customer;
    }

    private function event(ChequePayment $payment, string $action, int $userId, array $metadata = [], ?string $reason = null): void
    {
        ChequePaymentEvent::create([
            'cheque_payment_id' => $payment->id,
            'performed_by' => $userId,
            'action' => $action,
            'metadata' => $metadata ?: null,
            'reason' => $reason,
        ]);
    }
}