<?php

namespace Database\Factories;

use App\CustomerModule\Models\Customer;
use App\CustomerModule\Models\KycDocument;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class KycDocumentFactory extends Factory
{
    protected $model = KycDocument::class;

    public function definition(): array
    {
        $documentType = fake()->randomElement([
            'NATIONAL_IDENTIFICATION_NUMBER',
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
            'FATCA_FORM',
        ]);

        $status = fake()->randomElement([
            'PENDING',
            'VERIFIED',
            'REJECTED',
        ]);

        $extension = fake()->randomElement([
            'jpg',
            'jpeg',
            'png',
            'pdf',
        ]);

        $fileName = "{$documentType}_" . Str::lower(Str::random(8)) . ".{$extension}";

        return [
            'customer_id' => Customer::factory(),

            'document_type' => $documentType,

            'file_name' => $fileName,
            'file_path' => "kyc/{$fileName}",
            'mime' => match ($extension) {
                'pdf' => 'application/pdf',
                'png' => 'image/png',
                'jpeg' => 'image/jpeg',
                default => 'image/jpeg',
            },

            'alt_text' => ucwords(str_replace('_', ' ', $documentType)),

            'verification_status' => $status,

            'verified_at' => $status === 'VERIFIED'
                ? fake()->dateTimeBetween('-1 year', 'now')
                : null,

            'remarks' => $status === 'REJECTED'
                ? fake()->sentence()
                : null,
        ];
    }

    public function verified(): static
    {
        return $this->state(fn() => [
            'verification_status' => 'VERIFIED',
            'verified_at' => now(),
            'remarks' => null,
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn() => [
            'verification_status' => 'PENDING',
            'verified_at' => null,
            'remarks' => null,
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn() => [
            'verification_status' => 'REJECTED',
            'verified_at' => null,
            'remarks' => fake()->sentence(),
        ]);
    }

    public function type(string $type): static
    {
        $extension = fake()->randomElement([
            'jpg',
            'jpeg',
            'png',
            'pdf',
        ]);

        $fileName = "{$type}_" . Str::lower(Str::random(8)) . ".{$extension}";

        return $this->state(fn() => [
            'document_type' => $type,
            'file_name' => $fileName,
            'file_path' => "kyc/{$fileName}",
            'mime' => match ($extension) {
                'pdf' => 'application/pdf',
                'png' => 'image/png',
                'jpeg' => 'image/jpeg',
                default => 'image/jpeg',
            },
            'alt_text' => ucwords(str_replace('_', ' ', $type)),
        ]);
    }

    public function photo(): static
    {
        return $this->type('PHOTO');
    }

    public function signature(): static
    {
        return $this->type('SIGNATURE');
    }

    public function selfie(): static
    {
        return $this->type('LIVE_SELFIE');
    }

    public function passport(): static
    {
        return $this->type('passport');
    }

    public function nid(): static
    {
        return $this->type('NATIONAL_IDENTIFICATION_NUMBER');
    }
}