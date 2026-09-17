<?php

namespace App\FinancialServices\Application;

use App\FinancialServices\Models\FinancialProduct;
use Illuminate\Database\Eloquent\Builder;
use RuntimeException;

class FinancialProductService
{
    public function create(array $data, int $organizationId): FinancialProduct
    {
        $data['organization_id'] = $organizationId;

        return FinancialProduct::create($data);
    }

    public function update(FinancialProduct $product, array $data): FinancialProduct
    {
        if ($product->is_system) {
            throw new RuntimeException('System financial products cannot be edited.');
        }

        $product->update($data);

        return $product->refresh();
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
}