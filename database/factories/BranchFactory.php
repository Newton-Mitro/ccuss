<?php

namespace Database\Factories;

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BranchFactory extends Factory
{
    protected $model = Branch::class;

    private array $dhakaBranches = [
        'Dhaka Main Branch',
        'Gulshan Branch',
        'Uttara Branch',
        'Mirpur Branch',
        'Dhanmondi Branch',
        'Mohammadpur Branch',
        'Savar Branch',
        'Keraniganj Branch',
        'Gazipur Branch',
        'Tongi Branch',
        'Narayanganj Branch',
        'Rupganj Branch',
        'Narsingdi Branch',
        'Manikganj Branch',
        'Tangail Branch',
        'Kishoreganj Branch',
        'Faridpur Branch',
        'Gopalganj Branch',
        'Madaripur Branch',
        'Rajbari Branch',
        'Shariatpur Branch',
    ];

    public function definition(): array
    {
        $name = $this->faker->unique()->randomElement($this->dhakaBranches);

        return [
            'code' => strtoupper($this->faker->unique()->bothify('DHK###')),
            'name' => $name,
            'address' => $this->faker->streetAddress . ', ' . $name,
            'latitude' => $this->faker->latitude(23.4, 24.5),
            'longitude' => $this->faker->longitude(89.5, 91.5),
            'manager_id' => User::query()->inRandomOrder()->value('id'),
        ];
    }
}
