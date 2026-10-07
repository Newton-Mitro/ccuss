<?php

namespace App\FinancialServices\Application;

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use App\FinancialServices\Models\FinancialProductTerm;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class FinancialAccountService
{
    public function __construct(private readonly FinancialProductPolicyService $policyService) {}

    public function create(array $data, int $organizationId): FinancialAccount
    {
        $product = isset($data['financial_product_id'])
            ? FinancialProduct::query()
                ->where('organization_id', $organizationId)
                ->findOrFail($data['financial_product_id'])
            : null;

        if ($product && $product->status === false) {
            throw new RuntimeException('Accounts cannot be opened for an inactive product.');
        }

        $term = $this->resolveProductTerm($product, $data);
        if ($term) {
            $data['financial_product_term_id'] = $term->id;
            $this->validateTermAmount($term, $data);
        }

        $data['organization_id'] = $organizationId;
        if (($data['holder_type'] ?? null) === 'customer' || ($product && ! empty($data['holder_id']))) {
            $data['holder_type'] = Customer::class;
        }

        if ($product && ($data['holder_type'] ?? null) === Customer::class && ! empty($data['holder_id'])) {
            $customer = Customer::query()
                ->where('organization_id', $organizationId)
                ->findOrFail($data['holder_id']);
            $this->policyService->validateAccountOpening($product, $customer);
        }

        $data['status'] = 'PENDING';
        $autoNumber = in_array($data['account_type'], ['SAVINGS', 'SHARE', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT'], true);
        if ($autoNumber) {
            $data['account_no'] = 'TMP-'.Str::uuid();
        }

        $jointHolderIds = $data['joint_holder_ids'] ?? [];
        $guardianCustomerId = $data['guardian_customer_id'] ?? null;
        unset($data['joint_holder_ids'], $data['guardian_customer_id']);

        return DB::transaction(function () use ($data, $product, $jointHolderIds, $guardianCustomerId, $organizationId, $autoNumber): FinancialAccount {
            $account = FinancialAccount::create($data);
            if ($autoNumber) {
                $prefix = match ($account->account_type) {
                    'SAVINGS' => 'SAV',
                    'SHARE' => 'SHR',
                    'FIXED_DEPOSIT' => 'FDR',
                    'RECURRING_DEPOSIT' => 'RDP',
                };
                $account->update(['account_no' => sprintf('%s-%08d', $prefix, $account->id)]);
            }

            if ($product && in_array($product->category, ['SAVINGS', 'SHARE', 'FIXED_DEPOSIT', 'RECURRING_DEPOSIT'], true)) {
                $primary = Customer::query()
                    ->where('organization_id', $organizationId)
                    ->findOrFail($account->holder_id);
                $guardian = $guardianCustomerId
                    ? Customer::query()->where('organization_id', $organizationId)->findOrFail($guardianCustomerId)
                    : null;
                $account->addHolder($primary, 'PRIMARY', $guardian);

                foreach ($jointHolderIds as $jointHolderId) {
                    if ((int) $jointHolderId === (int) $primary->id) {
                        throw new RuntimeException('The primary holder cannot also be a joint holder.');
                    }

                    $jointHolder = Customer::query()
                        ->where('organization_id', $organizationId)
                        ->findOrFail($jointHolderId);
                    $account->addHolder($jointHolder);
                }

                if ($product->category === 'SAVINGS' && Schema::hasTable('saving_accounts')) {
                    $account->savingAccount()->create([
                        'minimum_balance' => data_get($data, 'minimum_balance', 0),
                        'settings' => data_get($data, 'settings'),
                    ]);
                }
            }

            return $account;
        });
    }

    private function resolveProductTerm(?FinancialProduct $product, array $data): ?FinancialProductTerm
    {
        if ($product && in_array($product->category, ['SAVINGS', 'SHARE'], true)) {
            return null;
        }

        $requestedTermId = $data['financial_product_term_id'] ?? null;
        if (! $product) {
            if ($requestedTermId) {
                throw ValidationException::withMessages([
                    'financial_product_term_id' => 'Select a term belonging to the selected product.',
                ]);
            }

            return null;
        }

        $today = CarbonImmutable::today();
        $terms = $product->terms()
            ->where('status', true)
            ->where(fn ($query) => $query->whereNull('effective_from')->orWhereDate('effective_from', '<=', $today))
            ->where(fn ($query) => $query->whereNull('effective_until')->orWhereDate('effective_until', '>=', $today));

        if ($requestedTermId) {
            $term = (clone $terms)->whereKey($requestedTermId)->first();
            if (! $term) {
                throw ValidationException::withMessages([
                    'financial_product_term_id' => 'Select an active term belonging to the selected product.',
                ]);
            }

            return $term;
        }

        return (clone $terms)->where('code', 'BASE')->first() ?? $terms->first();
    }

    private function validateTermAmount(FinancialProductTerm $term, array $data): void
    {
        $amountField = match ($data['account_type']) {
            'FIXED_DEPOSIT' => 'principal_amount',
            'RECURRING_DEPOSIT' => 'installment_amount',
            default => null,
        };
        $amount = $amountField ? ($data[$amountField] ?? null) : null;

        if ($amount === null) {
            return;
        }

        if ($term->minimum_amount !== null && (float) $amount < (float) $term->minimum_amount) {
            throw ValidationException::withMessages([
                $amountField => 'The amount is below the selected product term minimum.',
            ]);
        }

        if ($term->maximum_amount !== null && (float) $amount > (float) $term->maximum_amount) {
            throw ValidationException::withMessages([
                $amountField => 'The amount exceeds the selected product term maximum.',
            ]);
        }
    }

    public function activate(FinancialAccount $account): FinancialAccount
    {
        if ($account->status !== 'PENDING') {
            throw new RuntimeException('Only pending accounts can be activated.');
        }

        $account->update(['status' => 'ACTIVE', 'opened_at' => now()->toDateString()]);

        return $account->refresh();
    }

    public function close(FinancialAccount $account): FinancialAccount
    {
        if (! in_array($account->status, ['ACTIVE', 'DORMANT', 'FROZEN'], true)) {
            throw new RuntimeException('This account cannot be closed from its current status.');
        }

        if ((float) $account->balance !== 0.0) {
            throw new RuntimeException('An account must have a zero balance before it can be closed.');
        }

        $account->update(['status' => 'CLOSED', 'closed_at' => now()->toDateString()]);

        return $account->refresh();
    }

    public function queryForOrganization(int $organizationId): Builder
    {
        return FinancialAccount::query()->where('organization_id', $organizationId);
    }
}
