<?php

namespace App\FinancialServices\Application;

use App\CustomerModule\Models\Customer;
use App\FinancialServices\Models\FinancialAccount;
use App\FinancialServices\Models\FinancialProduct;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;
use RuntimeException;

class FinancialAccountService
{
    public function __construct(private readonly FinancialProductPolicyService $policyService)
    {
    }

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

        $data['organization_id'] = $organizationId;
        if (($data['holder_type'] ?? null) === 'customer') {
            $data['holder_type'] = Customer::class;
        }

        if ($product && ($data['holder_type'] ?? null) === Customer::class && !empty($data['holder_id'])) {
            $customer = Customer::query()
                ->where('organization_id', $organizationId)
                ->findOrFail($data['holder_id']);
            $this->policyService->validateAccountOpening($product, $customer);
        }

        $data['status'] = 'PENDING';

        $jointHolderIds = $data['joint_holder_ids'] ?? [];
        $guardianCustomerId = $data['guardian_customer_id'] ?? null;
        unset($data['joint_holder_ids'], $data['guardian_customer_id']);

        return DB::transaction(function () use ($data, $product, $jointHolderIds, $guardianCustomerId, $organizationId): FinancialAccount {
            $account = FinancialAccount::create($data);

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
            }

            return $account;
        });
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
        if (!in_array($account->status, ['ACTIVE', 'DORMANT', 'FROZEN'], true)) {
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