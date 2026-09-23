<?php

namespace App\FinancialServices\Application;

use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\InterestProvision;
use App\FinancialServices\Application\FinancialTransactionService;
use Carbon\CarbonImmutable;
use RuntimeException;

class InterestProvisionService
{
    public function __construct(private readonly FinancialTransactionService $transactionService)
    {
    }

    public function calculateOrganization(int $organizationId, string $periodStart, string $periodEnd, int $userId): array
    {
        $start = CarbonImmutable::parse($periodStart);
        $end = CarbonImmutable::parse($periodEnd);
        if ($end->lessThan($start)) {
            throw new RuntimeException('Interest period end must be on or after the start date.');
        }
        $days = $start->diffInDays($end) + 1;
        $provisions = [];

        FinancialAccount::query()
            ->where('organization_id', $organizationId)
            ->whereIn('status', ['PENDING', 'ACTIVE'])
            ->whereHas('product', fn($query) => $query->where('interest_rate', '>', 0)->where('interest_frequency', '!=', 'NONE'))
            ->with('product')
            ->chunkById(100, function ($accounts) use ($start, $end, $days, $userId, &$provisions): void {
                foreach ($accounts as $account) {
                    $basis = max(0, (float) ($account->available_balance ?? $account->balance));
                    $rate = (float) $account->product->interest_rate;
                    $amount = round($basis * $rate / 100 * $days / 365, 4);
                    if ($amount <= 0) {
                        continue;
                    }
                    $provision = InterestProvision::query()
                        ->where('financial_account_id', $account->id)
                        ->whereDate('period_start', $start->toDateString())
                        ->whereDate('period_end', $end->toDateString())
                        ->first() ?? new InterestProvision([
                            'financial_account_id' => $account->id,
                            'period_start' => $start->toDateString(),
                            'period_end' => $end->toDateString(),
                        ]);
                    $provision->fill([
                        'financial_product_id' => $account->financial_product_id,
                        'calculated_at' => now()->toDateString(),
                        'basis_amount' => $basis,
                        'annual_rate' => $rate,
                        'provisioned_amount' => $amount,
                        'status' => 'CALCULATED',
                        'calculated_by' => $userId,
                    ])->save();
                    $provisions[] = $provision;
                }
            });

        return $provisions;
    }

    public function approve(InterestProvision $provision, int $userId): InterestProvision
    {
        if ($provision->status !== 'CALCULATED') {
            throw new RuntimeException('Only calculated interest provisions can be approved.');
        }
        $provision->update(['status' => 'APPROVED', 'approved_by' => $userId, 'approved_at' => now()]);

        return $provision->refresh();
    }

    public function reject(InterestProvision $provision, ?string $note = null): InterestProvision
    {
        if (!in_array($provision->status, ['CALCULATED', 'APPROVED'], true)) {
            throw new RuntimeException('Only pending interest provisions can be rejected.');
        }
        $provision->update(['status' => 'REVERSED', 'note' => $note]);

        return $provision->refresh();
    }

    public function createPosting(InterestProvision $provision, int $organizationId, int $userId, ?string $idempotencyKey = null): \App\FinancialServices\Models\FinancialTransaction
    {
        if ($provision->status !== 'APPROVED') {
            throw new RuntimeException('Only approved interest provisions can be posted.');
        }
        $provision->loadMissing('financialAccount');

        return $this->transactionService->create([
            'financial_account_id' => $provision->financial_account_id,
            'transaction_type' => 'INTEREST_PROVISION',
            'transaction_date' => $provision->period_end->toDateString(),
            'amount' => $provision->provisioned_amount,
            'idempotency_key' => $idempotencyKey ?? 'interest-provision-' . $provision->id,
            'source_type' => InterestProvision::class,
            'source_id' => $provision->id,
            'description' => 'Interest provision ' . $provision->period_start->toDateString() . ' to ' . $provision->period_end->toDateString(),
        ], $organizationId, $userId);
    }
}