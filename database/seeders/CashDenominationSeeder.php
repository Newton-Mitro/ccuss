<?php

namespace Database\Seeders;

use App\SystemAdministration\Models\Organization;
use App\TreasuryAndCash\Models\CashDenomination;
use Illuminate\Database\Seeder;

class CashDenominationSeeder extends Seeder
{
    public function run(): void
    {
        Organization::query()
            ->each(fn (Organization $organization) => CashDenomination::seedBangladeshPreset($organization->id));
    }
}
