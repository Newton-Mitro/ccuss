<?php

namespace App\FinancialServices\Application;

use App\FinancialServices\Models\FinancialProduct;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class FinancialProductService
{
    public function create(array $data, int $organizationId): FinancialProduct
    {
        $baseInterestRate = $data['base_interest_rate'] ?? 0;
        unset($data['base_interest_rate']);
        $data['organization_id'] = $organizationId;

        return DB::transaction(function () use ($data, $baseInterestRate): FinancialProduct {
            $product = FinancialProduct::create($data);
            $this->saveBaseTerm($product, (float) $baseInterestRate);

            return $product;
        });
    }

    public function update(FinancialProduct $product, array $data): FinancialProduct
    {
        if ($product->is_system) {
            throw new RuntimeException('System financial products cannot be edited.');
        }

        $baseInterestRate = $data['base_interest_rate'] ?? $product->baseTerm?->interest_rate ?? 0;
        unset($data['base_interest_rate']);

        return DB::transaction(function () use ($product, $data, $baseInterestRate): FinancialProduct {
            $product->update($data);
            $this->saveBaseTerm($product, (float) $baseInterestRate);

            return $product->refresh();
        });
    }

    public function delete(FinancialProduct $product): void
    {
        if ($product->is_system) {
            throw new RuntimeException('System financial products cannot be deleted.');
        }

        if ($product->financialAccounts()->exists()) {
            throw new RuntimeException('Financial products with accounts cannot be deleted.');
        }

        $product->delete();
    }

    public function queryForOrganization(int $organizationId): Builder
    {
        return FinancialProduct::query()->where('organization_id', $organizationId);
    }

    private function saveBaseTerm(FinancialProduct $product, float $rate): void
    {
        $term = $product->terms()->firstOrNew(['code' => 'BASE']);
        $term->fill([
            'name' => $term->name ?: 'Base term',
            'tenure_value' => $term->tenure_value ?: 1,
            'tenure_unit' => $term->tenure_unit ?: 'MONTH',
            'interest_rate' => $rate,
            'interest_calculation' => $product->interest_calculation,
            'interest_frequency' => $product->interest_frequency,
            'status' => true,
        ])->save();
    }
}