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
            'national_identification_number',
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
            'fatca_form',
        ]);

        $status = fake()->randomElement([
            'pending',
            'verified',
            'rejected',
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

            'verified_at' => $status === 'verified'
                ? fake()->dateTimeBetween('-1 year', 'now')
                : null,

            'remarks' => $status === 'rejected'
                ? fake()->sentence()
                : null,
        ];
    }

    public function verified(): static
    {
        return $this->state(fn() => [
            'verification_status' => 'verified',
            'verified_at' => now(),
            'remarks' => null,
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn() => [
            'verification_status' => 'pending',
            'verified_at' => null,
            'remarks' => null,
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn() => [
            'verification_status' => 'rejected',
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
        return $this->type('photo');
    }

    public function signature(): static
    {
        return $this->type('signature');
    }

    public function selfie(): static
    {
        return $this->type('live_selfie');
    }

    public function passport(): static
    {
        return $this->type('passport');
    }

    public function nid(): static
    {
        return $this->type('national_identification_number');
    }
}