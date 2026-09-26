<?php

namespace App\TreasuryAndCash\Application;

use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\Cheque;
use App\TreasuryAndCash\Models\ChequeClearing;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ChequeClearingService
{
    public function create(array $data, int $organizationId, int $userId): ChequeClearing
    {
        $branchDay = BranchDay::query()->where('organization_id', $organizationId)->where('branch_id', $data['branch_id'])->where('status', BranchDay::STATUS_OPEN)->latest('business_date')->first();

        if (!$branchDay) {
            throw new RuntimeException('No open branch day exists for this branch. Open a branch day before creating a cheque clearing.');
        }

        $cheque = Cheque::query()->whereKey($data['cheque_id'])->whereHas('chequeBook.bankAccount', fn($query) => $query->where('organization_id', $organizationId))->firstOrFail();
        if ($cheque->status !== 'PRESENTED') {
            throw new RuntimeException('Only presented cheques can enter clearing.');
        }

        return DB::transaction(function () use ($data, $branchDay, $cheque, $userId): ChequeClearing {
            $clearing = $cheque->clearings()->create([
                'branch_day_id' => $branchDay->id,
                'clearing_no' => $data['clearing_no'],
                'drawer_bank_name' => $data['drawer_bank_name'] ?? null,
                'drawer_bank_branch' => $data['drawer_bank_branch'] ?? null,
                'drawer_account_no' => $data['drawer_account_no'] ?? null,
                'amount' => $cheque->amount,
                'clearing_date' => $branchDay->business_date,
                'status' => 'RECEIVED',
            ]);
            $cheque->transactions()->create(['branch_day_id' => $branchDay->id, 'type' => 'PRESENT', 'amount' => $cheque->amount, 'transaction_date' => now(), 'reference' => $clearing->clearing_no, 'created_by' => $userId]);
            return $clearing->refresh();
        });
    }

    public function transition(ChequeClearing $clearing, string $action, int $organizationId, int $userId, ?string $reason = null): ChequeClearing
    {
        $clearing->load('cheque.chequeBook.bankAccount');
        if ($clearing->cheque->chequeBook->bankAccount->organization_id !== $organizationId) {
            abort(404);
        }
        $target = match ($action) {
            'send' => 'SENT',
            'present' => 'PRESENTED',
            'settle' => 'CLEARED',
            'bounce' => 'RETURNED',
            'cancel' => 'CANCELLED',
            default => throw new RuntimeException('Unsupported clearing action.'),
        };
        $allowed = ['RECEIVED' => ['SENT', 'CANCELLED'], 'SENT' => ['PRESENTED', 'CANCELLED'], 'PRESENTED' => ['CLEARED', 'RETURNED'], 'CLEARED' => [], 'RETURNED' => [], 'CANCELLED' => []];
        if (!in_array($target, $allowed[$clearing->status] ?? [], true)) {
            throw new RuntimeException("Clearing cannot transition from {$clearing->status} to {$target}.");
        }
        return DB::transaction(function () use ($clearing, $target, $reason, $userId): ChequeClearing {
            $clearing->update(['status' => $target, 'return_reason' => $target === 'RETURNED' ? $reason : $clearing->return_reason, 'cleared_date' => $target === 'CLEARED' ? now()->toDateString() : null]);
            $type = match ($target) { 'SENT' => 'PRESENT', 'PRESENTED' => 'PRESENT', 'CLEARED' => 'CLEAR', 'RETURNED' => 'BOUNCE', default => 'CANCEL'};
            $clearing->cheque->transactions()->create(['branch_day_id' => $clearing->branch_day_id, 'type' => $type, 'amount' => $clearing->amount, 'transaction_date' => now(), 'reference' => $clearing->clearing_no, 'description' => $reason, 'created_by' => $userId]);
            if ($target === 'CLEARED') {
                $clearing->cheque->update(['status' => 'CLEARED', 'cleared_date' => now()->toDateString()]);
            }
            if ($target === 'RETURNED') {
                $clearing->cheque->update(['status' => 'BOUNCED']);
            }
            return $clearing->refresh();
        });
    }
}