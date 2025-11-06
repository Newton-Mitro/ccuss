<?php

namespace Database\Factories;

use App\CostomerManagement\Customer\Models\Customer;
use App\Media\Models\Media;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    public function definition(): array
    {
        $type = $this->faker->randomElement(['Individual', 'Organization']);
        $photo = Media::inRandomOrder()->first() ?? Media::factory()->create();

        return [
            'customer_no' => strtoupper(Str::random(3)) . '-' . $this->faker->unique()->numberBetween(10000, 99999),
            'type' => $type,
            'name' => $type === 'Individual'
                ? $this->faker->name()
                : $this->faker->company(),
            'phone' => $this->faker->optional()->phoneNumber(),
            'email' => $this->faker->optional()->safeEmail(),
            'kyc_level' => $this->faker->randomElement(['MIN', 'STD', 'ENH']),
            'status' => $this->faker->randomElement(['PENDING', 'ACTIVE', 'SUSPENDED', 'CLOSED']),

            'dob' => $type === 'Individual' ? $this->faker->date('Y-m-d', '-20 years') : null,
            'gender' => $type === 'Individual'
                ? $this->faker->randomElement(['MALE', 'FEMALE', 'OTHER'])
                : null,
            'religion' => $type === 'Individual'
                ? $this->faker->randomElement(['CHRISTIANITY', 'ISLAM', 'HINDUISM', 'BUDDHISM', 'OTHER'])
                : null,

            'identification_type' => $this->faker->randomElement(['NID', 'NBR', 'PASSPORT', 'DRIVING_LICENSE']),
            'identification_number' => strtoupper(Str::random(10)),
            'photo_id' => $photo->id,
            'registration_no' => $type === 'Organization'
                ? strtoupper('REG-' . $this->faker->numberBetween(1000, 9999))
                : null,
        ];
    }
}
