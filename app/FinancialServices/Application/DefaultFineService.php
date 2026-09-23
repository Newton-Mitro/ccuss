<?php

namespace App\FinancialServices\Application;

use App\FinancialServices\Models\AccountDefaultEvent;
use App\FinancialServices\Models\AccountDefaultRule;
use App\FinancialServices\Models\AccountFine;
use App\FinancialServices\Models\FinancialAccount;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class DefaultFineService
{
    public function assessOrganization(int $organizationId, ?string $asOfDate = null): array
    {
        $asOf = CarbonImmutable::parse($asOfDate ?? now()->toDateString());
        $events = [];
        FinancialAccount::query()
            ->where('organization_id', $organizationId)
            ->with(['product', 'loanAccount.schedules.components', 'recurringDeposit.installments'])
            ->chunkById(100, function ($accounts) use ($asOf, &$events): void {
                foreach ($accounts as $account) {
                    $rule = $this->ruleFor($account, $asOf);
                    if (!$rule) {
                        continue;
                    }
                    foreach ($this->overdueObligations($account, $asOf, $rule->grace_days) as $obligation) {
                        $events[] = $this->assessObligation($account, $rule, $obligation, $asOf);
                    }
                }
            });

        return $events;
    }

    public function createRule(array $data, int $organizationId): AccountDefaultRule
    {
        if (($data['financial_product_id'] ?? null) && !$this->productBelongsToOrganization((int) $data['financial_product_id'], $organizationId)) {
            throw new RuntimeException('The default rule product must belong to the organization.');
        }
        if (($data['fine_calculation'] ?? 'FIXED') === 'PERCENTAGE' && (float) ($data['fine_rate'] ?? 0) <= 0) {
            throw new RuntimeException('Percentage fine rules require a positive fine rate.');
        }

        return AccountDefaultRule::create([
            ...$data,
            'organization_id' => $organizationId,
            'effective_from' => $data['effective_from'] ?? now()->toDateString(),
            'is_active' => $data['is_active'] ?? true,
        ]);
    }

    public function waiveFine(AccountFine $fine, int $userId, ?string $note = null): AccountFine
    {
        if (!in_array($fine->status, ['ASSESSED', 'PARTIALLY_PAID'], true)) {
            throw new RuntimeException('Only assessed or partially paid fines can be waived.');
        }
        $fine->update([
            'waived_amount' => max(0, (float) $fine->assessed_amount - (float) $fine->paid_amount),
            'status' => 'WAIVED',
            'waived_by' => $userId,
            'waived_at' => now(),
            'note' => $note ?? $fine->note,
        ]);
        $fine->defaultEvent()->update(['status' => 'WAIVED', 'resolved_at' => now(), 'resolution_note' => $note]);

        return $fine->refresh();
    }

    private function assessObligation(FinancialAccount $account, AccountDefaultRule $rule, array $obligation, CarbonImmutable $asOfDate): AccountDefaultEvent
    {
        return DB::transaction(function () use ($account, $rule, $obligation, $asOfDate): AccountDefaultEvent {
            $event = AccountDefaultEvent::query()
                ->where('financial_account_id', $account->id)
                ->where('account_default_rule_id', $rule->id)
                ->whereDate('due_date', $obligation['due_date'])
                ->first() ?? new AccountDefaultEvent([
                    'financial_account_id' => $account->id,
                    'account_default_rule_id' => $rule->id,
                    'due_date' => $obligation['due_date'],
                ]);
            $event->fill([
                'assessed_at' => $asOfDate->toDateString(),
                'days_overdue' => $obligation['days_overdue'],
                'status' => $event->status === 'WAIVED' ? 'WAIVED' : 'OPEN',
            ])->save();
            $baseAmount = (float) $obligation['base_amount'];
            $amount = $rule->fine_calculation === 'PERCENTAGE'
                ? $baseAmount * (float) $rule->fine_rate / 100
                : (float) $rule->fine_amount;
            if ($rule->maximum_fine !== null) {
                $amount = min($amount, (float) $rule->maximum_fine);
            }
            $fine = AccountFine::query()
                ->where('account_default_event_id', $event->id)
                ->whereDate('assessed_at', $asOfDate->toDateString())
                ->first() ?? new AccountFine([
                    'account_default_event_id' => $event->id,
                    'assessed_at' => $asOfDate->toDateString(),
                ]);
            $fine->fill([
                'financial_account_id' => $account->id,
                'base_amount' => $baseAmount,
                'rate' => $rule->fine_rate,
                'assessed_amount' => round($amount, 4),
                'status' => 'ASSESSED',
            ])->save();

            return $event->fresh('fines');
        });
    }

    private function ruleFor(FinancialAccount $account, CarbonImmutable $asOfDate): ?AccountDefaultRule
    {
        return AccountDefaultRule::query()
            ->where('organization_id', $account->organization_id)
            ->where('account_type', $account->account_type)
            ->where('is_active', true)
            ->where(fn($query) => $query->whereNull('effective_from')->orWhereDate('effective_from', '<=', $asOfDate))
            ->where(fn($query) => $query->whereNull('effective_to')->orWhereDate('effective_to', '>=', $asOfDate))
            ->where(fn($query) => $query->whereNull('financial_product_id')->orWhere('financial_product_id', $account->financial_product_id))
            ->orderByRaw('CASE WHEN financial_product_id IS NULL THEN 1 ELSE 0 END')
            ->latest('effective_from')
            ->first();
    }

    private function overdueObligations(FinancialAccount $account, CarbonImmutable $asOfDate, int $graceDays): array
    {
        $obligations = [];
        foreach ($account->loanAccount?->schedules ?? [] as $schedule) {
            $dueDate = CarbonImmutable::parse($schedule->due_date);
            $outstanding = max(0, (float) $schedule->total_due - (float) $schedule->total_paid);
            if ($outstanding > 0 && $dueDate->addDays($graceDays)->lessThan($asOfDate)) {
                $obligations[] = ['due_date' => $dueDate->toDateString(), 'days_overdue' => $dueDate->diffInDays($asOfDate), 'base_amount' => $outstanding];
            }
        }
        foreach ($account->recurringDeposit?->installments ?? [] as $installment) {
            $dueDate = CarbonImmutable::parse($installment->due_date);
            $outstanding = max(0, (float) $installment->amount_due - (float) $installment->amount_paid);
            if ($outstanding > 0 && $dueDate->addDays($graceDays)->lessThan($asOfDate) && !in_array($installment->status, ['PAID', 'WAIVED'], true)) {
                $obligations[] = ['due_date' => $dueDate->toDateString(), 'days_overdue' => $dueDate->diffInDays($asOfDate), 'base_amount' => $outstanding];
            }
        }

        return $obligations;
    }

    private function productBelongsToOrganization(int $productId, int $organizationId): bool
    {
        return \App\FinancialServices\Models\FinancialProduct::query()->whereKey($productId)->where('organization_id', $organizationId)->exists();
    }
}