<?php

namespace App\CustomerModule\Application\Contracts;

use App\CustomerModule\Models\KycDocument;
use Illuminate\Database\Eloquent\Builder;

interface KycDocumentRepositoryInterface
{
    public function query(): Builder;

    public function create(array $data): KycDocument;

    public function update(KycDocument $document, array $data): KycDocument;

    public function delete(KycDocument $document): bool;
}
