<?php

namespace Database\Seeders;

use App\TreasuryAndCashModule\Models\Denomination;
use Illuminate\Database\Seeder;

class DenominationSeeder extends Seeder
{
    public function run(): void
    {
        $denominations = [
            // Coins
            ['value' => 1, 'type' => 'coin'],
            ['value' => 2, 'type' => 'coin'],
            ['value' => 5, 'type' => 'coin'],

            // Notes
            ['value' => 1, 'type' => 'note'],
            ['value' => 2, 'type' => 'note'],
            ['value' => 5, 'type' => 'note'],
            ['value' => 10, 'type' => 'note'],
            ['value' => 20, 'type' => 'note'],
            ['value' => 50, 'type' => 'note'],
            ['value' => 100, 'type' => 'note'],
            ['value' => 200, 'type' => 'note'],
            ['value' => 500, 'type' => 'note'],
            ['value' => 1000, 'type' => 'note'],
        ];

        foreach ($denominations as $item) {
            Denomination::updateOrCreate(
                [
                    'value' => $item['value'],
                    'type' => $item['type'],
                ],
                [
                    'is_active' => true,
                ]
            );
        }
    }
}