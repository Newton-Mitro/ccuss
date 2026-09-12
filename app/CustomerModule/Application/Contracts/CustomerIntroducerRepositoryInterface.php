<?php

namespace App\CustomerModule\Application\Contracts;

use App\CustomerModule\Models\CustomerIntroducer;
use Illuminate\Database\Eloquent\Builder;

interface CustomerIntroducerRepositoryInterface
{
    public function query(): Builder;

    public function existsDuplicate(int $introducedCustomerId, int $introducerCustomerId, ?int $excludeId = null): bool;

    public function create(array $data): CustomerIntroducer;

    public function update(CustomerIntroducer $introducer, array $data): CustomerIntroducer;

    public function delete(CustomerIntroducer $introducer): bool;
}
