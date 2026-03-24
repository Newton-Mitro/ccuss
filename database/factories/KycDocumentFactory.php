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
            'nid',
            'nid',
            'smart_nid',
            'passport',
            'driving_license',
            'birth_certificate',
            'utility_bill',
            'electricity_bill',
            'water_bill',
            'gas_bill',
            'bank_statement',
            'rental_agreement',
            'tin_certificate',
            'tax_return',
            'salary_slip',
            'income_certificate',
            'trade_license',
            'certificate_of_incorporation',
            'memorandum_of_association',
            'articles_of_association',
            'partnership_deed',
            'photo',
            'signature',
            'live_selfie',
            'pep_declaration',
            'fatca_form'
        ];

        $docType = fake()->randomElement($documentTypes);
        $fileName = strtolower($docType) . '_' . Str::random(6) . '.jpg';
        $filePath = 'kyc/' . $fileName;

        $verificationStatuses = ['pending', 'verified', 'rejected'];

        return [
            'document_type' => $docType,
            'file_name' => $fileName,
            'file_path' => $filePath,
            'mime' => 'image/jpeg',
            'alt_text' => ucfirst(str_replace('_', ' ', $docType)),
            'verification_status' => fake()->randomElement($verificationStatuses),
            'verified_by' => null,
            'verified_at' => null,
            'remarks' => fake()->optional()->sentence(),
        ];
    }

    /** Mark document as verified */
    public function verified(): self
    {
        return $this->state(fn(array $attributes) => [
            'verification_status' => 'verified',
            'verified_at' => now(),
        ]);
    }

    /** Mark document as rejected */
    public function rejected(): self
    {
        return $this->state(fn(array $attributes) => [
            'verification_status' => 'rejected',
            'verified_at' => now(),
        ]);
    }

    /** For specific document type, e.g., photo or signature */
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