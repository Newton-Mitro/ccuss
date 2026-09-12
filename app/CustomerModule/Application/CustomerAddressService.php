<?php

namespace App\CustomerModule\Application;

use App\CustomerModule\Application\Contracts\CustomerAddressRepositoryInterface;
use App\CustomerModule\Models\CustomerAddress;
use InvalidArgumentException;

class CustomerAddressService
{
    public function __construct(
        private readonly CustomerAddressRepositoryInterface $customerAddressRepository,
    ) {
    }

    public function createAddress(array $data): CustomerAddress
    {
        if ($this->customerAddressRepository->existsForCustomerAndType((int) $data['customer_id'], $data['type'])) {
            throw new InvalidArgumentException('This customer already has an address of this type.');
        }

        return $this->customerAddressRepository->create($data);
    }

    public function updateAddress(CustomerAddress $address, array $data): CustomerAddress
    {
        if ($this->customerAddressRepository->existsForCustomerAndType((int) $data['customer_id'], $data['type'], $address->id)) {
            throw new InvalidArgumentException('This customer already has an address of this type.');
        }

        return $this->customerAddressRepository->update($address, $data);
    }

    public function deleteAddress(CustomerAddress $address): bool
    {
        return $this->customerAddressRepository->delete($address);
    }
}
