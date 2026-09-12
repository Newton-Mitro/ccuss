<?php

namespace App\SystemAdministration\Application\Contracts;

use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Builder;

interface UserRepositoryInterface
{
    public function query(): Builder;

    public function existsByEmail(string $email, ?int $excludeId = null): bool;

    public function create(array $data): User;

    public function update(User $user, array $data): User;

    public function delete(User $user): bool;
}
