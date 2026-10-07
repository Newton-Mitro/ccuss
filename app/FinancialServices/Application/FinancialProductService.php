<?php

namespace App\FinancialServices\Application;

use App\FinancialServices\Models\DepositProduct;
use App\FinancialServices\Models\LoanProduct;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class FinancialProductService
{
    public function create(array $data, int $organizationId, string $family = 'deposit'): Model
    {
        $baseInterestRate = $data['base_interest_rate'] ?? 0;
        $terms = $data['terms'] ?? null;
        unset($data['base_interest_rate']);
        unset($data['terms']);
        $data['organization_id'] = $organizationId;

        return DB::transaction(function () use ($data, $baseInterestRate, $terms, $family): Model {
            if ($family === 'loan') {
                unset($data['category']);
                $data['interest_rate'] = $baseInterestRate;

                return LoanProduct::create($data);
            }

            unset($data['interest_rate']);
            $product = DepositProduct::create($data);
            $this->saveBaseTerm($product, (float) $baseInterestRate);
            if ($terms !== null) {
                $this->saveTerms($product, $terms);
            }

            return $product->load('terms');
        });
    }

    public function update(Model $product, array $data): Model
    {
        $baseInterestRate = $data['base_interest_rate']
            ?? ($product instanceof LoanProduct ? $product->interest_rate : $product->baseTerm?->interest_rate)
            ?? 0;
        $terms = $data['terms'] ?? null;
        unset($data['base_interest_rate']);
        unset($data['terms']);

        return DB::transaction(function () use ($product, $data, $baseInterestRate, $terms): Model {
            if ($product instanceof LoanProduct) {
                $data['interest_rate'] = $baseInterestRate;
                $product->update($data);

                return $product->refresh();
            }

            unset($data['interest_rate']);
            $product->update($data);
            $this->saveBaseTerm($product, (float) $baseInterestRate);
            if ($terms !== null) {
                $this->saveTerms($product, $terms);
            }

            return $product->refresh()->load('terms');
        });
    }

    public function delete(Model $product): void
    {
        if ($product->is_system) {
            throw new RuntimeException('System financial products cannot be deleted.');
        }

        if ($product->financialAccounts()->exists()) {
            throw new RuntimeException('Financial products with accounts cannot be deleted.');
        }

        $product->delete();
    }

    public function queryForOrganization(int $organizationId, string $family): Builder
    {
        $model = $family === 'loan' ? LoanProduct::class : DepositProduct::class;

        return $model::query()->where('organization_id', $organizationId);
    }

    private function saveBaseTerm(DepositProduct $product, float $rate): void
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

    private function saveTerms(DepositProduct $product, array $terms): void
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
                'deposit_product_id' => $product->id,
            ])->save();
        }

        $product->terms()->whereNotIn('code', $codes)->update(['status' => false]);
    }
}
