<?php

namespace App\CustomerModule\Application\Contracts;

use App\CustomerModule\Models\CustomerFamilyRelation;
use Illuminate\Database\Eloquent\Builder;

interface CustomerFamilyRelationRepositoryInterface
{
    public function query(): Builder;

    public function existsDuplicate(int $customerId, int $relativeId, ?int $excludeId = null): bool;

    public function create(array $data): CustomerFamilyRelation;

    public function update(CustomerFamilyRelation $relation, array $data): CustomerFamilyRelation;

    public function delete(CustomerFamilyRelation $relation): bool;
}
