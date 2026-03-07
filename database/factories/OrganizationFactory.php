<?php

namespace Database\Factories;

use App\Branch\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class OrganizationFactory extends Factory
{
    protected $model = Organization::class;

    public function definition(): array
    {
        $name = $this->faker->company();

        return [
            'code' => strtoupper(Str::random(6)),
            'name' => $name,
            'short_name' => Str::limit($name, 20),
            'registration_no' => $this->faker->bothify('REG-#####'),
            'tax_id' => $this->faker->bothify('TAX-#####'),
            'phone' => $this->faker->phoneNumber(),
            'email' => $this->faker->companyEmail(),
            'website' => $this->faker->url(),
            'address_line1' => $this->faker->streetAddress(),
            'address_line2' => $this->faker->secondaryAddress(),
            'city' => $this->faker->city(),
            'state' => $this->faker->state(),
            'postal_code' => $this->faker->postcode(),
            'country' => $this->faker->country(),
            'logo_path' => null,
            'report_header_line1' => $name,
            'report_header_line2' => 'Financial Services',
            'report_footer' => 'This is a system generated report.',
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}