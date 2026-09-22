<?php

namespace App\TreasuryAndCash\Application;

use App\FinancialServices\Models\FinancialAccount;
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
            ->with(['tellerSession.teller', 'branchDay'])
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
            ->with(['fromCashLocation', 'toCashLocation', 'branchDay'])
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

    public function forTellerTransfer(int $organizationId, int $branchId): array
    {
        return [
            'branch_day' => BranchDay::query()
                ->where('organization_id', $organizationId)
                ->where('branch_id', $branchId)
                ->where('status', BranchDay::STATUS_OPEN)
                ->latest('business_date')
                ->first(),
            'cash_locations' => CashLocation::query()
                ->where('organization_id', $organizationId)
                ->where('branch_id', $branchId)
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'code', 'name', 'type']),
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
