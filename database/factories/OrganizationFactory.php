<?php

namespace Database\Factories;

use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class OrganizationFactory extends Factory
{
    protected $model = Organization::class;

    public function definition(): array
    {
        $name = fake()->company();

        return [
            'code' => strtoupper(Str::random(6)),
            'name' => $name,
            'short_name' => Str::limit($name, 20),
            'registration_no' => fake()->bothify('REG-#####'),
            'tax_id' => fake()->bothify('TAX-#####'),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->companyEmail(),
            'website' => fake()->url(),
            'address_line1' => fake()->streetAddress(),
            'address_line2' => fake()->secondaryAddress(),
            'city' => fake()->city(),
            'state' => fake()->state(),
            'postal_code' => fake()->postcode(),
            'country' => fake()->country(),
            'logo_path' => null,
            'report_header_line1' => $name,
            'report_header_line2' => 'Financial Services',
            'report_footer' => 'This is a system generated report.',
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}