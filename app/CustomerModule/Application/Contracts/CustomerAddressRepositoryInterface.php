<?php

namespace App\CustomerModule\Application\Contracts;

use App\CustomerModule\Models\CustomerAddress;
use Illuminate\Database\Eloquent\Builder;

interface CustomerAddressRepositoryInterface
{
    public function query(): Builder;

    public function existsForCustomerAndType(int $customerId, string $type, ?int $excludeId = null): bool;

    public function create(array $data): CustomerAddress;

    public function update(CustomerAddress $address, array $data): CustomerAddress;

    public function delete(CustomerAddress $address): bool;
}
