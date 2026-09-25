<?php

namespace App\TreasuryAndCash\Application;

use App\FinancialServices\Application\FinancialTransactionService;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialTransaction;
use App\TreasuryAndCash\Models\BankAccount;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Models\Cheque;
use App\TreasuryAndCash\Models\ChequeBook;
use App\TreasuryAndCash\Models\TellerCashTransaction;
use App\TreasuryAndCash\Models\TellerSession;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ChequeService
{
    public function createBook(array $data, int $userId): ChequeBook
    {
        return DB::transaction(function () use ($data, $userId): ChequeBook {
            $start = (int) $data['start_number'];
            $end = (int) $data['end_number'];

            if (empty($data['financial_account_id']) && !empty($data['bank_account_id'])) {
                $data['financial_account_id'] = BankAccount::query()
                    ->whereKey($data['bank_account_id'])
                    ->value('financial_account_id');
            }

            $book = ChequeBook::create([
                ...$data,
                'financial_account_id' => $data['financial_account_id'] ?? null,
                'bank_account_id' => $data['bank_account_id'] ?? null,
                'leaf_count' => $end - $start + 1,
                'current_number' => $start,
                'status' => 'AVAILABLE',
            ]);

            return $book->load('cheques');
        });
    }

    public function update(Cheque $cheque, array $data): Cheque
    {
        if ($cheque->status !== 'UNUSED') {
            throw new RuntimeException('Only unused cheques can be edited.');
        }

        $cheque->update($data);
        return $cheque->refresh();
    }

    public function transition(Cheque $cheque, string $action, int $userId, array $data = []): Cheque
    {
        $nextStatus = match ($action) {
            'issue' => ['UNUSED' => 'ISSUED'],
            'present' => ['ISSUED' => 'PRESENTED'],
            'clear' => ['PRESENTED' => 'CLEARED'],
            'bounce' => ['PRESENTED' => 'BOUNCED'],
            'stop' => ['ISSUED' => 'STOPPED', 'PRESENTED' => 'STOPPED'],
            'cancel' => ['UNUSED' => 'CANCELLED', 'ISSUED' => 'CANCELLED'],
            default => throw new RuntimeException('Unsupported cheque action.'),
        };

        $current = $cheque->status;
        $target = $nextStatus[$current] ?? null;
        if (!$target) {
            throw new RuntimeException("Cheque cannot be {$action} from {$current} status.");
        }

        return DB::transaction(function () use ($cheque, $action, $target, $userId, $data): Cheque {
            $attributes = ['status' => $target, ...$data];
            if ($target === 'ISSUED') {
                $attributes['issue_date'] = $data['issue_date'] ?? now()->toDateString();
            }
            if ($target === 'PRESENTED') {
                $attributes['presented_date'] = now()->toDateString();
            }
            if ($target === 'CLEARED') {
                $attributes['cleared_date'] = now()->toDateString();
            }

            $cheque->update($attributes);
            $cheque->transactions()->create([
                'type' => strtoupper($action === 'present' ? 'PRESENT' : $action),
                'amount' => $cheque->amount,
                'transaction_date' => now(),
                'description' => $data['note'] ?? null,
                'created_by' => $userId,
            ]);

            return $cheque->refresh();
        });
    }

    public function withdrawFromTeller(
        Cheque $cheque,
        int $tellerSessionId,
        int $organizationId,
        int $branchId,
        int $userId,
    ): TellerCashTransaction {
        return DB::transaction(function () use ($cheque, $tellerSessionId, $organizationId, $branchId, $userId): TellerCashTransaction {
            $cheque->load('chequeBook.financialAccount', 'financialAccount');

            if ($cheque->status !== 'ISSUED') {
                throw new RuntimeException('Only issued cheques can be cashed against a teller session.');
            }

            $account = $cheque->financialAccount ?? $cheque->chequeBook?->financialAccount;
            if (!$account || $account->organization_id !== $organizationId) {
                throw new RuntimeException('The cheque must belong to a valid organization account.');
            }

            if ((float) $account->available_balance < (float) $cheque->amount) {
                throw new RuntimeException('The account does not have enough available balance to cash this cheque.');
            }

            $session = TellerSession::query()
                ->whereKey($tellerSessionId)
                ->where('status', 'OPEN')
                ->whereHas('branchDay', fn($builder) => $builder->where('organization_id', $organizationId)->where('branch_id', $branchId)->where('status', BranchDay::STATUS_OPEN))
                ->with(['branchDay', 'teller.cashLocation.financialAccount'])
                ->lockForUpdate()
                ->firstOrFail();

            $tellerCashAccount = $session->teller?->cashLocation?->financialAccount;
            if (!$tellerCashAccount) {
                throw new RuntimeException('The teller cash location must be linked to a financial account before posting a cheque withdrawal.');
            }

            $financialTransactionService = app(FinancialTransactionService::class);
            $financialTransaction = $financialTransactionService->createMultiLine(
                [
                    'transaction_type' => 'WITHDRAWAL',
                    'transaction_date' => now(),
                    'reference' => 'CHEQUE-' . $cheque->cheque_no,
                    'description' => 'Cheque withdrawal',
                ],
                [
                    [
                        'financial_account_id' => $tellerCashAccount->id,
                        'direction' => 'DEBIT',
                        'amount' => (float) $cheque->amount,
                        'description' => 'Cheque cash out',
                    ],
                    [
                        'financial_account_id' => $account->id,
                        'direction' => 'CREDIT',
                        'amount' => (float) $cheque->amount,
                        'description' => 'Cheque withdrawal debited to savings account',
                    ],
                ],
                $organizationId,
                $userId,
                $branchId,
            );

            $financialTransactionService->post($financialTransaction, $organizationId, $userId);

            $cheque->update([
                'status' => 'PRESENTED',
                'presented_date' => now()->toDateString(),
            ]);

            $cheque->transactions()->create([
                'type' => 'PRESENT',
                'amount' => $cheque->amount,
                'transaction_date' => now(),
                'reference' => 'CHEQUE-' . $cheque->cheque_no,
                'description' => 'Cheque presented at teller',
                'created_by' => $userId,
            ]);

            $cashLocation = $session->teller->cashLocation;
            $transaction = TellerCashTransaction::create([
                'branch_day_id' => $session->branch_day_id,
                'cash_location_id' => $cashLocation->id,
                'teller_session_id' => $session->id,
                'financial_transaction_id' => $financialTransaction->id,
                'transaction_no' => 'TELLER-CHEQUE-' . now()->format('YmdHis'),
                'type' => 'WITHDRAWAL',
                'amount' => $cheque->amount,
                'status' => 'POSTED',
                'reference' => 'CHEQUE-' . $cheque->cheque_no,
                'note' => 'Cheque withdrawal processed',
                'requested_by' => $userId,
                'requested_at' => now(),
                'posted_by' => $userId,
                'posted_at' => now(),
            ]);

            $session->update([
                'expected_cash' => (float) $session->expected_cash - (float) $cheque->amount,
            ]);

            return $transaction->fresh();
        });
    }
}
