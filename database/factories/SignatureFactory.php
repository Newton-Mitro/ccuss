<?php

namespace Database\Factories;

use App\CostomerManagement\Customer\Models\Customer;
use App\CostomerManagement\Signature\Models\Signature;
use App\Media\Models\Media;
use Illuminate\Database\Eloquent\Factories\Factory;

class SignatureFactory extends Factory
{
    protected $model = Signature::class;

    public function definition(): array
    {
        return [
            'customer_id' => Customer::inRandomOrder()->value('id') ?? Customer::factory(),
            'signature_id' => Media::inRandomOrder()->value('id') ?? Media::factory(),
        ];
    }
}
