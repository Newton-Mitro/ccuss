<?php

namespace App\FinancialServices\Application;

use App\CustomerModule\Models\Customer;
use Illuminate\Database\Eloquent\Builder;

class CustomerCollectionService
{
    public function search(int $organizationId, string $search): array
    {
        return Customer::query()
            ->where('organization_id', $organizationId)
            ->where(function (Builder $query) use ($search): void {
                $query
                    ->where('customer_no', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('primary_phone', 'like', "%{$search}%")
                    ->orWhereHas('depositAccounts.financialAccount', fn(Builder $account) => $account->where('account_no', 'like', "%{$search}%"))
                    ->orWhereHas('loanAccounts', fn(Builder $loan) => $loan->where('loan_no', 'like', "%{$search}%"));
            })
            ->orderBy('name')
            ->limit(20)
            ->get(['id', 'customer_no', 'name', 'primary_phone'])
            ->map(fn(Customer $customer): array => [
                'id' => $customer->id,
                'customer_no' => $customer->customer_no,
                'name' => $customer->name,
                'primary_phone' => $customer->primary_phone,
            ])
            ->all();
    }

    public function summary(Customer $customer): array
    {
        $customer->load([
            'depositAccounts.financialAccount.product',
            'depositAccounts.shareAccount',
            'depositAccounts.fixedDeposit',
            'depositAccounts.recurringDeposit.installments',
            'loanAccounts.financialAccount.product',
            'loanAccounts.schedules.components',
            'loanAccounts.arrears',
            'loanAccounts.protectionPolicy',
        ]);

        return [
            'customer' => $customer->only(['id', 'customer_no', 'name', 'primary_phone', 'primary_email']),
            'deposit_accounts' => $customer->depositAccounts->map(fn($account): array => [
                'id' => $account->id,
                'account_no' => $account->financialAccount?->account_no,
                'product' => $account->financialAccount?->product?->name,
                'account_kind' => $account->account_kind,
                'status' => $account->status,
                'balance' => $account->financialAccount?->balance,
                'fine_total' => $account->financialAccount?->fines()->whereIn('status', ['ASSESSED', 'POSTED', 'PARTIALLY_PAID'])->sum('assessed_amount'),
                'fixed_deposit' => $account->fixedDeposit,
                'recurring_deposit' => $account->recurringDeposit,
            ])->values()->all(),
            'loan_accounts' => $customer->loanAccounts->map(fn($loan): array => [
                'id' => $loan->id,
                'loan_no' => $loan->loan_no,
                'product' => $loan->financialAccount?->product?->name,
                'status' => $loan->status,
                'balance' => $loan->financialAccount?->balance,
                'schedules' => $loan->schedules->map(fn($schedule): array => [
                    'id' => $schedule->id,
                    'installment_no' => $schedule->installment_no,
                    'due_date' => $schedule->due_date?->toDateString(),
                    'total_due' => $schedule->total_due,
                    'total_paid' => $schedule->total_paid,
                    'status' => $schedule->status,
                ])->values()->all(),
                'arrears' => $loan->arrears->whereIn('status', ['OPEN', 'PARTIALLY_CLEARED'])->values()->all(),
                'arrears_total' => $loan->arrears
                    ->whereIn('status', ['OPEN', 'PARTIALLY_CLEARED'])
                    ->sum('total_overdue'),
                'fine_total' => $loan->financialAccount?->fines()->whereIn('status', ['ASSESSED', 'POSTED', 'PARTIALLY_PAID'])->sum('assessed_amount'),
                'interest_due' => $loan->schedules
                    ->flatMap->components
                    ->where('type', 'INTEREST')
                    ->sum(fn($component) => (float) $component->amount_due - (float) $component->amount_paid),
                'protection_fee_due' => $loan->schedules
                    ->flatMap->components
                    ->where('type', 'PROTECTION_FEE')
                    ->sum(fn($component) => (float) $component->amount_due - (float) $component->amount_paid),
                'protection_policy' => $loan->protectionPolicy ? [
                    'required' => $loan->protectionPolicy->required,
                    'status' => $loan->protectionPolicy->status,
                    'initial_fee' => $loan->protectionPolicy->initial_fee,
                    'renewal_fee' => $loan->protectionPolicy->renewal_fee,
                    'next_renewal_at' => $loan->protectionPolicy->next_renewal_at?->toDateString(),
                ] : null,
            ])->values()->all(),
        ];
    }
}
