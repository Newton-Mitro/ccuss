<?php
namespace Database\Factories;

use App\Models\TransactionType;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class TransactionTypeFactory extends Factory
{
    protected $model = TransactionType::class;

    public function definition(): array
    {
        $name = $this->faker->unique()->word();

        return [
            'code' => Str::slug($name),
            'name' => ucfirst($name),
            'category' => $this->faker->randomElement([
                'cash',
                'loan',
                'deposit',
                'vendor',
                'fee',
                'system'
            ]),
            'is_cash' => $this->faker->boolean(),
            'affects_balance' => true,
            'requires_approval' => $this->faker->boolean(20),
            'is_system' => false,
            'direction' => $this->faker->randomElement(['inflow', 'outflow', 'both']),
            'meta' => null,
        ];
    }
}