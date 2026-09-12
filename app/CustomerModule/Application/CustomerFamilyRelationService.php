<?php

namespace App\CustomerModule\Application;

use App\CustomerModule\Application\Contracts\CustomerFamilyRelationRepositoryInterface;
use App\CustomerModule\Models\CustomerFamilyRelation;
use InvalidArgumentException;

class CustomerFamilyRelationService
{
    public function __construct(
        private readonly CustomerFamilyRelationRepositoryInterface $customerFamilyRelationRepository,
    ) {
    }

    public function createRelation(array $data): CustomerFamilyRelation
    {
        $customerId = (int) $data['customer_id'];
        $relativeId = (int) $data['relative_id'];

        if ($this->customerFamilyRelationRepository->existsDuplicate($customerId, $relativeId)) {
            throw new InvalidArgumentException('This family relation already exists.');
        }

        if ($this->customerFamilyRelationRepository->existsDuplicate($relativeId, $customerId)) {
            throw new InvalidArgumentException('This family relation already exists.');
        }

        return $this->customerFamilyRelationRepository->create($data);
    }

    public function updateRelation(CustomerFamilyRelation $relation, array $data): CustomerFamilyRelation
    {
        if (isset($data['customer_id'], $data['relative_id'])) {
            $customerId = (int) $data['customer_id'];
            $relativeId = (int) $data['relative_id'];

            if ($this->customerFamilyRelationRepository->existsDuplicate($customerId, $relativeId, $relation->id)) {
                throw new InvalidArgumentException('This family relation already exists.');
            }

            if ($this->customerFamilyRelationRepository->existsDuplicate($relativeId, $customerId, $relation->id)) {
                throw new InvalidArgumentException('This family relation already exists.');
            }
        }

        return $this->customerFamilyRelationRepository->update($relation, $data);
    }

    public function deleteRelation(CustomerFamilyRelation $relation): bool
    {
        return $this->customerFamilyRelationRepository->delete($relation);
    }
}
