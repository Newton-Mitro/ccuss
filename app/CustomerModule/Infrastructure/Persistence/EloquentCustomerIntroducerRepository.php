<?php

namespace App\CustomerModule\Infrastructure\Persistence;

use App\CustomerModule\Application\Contracts\CustomerIntroducerRepositoryInterface;
use App\CustomerModule\Models\CustomerIntroducer;
use Illuminate\Database\Eloquent\Builder;

class EloquentCustomerIntroducerRepository implements CustomerIntroducerRepositoryInterface
{
    public function query(): Builder
    {
        return CustomerIntroducer::query();
    }

    public function existsDuplicate(int $introducedCustomerId, int $introducerCustomerId, ?int $excludeId = null): bool
    {
        $query = CustomerIntroducer::query()
            ->where('introduced_customer_id', $introducedCustomerId)
            ->where('introducer_customer_id', $introducerCustomerId);

        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    public function create(array $data): CustomerIntroducer
    {
        return CustomerIntroducer::create($data);
    }

    public function update(CustomerIntroducer $introducer, array $data): CustomerIntroducer
    {
        $introducer->update($data);

        return $introducer->fresh();
    }

    public function delete(CustomerIntroducer $introducer): bool
    {
        return (bool) $introducer->delete();
    }
}
