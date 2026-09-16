<?php

namespace App\SystemAdministration\Application;

use App\SystemAdministration\Application\Contracts\OrganizationRepositoryInterface;
use App\SystemAdministration\Models\Organization;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class OrganizationService
{
    public function __construct(
        private readonly OrganizationRepositoryInterface $organizationRepository,
    ) {
    }

    public function createOrganization(array $data, ?UploadedFile $logo = null): Organization
    {
        $code = trim((string) ($data['code'] ?? ''));
        $code = $code !== '' ? $code : $this->generateOrganizationCode();
        $data['code'] = $code;

        if ($this->organizationRepository->existsByCode($code)) {
            throw new \RuntimeException('Organization code already exists.');
        }

        if ($logo) {
            $data['logo_path'] = $logo->store('uploads/organizations', 'public');
        }

        return $this->organizationRepository->create($data);
    }

    private function generateOrganizationCode(): string
    {
        $nextNumber = ((int) Organization::withTrashed()->max('id')) + 1;

        do {
            $code = 'ORG-' . str_pad((string) $nextNumber, 3, '0', STR_PAD_LEFT);
            $nextNumber++;
        } while ($this->organizationRepository->existsByCode($code));

        return $code;
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
