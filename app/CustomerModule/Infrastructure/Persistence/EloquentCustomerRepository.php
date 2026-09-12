<?php

namespace App\CustomerModule\Infrastructure\Persistence;

use App\CustomerModule\Application\Contracts\CustomerRepositoryInterface;
use App\CustomerModule\Models\Customer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentCustomerRepository implements CustomerRepositoryInterface
{
    public function query(): Builder
    {
        return Customer::query();
    }

    public function search(string|null $search, string|null $status = null): Collection
    {
        if (empty($search)) {
            return new Collection();
        }

        $query = Customer::with(['photo', 'kycProfile'])
            ->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('customer_no', 'like', "%{$search}%")
                    ->orWhere('primary_email', 'like', "%{$search}%")
                    ->orWhere('primary_phone', 'like', "%{$search}%");
            });

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        return $query->latest()->limit(18)->get();
    }

    public function paginate(string|null $search, string|null $status = null, int $perPage = 18): LengthAwarePaginator
    {
        $query = Customer::with(['photo', 'kycProfile']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('customer_no', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        return $query->latest()->paginate($perPage)->withQueryString();
    }

    public function create(array $data): Customer
    {
        return Customer::create($data);
    }

    public function update(Customer $customer, array $data): Customer
    {
        $customer->update($data);

        return $customer->fresh();
    }

    public function delete(Customer $customer): bool
    {
        return (bool) $customer->delete();
    }

    public function existsDuplicate(array $data, ?int $excludeId = null): bool
    {
        $query = Customer::query()->where(function ($q) use ($data) {
            $q->where('identification_number', $data['identification_number']);

            if (!empty($data['primary_email'])) {
                $q->orWhere('primary_email', $data['primary_email']);
            }

            if (!empty($data['primary_phone'])) {
                $q->orWhere('primary_phone', $data['primary_phone']);
            }
        });

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }
}
