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
        $terms = $data['terms'] ?? null;
        unset($data['base_interest_rate']);
        unset($data['terms']);
        $data['organization_id'] = $organizationId;

        return DB::transaction(function () use ($data, $baseInterestRate, $terms): FinancialProduct {
            $product = FinancialProduct::create($data);
            $this->saveBaseTerm($product, (float) $baseInterestRate);
            if ($terms !== null) {
                $this->saveTerms($product, $terms);
            }

            return $product->load('terms');
        });
    }

    public function update(FinancialProduct $product, array $data): FinancialProduct
    {
        $baseInterestRate = $data['base_interest_rate'] ?? $product->baseTerm?->interest_rate ?? 0;
        $terms = $data['terms'] ?? null;
        unset($data['base_interest_rate']);
        unset($data['terms']);

        return DB::transaction(function () use ($product, $data, $baseInterestRate, $terms): FinancialProduct {
            $product->update($data);
            $this->saveBaseTerm($product, (float) $baseInterestRate);
            if ($terms !== null) {
                $this->saveTerms($product, $terms);
            }

            return $product->refresh()->load('terms');
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

    private function saveTerms(FinancialProduct $product, array $terms): void
    {
        $codes = [];

        foreach ($terms as $attributes) {
            $code = strtoupper($attributes['code']);
            $codes[] = $code;
            $term = isset($attributes['id'])
                ? $product->terms()->whereKey($attributes['id'])->firstOrFail()
                : $product->terms()->firstOrNew(['code' => $code]);
            unset($attributes['id']);
            $term->fill([
                ...$attributes,
                'code' => $code,
                'financial_product_id' => $product->id,
            ])->save();
        }

        $product->terms()->whereNotIn('code', $codes)->update(['status' => false]);
    }
}
