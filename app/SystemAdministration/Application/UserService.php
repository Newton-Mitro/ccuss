<?php

namespace App\SystemAdministration\Application;

use App\SystemAdministration\Application\Contracts\UserRepositoryInterface;
use App\SystemAdministration\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;

class UserService
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
    ) {
    }

    public function createUser(array $data, ?UploadedFile $photo = null): User
    {
        $email = trim((string) ($data['email'] ?? ''));

        if ($email === '') {
            throw new InvalidArgumentException('User email is required.');
        }

        if ($this->userRepository->existsByEmail($email)) {
            throw new \RuntimeException('User email already exists.');
        }

        unset($data['branch_id']);

        $organizationIds = array_values(array_unique(array_filter(array_map(
            'intval',
            (array) ($data['organization_ids'] ?? [])
        ))));

        if (empty($organizationIds) && !empty($data['organization_id'])) {
            $organizationIds = [(int) $data['organization_id']];
        }

        if (!empty($organizationIds)) {
            $data['organization_id'] = (int) ($data['organization_id'] ?? $organizationIds[0]);
            if (!in_array((int) $data['organization_id'], $organizationIds, true)) {
                $data['organization_id'] = $organizationIds[0];
            }
        }

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        if ($photo) {
            $data['photo_path'] = $photo->store('uploads/users', 'public');
        }

        $user = $this->userRepository->create($data);

        if (!empty($organizationIds)) {
            $user->organizations()->sync($organizationIds);
        }

        if (!empty($data['roles']) && is_array($data['roles'])) {
            $user->roles()->sync($data['roles']);
        }

        return $user;
    }

    public function updateUser(User $user, array $data, ?UploadedFile $photo = null): User
    {
        $email = trim((string) ($data['email'] ?? $user->email));

        if ($this->userRepository->existsByEmail($email, $user->id)) {
            throw new \RuntimeException('User email already exists.');
        }

        unset($data['branch_id']);

        $organizationIds = array_values(array_unique(array_filter(array_map(
            'intval',
            (array) ($data['organization_ids'] ?? [])
        ))));

        if (empty($organizationIds) && !empty($data['organization_id'])) {
            $organizationIds = [(int) $data['organization_id']];
        }

        if (!empty($organizationIds)) {
            $data['organization_id'] = (int) ($data['organization_id'] ?? $user->organization_id ?? $organizationIds[0]);
            if (!in_array((int) $data['organization_id'], $organizationIds, true)) {
                $data['organization_id'] = $organizationIds[0];
            }
        }

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        if ($photo) {
            if ($user->photo_path) {
                Storage::disk('public')->delete($user->photo_path);
            }

            $data['photo_path'] = $photo->store('uploads/users', 'public');
        }

        unset($data['organization_ids']);

        $updated = $this->userRepository->update($user, $data);

        if (!empty($organizationIds)) {
            $updated->organizations()->sync($organizationIds);
            $updated->forceFill(['organization_id' => $data['organization_id']])->save();
        }

        if (isset($data['roles']) && is_array($data['roles'])) {
            $updated->roles()->sync($data['roles']);
        }

        return $updated;
    }

    public function deleteUser(User $user): bool
    {
        if ($user->photo_path) {
            Storage::disk('public')->delete($user->photo_path);
        }

        return $this->userRepository->delete($user);
    }
}
