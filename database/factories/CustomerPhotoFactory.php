<?php

namespace Database\Factories;

use App\CostomerMgmt\Models\Customer;
use App\CostomerMgmt\Models\CustomerPhoto;
use Illuminate\Database\Eloquent\Factories\Factory;

class CustomerPhotoFactory extends Factory
{
    protected $model = CustomerPhoto::class;

    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'file_name' => $this->faker->uuid() . '.jpg',
            'file_path' => 'customers/photos/' . $this->faker->uuid() . '.jpg',
            'mime' => 'image/jpeg',
            'alt_text' => 'Customer Photo',
        ];
    }
}
