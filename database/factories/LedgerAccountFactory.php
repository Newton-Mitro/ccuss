<?php

namespace Database\Factories;

use App\GeneralAccounting\Models\LedgerAccount;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

class LedgerAccountFactory extends Factory
{
    protected $model = LedgerAccount::class;

    public function definition(): array
    {
        $types = ['asset', 'liability', 'equity', 'income', 'expense'];

        $isGroup = fake()->boolean(25); // 25% chance it's a group account
        $isControl = !$isGroup && fake()->boolean(30); // only leaf can be control

        $subledgerTypes = [
            'customer',
            'vendor',
            'employee',
            'bank',
            'loan',
            null,
        ];

        $subledgerType = !$isGroup && $isControl
            ? fake()->randomElement($subledgerTypes)
            : null;

        return [
            'organization_id' => Organization::factory(),

            'code' => fake()->unique()->numerify('1###'),
            'name' => ucfirst(fake()->words(2, true)) . ' Account',
            'type' => fake()->randomElement($types),
            'description' => fake()->optional()->sentence(),

            'is_control_account' => $isControl,
            'is_group' => $isGroup,
            'is_active' => true,

            'subledger_type' => $subledgerType,
            'subledger_sub_type' => $subledgerType
                ? fake()->word()
                : null,

            'parent_id' => null, // assign later if building hierarchy
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | States (clean & reusable)
    |--------------------------------------------------------------------------
    */

    public function group(): self
    {
        return $this->state(fn() => [
            'is_group' => true,
            'is_control_account' => false,
            'subledger_type' => null,
            'subledger_sub_type' => null,
        ]);
    }

    public function leaf(): self
    {
        return $this->state(fn() => [
            'is_group' => false,
        ]);
    }

    public function control(string $type = 'customer'): self
    {
        return $this->state(fn() => [
            'is_group' => false,
            'is_control_account' => true,
            'subledger_type' => $type,
            'subledger_sub_type' => fake()->word(),
        ]);
    }
}