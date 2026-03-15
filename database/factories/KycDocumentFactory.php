<?php

namespace Database\Factories;

use App\CustomerModule\Models\KycDocument;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class KycDocumentFactory extends Factory
{
    protected $model = KycDocument::class;

    public function definition(): array
    {
        $documentTypes = [
            'NID_FRONT',
            'NID_BACK',
            'SMART_NID',
            'PASSPORT',
            'DRIVING_LICENSE',
            'BIRTH_CERTIFICATE',
            'UTILITY_BILL',
            'ELECTRICITY_BILL',
            'WATER_BILL',
            'GAS_BILL',
            'BANK_STATEMENT',
            'RENTAL_AGREEMENT',
            'TIN_CERTIFICATE',
            'TAX_RETURN',
            'SALARY_SLIP',
            'INCOME_CERTIFICATE',
            'TRADE_LICENSE',
            'CERTIFICATE_OF_INCORPORATION',
            'MEMORANDUM_OF_ASSOCIATION',
            'ARTICLES_OF_ASSOCIATION',
            'PARTNERSHIP_DEED',
            'PHOTO',
            'SIGNATURE',
            'LIVE_SELFIE',
            'PEP_DECLARATION',
            'FATCA_FORM'
        ];

        $docType = $this->faker->randomElement($documentTypes);
        $fileName = strtolower($docType) . '_' . Str::random(6) . '.jpg';
        $filePath = 'kyc/' . $fileName;

        $verificationStatuses = ['PENDING', 'VERIFIED', 'REJECTED'];

        return [
            'document_type' => $docType,
            'file_name' => $fileName,
            'file_path' => $filePath,
            'mime' => 'image/jpeg',
            'alt_text' => ucfirst(str_replace('_', ' ', $docType)),
            'verification_status' => $this->faker->randomElement($verificationStatuses),
            'verified_by' => null,
            'verified_at' => null,
            'remarks' => $this->faker->optional()->sentence(),
        ];
    }

    /** Mark document as verified */
    public function verified(): self
    {
        return $this->state(fn(array $attributes) => [
            'verification_status' => 'VERIFIED',
            'verified_at' => now(),
        ]);
    }

    /** Mark document as rejected */
    public function rejected(): self
    {
        return $this->state(fn(array $attributes) => [
            'verification_status' => 'REJECTED',
            'verified_at' => now(),
        ]);
    }

    /** For specific document type, e.g., PHOTO or SIGNATURE */
    public function type(string $type): self
    {
        return $this->state(fn(array $attributes) => [
            'document_type' => strtoupper($type),
            'file_name' => strtolower($type) . '_' . Str::random(6) . '.jpg',
            'alt_text' => ucfirst(str_replace('_', ' ', $type)),
            'file_path' => 'kyc/' . strtolower($type) . '_' . Str::random(6) . '.jpg',
        ]);
    }
}