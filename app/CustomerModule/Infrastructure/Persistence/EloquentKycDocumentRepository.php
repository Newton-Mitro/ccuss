<?php

namespace App\CustomerModule\Infrastructure\Persistence;

use App\CustomerModule\Application\Contracts\KycDocumentRepositoryInterface;
use App\CustomerModule\Models\KycDocument;
use Illuminate\Database\Eloquent\Builder;

class EloquentKycDocumentRepository implements KycDocumentRepositoryInterface
{
    public function query(): Builder
    {
        return KycDocument::query();
    }

    public function create(array $data): KycDocument
    {
        return KycDocument::create($data);
    }

    public function update(KycDocument $document, array $data): KycDocument
    {
        $document->update($data);

        return $document->fresh();
    }

    public function delete(KycDocument $document): bool
    {
        return (bool) $document->delete();
    }
}
