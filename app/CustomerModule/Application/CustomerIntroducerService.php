<?php

namespace App\CustomerModule\Application;

use App\CustomerModule\Application\Contracts\CustomerIntroducerRepositoryInterface;
use App\CustomerModule\Models\CustomerIntroducer;
use InvalidArgumentException;

class CustomerIntroducerService
{
    public function __construct(
        private readonly CustomerIntroducerRepositoryInterface $customerIntroducerRepository,
    ) {
    }

    public function createIntroducer(array $data): CustomerIntroducer
    {
        $introducedCustomerId = (int) ($data['introduced_customer_id'] ?? 0);
        $introducerCustomerId = (int) ($data['introducer_customer_id'] ?? 0);

        if ($introducedCustomerId <= 0 || $introducerCustomerId <= 0) {
            throw new InvalidArgumentException('A valid introduced customer and introducer customer are required.');
        }

        if ($this->customerIntroducerRepository->existsDuplicate($introducedCustomerId, $introducerCustomerId)) {
            throw new InvalidArgumentException('This introducer already exists for the customer.');
        }

        if ($this->customerIntroducerRepository->existsDuplicate($introducerCustomerId, $introducedCustomerId)) {
            throw new InvalidArgumentException('This introducer already exists for the customer.');
        }

        $data['verification_status'] = $data['verification_status'] ?? CustomerIntroducer::STATUS_PENDING;
        $data['created_by'] = $data['created_by'] ?? auth()->id();

        return $this->customerIntroducerRepository->create($data);
    }

    public function updateIntroducer(CustomerIntroducer $introducer, array $data): CustomerIntroducer
    {
        if (isset($data['introduced_customer_id'], $data['introducer_customer_id'])) {
            $introducedCustomerId = (int) $data['introduced_customer_id'];
            $introducerCustomerId = (int) $data['introducer_customer_id'];

            if ($this->customerIntroducerRepository->existsDuplicate($introducedCustomerId, $introducerCustomerId, $introducer->id)) {
                throw new InvalidArgumentException('This introducer already exists for the customer.');
            }

            if ($this->customerIntroducerRepository->existsDuplicate($introducerCustomerId, $introducedCustomerId, $introducer->id)) {
                throw new InvalidArgumentException('This introducer already exists for the customer.');
            }
        }

        $data['updated_by'] = $data['updated_by'] ?? auth()->id();

        return $this->customerIntroducerRepository->update($introducer, $data);
    }

    public function deleteIntroducer(CustomerIntroducer $introducer): bool
    {
        return $this->customerIntroducerRepository->delete($introducer);
    }
}
