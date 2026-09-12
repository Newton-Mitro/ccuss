<?php

namespace App\SystemAdministration\Infrastructure\Persistence;

use App\SystemAdministration\Application\Contracts\UserRepositoryInterface;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Builder;

class EloquentUserRepository implements UserRepositoryInterface
{
    public function query(): Builder
    {
        return User::query();
    }

    public function existsByEmail(string $email, ?int $excludeId = null): bool
    {
        $query = User::query()->whereRaw('LOWER(email) = ?', [strtolower(trim($email))]);

        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    public function create(array $data): User
    {
        return User::create($data);
    }

    public function update(User $user, array $data): User
    {
        $user->update($data);

        return $user->fresh();
    }

    public function delete(User $user): bool
    {
        return (bool) $user->delete();
    }
}
