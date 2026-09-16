<?php

namespace App\GeneralAccounting\Application;

use App\GeneralAccounting\Models\Budget;
use App\GeneralAccounting\Models\CostCenter;
use App\GeneralAccounting\Models\FiscalPeriod;
use App\GeneralAccounting\Models\FiscalYear;
use App\GeneralAccounting\Models\LedgerAccount;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

class BudgetService
{
    public function create(array $data): Budget
    {
        $organizationId = (int) ($data['organization_id'] ?? 0);
        $this->validateHeader($organizationId, (int) $data['fiscal_year_id'], $data['name']);
        $this->validateEntries($organizationId, (int) $data['fiscal_year_id'], $data['entries'] ?? []);

        return DB::transaction(function () use ($data, $organizationId) {
            $budget = Budget::create([
                'organization_id' => $organizationId,
                'fiscal_year_id' => $data['fiscal_year_id'],
                'name' => $data['name'],
                'status' => 'DRAFT',
            ]);
            $this->replaceEntries($budget, $data['entries'] ?? []);

            return $budget->load('entries');
        });
    }

    public function update(Budget $budget, array $data): Budget
    {
        $this->ensureDraft($budget);
        $this->validateHeader($budget->organization_id, (int) $data['fiscal_year_id'], $data['name'], $budget->id);
        $this->validateEntries($budget->organization_id, (int) $data['fiscal_year_id'], $data['entries'] ?? []);

        return DB::transaction(function () use ($budget, $data) {
            $budget->update([
                'fiscal_year_id' => $data['fiscal_year_id'],
                'name' => $data['name'],
            ]);
            $this->replaceEntries($budget, $data['entries'] ?? []);

            return $budget->fresh('entries');
        });
    }

    public function activate(Budget $budget): Budget
    {
        $this->ensureDraft($budget);
        if (!$budget->entries()->exists()) {
            throw new RuntimeException('A budget must have at least one entry before activation.');
        }
        if (
            Budget::query()
                ->where('organization_id', $budget->organization_id)
                ->where('fiscal_year_id', $budget->fiscal_year_id)
                ->where('status', 'ACTIVE')
                ->exists()
        ) {
            throw new RuntimeException('An active budget already exists for this fiscal year.');
        }

        $budget->update(['status' => 'ACTIVE']);

        return $budget->fresh();
    }

    public function close(Budget $budget): Budget
    {
        if ($budget->status !== 'ACTIVE') {
            throw new RuntimeException('Only active budgets can be closed.');
        }

        $budget->update(['status' => 'CLOSED']);

        return $budget->fresh();
    }

    public function delete(Budget $budget): bool
    {
        $this->ensureDraft($budget);

        return (bool) $budget->delete();
    }

    private function replaceEntries(Budget $budget, array $entries): void
    {
        $budget->entries()->delete();
        $budget->entries()->createMany(array_map(fn(array $entry) => [
            'organization_id' => $budget->organization_id,
            'account_id' => $entry['account_id'],
            'cost_center_id' => $entry['cost_center_id'] ?: null,
            'fiscal_period_id' => $entry['fiscal_period_id'] ?: null,
            'amount' => $entry['amount'],
        ], $entries));
    }

    private function validateHeader(int $organizationId, int $fiscalYearId, string $name, ?int $excludedBudgetId = null): void
    {
        if (!FiscalYear::query()->where('organization_id', $organizationId)->whereKey($fiscalYearId)->exists()) {
            throw new InvalidArgumentException('The selected fiscal year is invalid.');
        }

        $duplicate = Budget::query()
            ->where('organization_id', $organizationId)
            ->where('fiscal_year_id', $fiscalYearId)
            ->where('name', $name)
            ->when($excludedBudgetId, fn($query) => $query->where('id', '!=', $excludedBudgetId))
            ->exists();

        if ($duplicate) {
            throw new RuntimeException('A budget with this name already exists for the fiscal year.');
        }
    }

    private function validateEntries(int $organizationId, int $fiscalYearId, array $entries): void
    {
        $keys = [];
        foreach ($entries as $entry) {
            $account = LedgerAccount::query()
                ->where('organization_id', $organizationId)
                ->where('status', true)
                ->find($entry['account_id'] ?? null);
            if (!$account) {
                throw new InvalidArgumentException('Every budget entry must reference an active account in the organization.');
            }
            if ((float) ($entry['amount'] ?? 0) < 0) {
                throw new InvalidArgumentException('Budget amounts cannot be negative.');
            }

            if (!empty($entry['cost_center_id']) && !CostCenter::query()->where('organization_id', $organizationId)->whereKey($entry['cost_center_id'])->exists()) {
                throw new InvalidArgumentException('The selected cost center is invalid.');
            }
            if (!empty($entry['fiscal_period_id']) && !FiscalPeriod::query()->whereKey($entry['fiscal_period_id'])->whereHas('fiscalYear', fn($query) => $query->where('organization_id', $organizationId)->whereKey($fiscalYearId))->exists()) {
                throw new InvalidArgumentException('The selected fiscal period is invalid.');
            }

            $key = implode(':', [$entry['account_id'], $entry['cost_center_id'] ?? '', $entry['fiscal_period_id'] ?? '']);
            if (isset($keys[$key])) {
                throw new RuntimeException('Duplicate account, cost center, and fiscal period entries are not allowed.');
            }
            $keys[$key] = true;
        }
    }

    private function ensureDraft(Budget $budget): void
    {
        if ($budget->status !== 'DRAFT') {
            throw new RuntimeException('Only draft budgets can be changed.');
        }
    }
}
