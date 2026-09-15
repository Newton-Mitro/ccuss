<?php

namespace App\CustomerModule\Application;

use App\CustomerModule\Application\Contracts\CustomerRepositoryInterface;
use App\CustomerModule\Models\Customer;
use App\CustomerModule\Models\KycDocument;
use App\CustomerModule\Models\KycProfile;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CustomerService
{
    public function __construct(
        private readonly CustomerRepositoryInterface $customerRepository,
    ) {
    }

    public function searchCustomers(?string $search, ?string $status = null): Collection
    {
        return $this->customerRepository->search($search, $status);
    }

    public function listCustomers(?string $search, ?string $status = null, int $perPage = 18): LengthAwarePaginator
    {
        return $this->customerRepository->paginate($search, $status, $perPage);
    }

    public function createCustomer(array $data, ?UploadedFile $photo = null): Customer
    {
        if (empty($data['primary_phone']) && empty($data['primary_email'])) {
            throw new \InvalidArgumentException('Primary phone or email is required.');
        }

        if ($this->customerRepository->existsDuplicate($data)) {
            throw new \RuntimeException('Duplicate customer detected. (ID, Email, Phone) already exists.');
        }

        $customer = null;

        DB::transaction(function () use ($data, $photo, &$customer) {
            $typePrefix = strtoupper($data['type']) === Customer::TYPE_INDIVIDUAL ? 'IND' : 'ORG';
            $lastId = Customer::lockForUpdate()->max('id') ?? 0;
            $nextNumber = str_pad($lastId + 1, 5, '0', STR_PAD_LEFT);
            $data['customer_no'] = "{$typePrefix}-{$nextNumber}";

            $customer = $this->customerRepository->create($data);
            KycProfile::create([
                'customer_id' => $customer->id,
                'kyc_level' => KycProfile::LEVEL_BASIC,
            ]);

            if ($photo) {
                $path = $photo->store('uploads/customers/' . $customer->id, 'public');

                $customer->kycDocuments()->create([
                    'document_type' => KycDocument::PHOTO,
                    'file_name' => $photo->getClientOriginalName(),
                    'file_path' => $path,
                    'mime' => $photo->getClientMimeType(),
                    'url' => asset('storage/' . $path),
                    'verification_status' => KycDocument::STATUS_PENDING,
                ]);
            }
        });

        return $customer;
    }

    public function updateCustomer(Customer $customer, array $data, ?UploadedFile $photo = null): Customer
    {
        if (empty($data['primary_phone']) && empty($data['primary_email'])) {
            throw new \InvalidArgumentException('Primary phone or email is required.');
        }

        if ($this->customerRepository->existsDuplicate($data, $customer->id)) {
            throw new \RuntimeException('Duplicate customer detected.');
        }

        DB::transaction(function () use ($customer, $data, $photo) {
            if (
                ($data['type'] ?? $customer->type) !== $customer->type ||
                ($data['identification_type'] ?? $customer->identification_type) !== $customer->identification_type
            ) {
                $prefix = strtoupper($data['type'] ?? $customer->type) === Customer::TYPE_INDIVIDUAL ? 'IND' : 'ORG';
                $data['customer_no'] = "{$prefix}-" . str_pad($customer->id, 5, '0', STR_PAD_LEFT);
            }

            $this->customerRepository->update($customer, $data);

            if ($photo) {
                $oldPhoto = $customer->photo;

                if ($oldPhoto) {
                    if (Storage::disk('public')->exists($oldPhoto->file_path)) {
                        Storage::disk('public')->delete($oldPhoto->file_path);
                    }

                    $oldPhoto->delete();
                }

                $path = $photo->store('uploads/customers/' . $customer->id, 'public');

                $customer->kycDocuments()->create([
                    'document_type' => KycDocument::PHOTO,
                    'file_name' => $photo->getClientOriginalName(),
                    'file_path' => $path,
                    'mime' => $photo->getClientMimeType(),
                    'url' => asset('storage/' . $path),
                    'verification_status' => KycDocument::STATUS_PENDING,
                ]);
            }
        });

        return $customer->fresh();
    }

    public function deleteCustomer(Customer $customer): bool
    {
        return $this->customerRepository->delete($customer);
    }
}
