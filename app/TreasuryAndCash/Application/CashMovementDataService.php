<?php

namespace App\TreasuryAndCash\Application;

use App\FinancialServices\Models\FinancialAccount;
use App\TreasuryAndCash\Models\BankAccount;
use App\TreasuryAndCash\Models\BranchDay;
use App\TreasuryAndCash\Models\CashLocation;
use App\TreasuryAndCash\Models\CashAdjustment;
use App\TreasuryAndCash\Models\CashTransfer;
use App\TreasuryAndCash\Models\TellerCashTransaction;
use App\TreasuryAndCash\Models\TellerSession;
use Illuminate\Pagination\LengthAwarePaginator;

class CashMovementDataService
{
    public function listCashAdjustments(int $organizationId, int $branchId, ?string $search = null, int $perPage = 18): LengthAwarePaginator
    {
        $query = CashAdjustment::query()
            ->whereHas('branchDay', function ($branchDay) use ($organizationId, $branchId) {
                $branchDay
                    ->where('organization_id', $organizationId)
                    ->where('branch_id', $branchId);
            })
            ->with([
                'tellerSession.teller',
                'branchDay',
            ])
            ->latest('requested_at');

        if (!empty($search)) {
            $term = trim($search);
            $query->where(function ($builder) use ($term) {
                $builder->where('type', 'like', "%{$term}%")
                    ->orWhere('status', 'like', "%{$term}%")
                    ->orWhere('reason', 'like', "%{$term}%")
                    ->orWhereHas('tellerSession.teller', function ($teller) use ($term) {
                        $teller->where('name', 'like', "%{$term}%")
                            ->orWhere('code', 'like', "%{$term}%");
                    });
            });
        }

        return $query->paginate($perPage)->withQueryString();
    }

    public function listCashTransfers(int $organizationId, int $branchId, ?string $search = null, int $perPage = 18): LengthAwarePaginator
    {
        $query = CashTransfer::query()
            ->whereHas('branchDay', function ($branchDay) use ($organizationId, $branchId) {
                $branchDay
                    ->where('organization_id', $organizationId)
                    ->where('branch_id', $branchId);
            })
            ->with(['fromCashLocation', 'toCashLocation', 'bankAccount', 'branchDay'])
            ->latest('requested_at');

        if (!empty($search)) {
            $term = trim($search);
            $query->where(function ($builder) use ($term) {
                $builder->where('transfer_no', 'like', "%{$term}%")
                    ->orWhere('status', 'like', "%{$term}%")
                    ->orWhereHas('fromCashLocation', function ($location) use ($term) {
                        $location->where('name', 'like', "%{$term}%")
                            ->orWhere('code', 'like', "%{$term}%");
                    })
                    ->orWhereHas('toCashLocation', function ($location) use ($term) {
                        $location->where('name', 'like', "%{$term}%")
                            ->orWhere('code', 'like', "%{$term}%");
                    })
                    ->orWhereHas('bankAccount', function ($account) use ($term) {
                        $account->where('account_name', 'like', "%{$term}%")
                            ->orWhere('account_number', 'like', "%{$term}%");
                    });
            });
        }

        return $query->paginate($perPage)->withQueryString();
    }

    public function listTellerCashTransactions(int $organizationId, int $branchId, ?string $search = null, int $perPage = 18): LengthAwarePaginator
    {
        $query = TellerCashTransaction::query()
            ->whereHas('branchDay', function ($branchDay) use ($organizationId, $branchId) {
                $branchDay
                    ->where('organization_id', $organizationId)
                    ->where('branch_id', $branchId);
            })
            ->with(['tellerSession.teller', 'branchDay'])
            ->latest('requested_at');

        if (!empty($search)) {
            $term = trim($search);
            $query->where(function ($builder) use ($term) {
                $builder->where('transaction_no', 'like', "%{$term}%")
                    ->orWhere('type', 'like', "%{$term}%")
                    ->orWhere('status', 'like', "%{$term}%")
                    ->orWhereHas('tellerSession.teller', function ($teller) use ($term) {
                        $teller->where('name', 'like', "%{$term}%")
                            ->orWhere('code', 'like', "%{$term}%");
                    });
            });
        }

        return $query->paginate($perPage)->withQueryString();
    }

    public function forCashTransfer(int $organizationId, int $branchId, string $transferType): array
    {
        [$sourceType, $destinationType] = match ($transferType) {
            'VAULT_TO_TELLER' => ['VAULT', 'TELLER'],
            'TELLER_TO_VAULT' => ['TELLER', 'VAULT'],
            'VAULT_TO_VAULT' => ['VAULT', 'VAULT'],
            'BANK_TO_VAULT' => [null, 'VAULT'],
            'VAULT_TO_BANK' => ['VAULT', null],
            default => ['TELLER', 'TELLER'],
        };
        $locations = CashLocation::query()
            ->where('organization_id', $organizationId)
            ->where('branch_id', $branchId)
            ->where('is_active', true)
            ->orderBy('name');

        return [
            'transfer_type' => $transferType,
            'branch_day' => BranchDay::query()
                ->where('organization_id', $organizationId)
                ->where('branch_id', $branchId)
                ->where('status', BranchDay::STATUS_OPEN)
                ->latest('business_date')
                ->first(),
            'from_cash_locations' => (clone $locations)
                ->where('type', $sourceType)
                ->get(['id', 'code', 'name', 'type']),
            'to_cash_locations' => (clone $locations)
                ->where('type', $destinationType)
                ->get(['id', 'code', 'name', 'type']),
            'bank_accounts' => in_array($transferType, ['BANK_TO_VAULT', 'VAULT_TO_BANK'], true)
                ? BankAccount::query()
                    ->where('organization_id', $organizationId)
                    ->where('status', 'ACTIVE')
                    ->where(fn($query) => $query->whereNull('branch_id')->orWhere('branch_id', $branchId))
                    ->orderBy('account_name')
                    ->get(['id', 'account_name', 'account_number'])
                : [],
        ];
    }

    public function forAdjustment(int $organizationId, int $branchId): array
    {
        return [
            'teller_sessions' => TellerSession::query()
                ->where('status', 'OPEN')
                ->whereHas('branchDay', function ($branchDay) use ($organizationId, $branchId) {
                    $branchDay
                        ->where('organization_id', $organizationId)
                        ->where('branch_id', $branchId)
                        ->where('status', BranchDay::STATUS_OPEN);
                })
                ->with(['teller', 'branchDay'])
                ->latest('opened_at')
                ->get(['id', 'branch_day_id', 'teller_id', 'opening_cash', 'expected_cash']),
            'financial_accounts' => FinancialAccount::query()
                ->where('organization_id', $organizationId)
                ->whereIn('status', ['PENDING', 'ACTIVE'])
                ->orderBy('account_no')
                ->get(['id', 'account_no', 'name', 'account_type', 'balance']),
        ];
    }

    public function forTellerCashTransaction(int $organizationId, int $branchId): array
    {
        return [
            'teller_sessions' => TellerSession::query()
                ->where('status', 'OPEN')
                ->whereHas('branchDay', function ($branchDay) use ($organizationId, $branchId) {
                    $branchDay
                        ->where('organization_id', $organizationId)
                        ->where('branch_id', $branchId)
                        ->where('status', BranchDay::STATUS_OPEN);
                })
                ->with(['teller', 'branchDay'])
                ->latest('opened_at')
                ->get(['id', 'branch_day_id', 'teller_id', 'opening_cash', 'expected_cash']),
            'financial_accounts' => FinancialAccount::query()
                ->where('organization_id', $organizationId)
                ->whereIn('status', ['PENDING', 'ACTIVE'])
                ->orderBy('account_no')
                ->get(['id', 'account_no', 'name', 'account_type', 'balance']),
        ];
    }
}
