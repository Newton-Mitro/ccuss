<?php

namespace App\CustomerModule\Infrastructure\Persistence;

use App\CustomerModule\Application\Contracts\CustomerAddressRepositoryInterface;
use App\CustomerModule\Models\CustomerAddress;
use Illuminate\Database\Eloquent\Builder;

class EloquentCustomerAddressRepository implements CustomerAddressRepositoryInterface
{
    public function query(): Builder
    {
        return CustomerAddress::query();
    }

    public function existsForCustomerAndType(int $customerId, string $type, ?int $excludeId = null): bool
    {
        $query = CustomerAddress::query()
            ->where('customer_id', $customerId)
            ->where('type', strtoupper($type));

        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    public function create(array $data): CustomerAddress
    {
        return CustomerAddress::create($data);
    }

    public function update(CustomerAddress $address, array $data): CustomerAddress
    {
        $address->update($data);

        return $address->fresh();
    }

    public function delete(CustomerAddress $address): bool
    {
        return (bool) $address->delete();
    }
}
