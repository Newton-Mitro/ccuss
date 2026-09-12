<?php

namespace App\CustomerModule\Application;

use App\CustomerModule\Application\Contracts\KycDocumentRepositoryInterface;
use App\CustomerModule\Models\KycDocument;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;

class KycDocumentService
{
    public function __construct(
        private readonly KycDocumentRepositoryInterface $kycDocumentRepository,
    ) {
    }

    public function createDocument(UploadedFile $file, array $data): KycDocument
    {
        if (empty($data['customer_id'])) {
            throw new InvalidArgumentException('A valid customer is required.');
        }

        $path = $file->store('uploads/customers/' . $data['customer_id'], 'public');

        return $this->kycDocumentRepository->create([
            'customer_id' => $data['customer_id'],
            'document_type' => $data['document_type'],
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'mime' => $file->getClientMimeType(),
            'alt_text' => $data['alt_text'] ?? null,
        ]);
    }

    public function deleteDocument(KycDocument $document): bool
    {
        if ($document->file_path) {
            Storage::disk('public')->delete($document->file_path);
        }

        return $this->kycDocumentRepository->delete($document);
    }
}
