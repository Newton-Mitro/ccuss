<?php

namespace App\TreasuryAndCash\Application;

use App\TreasuryAndCash\Models\BankAccount;
use App\TreasuryAndCash\Models\BankReconciliation;
use App\TreasuryAndCash\Models\BankTransaction;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class BankReconciliationService
{
    public function createOrUpdate(array $data, int $organizationId): BankReconciliation
    {
        $account = BankAccount::query()->where('organization_id', $organizationId)->where('is_reconcilable', true)->whereKey($data['bank_account_id'])->firstOrFail();
        $bookBalance = (float) $account->opening_balance + (float) BankTransaction::query()->where('bank_account_id', $account->id)->where('status', 'POSTED')->get()->sum(fn($transaction) => in_array($transaction->type, ['DEPOSIT', 'TRANSFER_IN', 'INTEREST'], true) ? (float) $transaction->amount : -(float) $transaction->amount);
        $statementBalance = (float) $data['statement_balance'];

        return DB::transaction(function () use ($account, $data, $statementBalance, $bookBalance): BankReconciliation {
            $reconciliation = BankReconciliation::query()
                ->where('bank_account_id', $account->id)
                ->whereDate('statement_date', $data['statement_date'])
                ->first() ?? new BankReconciliation([
                    'bank_account_id' => $account->id,
                    'statement_date' => $data['statement_date'],
                ]);
            $reconciliation->fill([
                'statement_balance' => $statementBalance,
                'book_balance' => $bookBalance,
                'difference' => round($statementBalance - $bookBalance, 4),
                'status' => 'OPEN',
            ])->save();

            return $reconciliation;
        });
    }

    public function finalize(BankReconciliation $reconciliation, int $organizationId, int $userId): BankReconciliation
    {
        $reconciliation->load('bankAccount');
        if ($reconciliation->bankAccount->organization_id !== $organizationId) {
            abort(404);
        }
        if (abs((float) $reconciliation->difference) > 0.0001) {
            throw new RuntimeException('A reconciliation with a difference cannot be finalized.');
        }
        $reconciliation->update(['status' => 'RECONCILED', 'reconciled_by' => $userId, 'reconciled_at' => now()]);

        return $reconciliation->refresh();
    }
}