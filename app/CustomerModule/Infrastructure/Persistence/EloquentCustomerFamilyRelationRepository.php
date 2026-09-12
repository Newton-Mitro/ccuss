<?php

namespace App\CustomerModule\Infrastructure\Persistence;

use App\CustomerModule\Application\Contracts\CustomerFamilyRelationRepositoryInterface;
use App\CustomerModule\Models\CustomerFamilyRelation;
use Illuminate\Database\Eloquent\Builder;

class EloquentCustomerFamilyRelationRepository implements CustomerFamilyRelationRepositoryInterface
{
    public function query(): Builder
    {
        return CustomerFamilyRelation::query();
    }

    public function existsDuplicate(int $customerId, int $relativeId, ?int $excludeId = null): bool
    {
        $query = CustomerFamilyRelation::query()
            ->where('customer_id', $customerId)
            ->where('relative_id', $relativeId);

        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    public function create(array $data): CustomerFamilyRelation
    {
        return CustomerFamilyRelation::create($data);
    }

    public function update(CustomerFamilyRelation $relation, array $data): CustomerFamilyRelation
    {
        $relation->update($data);

        return $relation->fresh();
    }

    public function delete(CustomerFamilyRelation $relation): bool
    {
        return (bool) $relation->delete();
    }
}
