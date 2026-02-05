<?php

namespace Database\Factories;

use App\CostomerMgmt\Models\Customer;
use App\CostomerMgmt\Models\CustomerSignature;
use Illuminate\Database\Eloquent\Factories\Factory;

class CustomerSignatureFactory extends Factory
{
    protected $model = CustomerSignature::class;

    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'file_name' => $this->faker->uuid() . '.png',
            'file_path' => 'customers/signatures/' . $this->faker->uuid() . '.png',
            'mime' => 'image/png',
            'alt_text' => 'Customer Signature',
        ];
    }
}
