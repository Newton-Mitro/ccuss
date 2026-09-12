<?php

namespace App\CustomerModule\Application\Contracts;

use App\CustomerModule\Models\Customer;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

interface CustomerRepositoryInterface
{
    public function query(): Builder;

    public function search(string|null $search, string|null $status = null): Collection;

    public function paginate(string|null $search, string|null $status = null, int $perPage = 18): LengthAwarePaginator;

    public function create(array $data): Customer;

    public function update(Customer $customer, array $data): Customer;

    public function delete(Customer $customer): bool;

    public function existsDuplicate(array $data, ?int $excludeId = null): bool;
}
