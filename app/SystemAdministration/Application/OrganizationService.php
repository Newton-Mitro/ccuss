<?php

namespace App\SystemAdministration\Application;

use App\SystemAdministration\Application\Contracts\OrganizationRepositoryInterface;
use App\SystemAdministration\Models\Organization;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;

class OrganizationService
{
    public function __construct(
        private readonly OrganizationRepositoryInterface $organizationRepository,
    ) {
    }

    public function createOrganization(array $data, ?UploadedFile $logo = null): Organization
    {
        $code = trim((string) ($data['code'] ?? ''));

        if ($code === '') {
            throw new InvalidArgumentException('Organization code is required.');
        }

        if ($this->organizationRepository->existsByCode($code)) {
            throw new \RuntimeException('Organization code already exists.');
        }

        if ($logo) {
            $data['logo_path'] = $logo->store('uploads/organizations', 'public');
        }

        return $this->organizationRepository->create($data);
    }

    public function updateOrganization(Organization $organization, array $data, ?UploadedFile $logo = null): Organization
    {
        $code = trim((string) ($data['code'] ?? $organization->code));

        if ($this->organizationRepository->existsByCode($code, $organization->id)) {
            throw new \RuntimeException('Organization code already exists.');
        }

        if ($logo) {
            if ($organization->logo_path) {
                Storage::disk('public')->delete($organization->logo_path);
            }

            $data['logo_path'] = $logo->store('uploads/organizations', 'public');
        }

        return $this->organizationRepository->update($organization, $data);
    }

    public function deleteOrganization(Organization $organization): bool
    {
        if ($organization->logo_path) {
            Storage::disk('public')->delete($organization->logo_path);
        }

        return $this->organizationRepository->delete($organization);
    }
}
