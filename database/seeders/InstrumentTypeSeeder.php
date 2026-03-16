<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\FinanceAndAccounting\Models\InstrumentType;
use App\SystemAdministration\Models\Organization;

class InstrumentTypeSeeder extends Seeder
{
    public function run(): void
    {
        // Get an organization (or create a default one)
        $organization = Organization::first() ?? Organization::factory()->create();

        $types = [
            ['code' => 'CASH', 'name' => 'Cash'],
            ['code' => 'CHEQUE', 'name' => 'Cheque'],
            ['code' => 'BANK_TRANSFER', 'name' => 'Bank Transfer'],
            ['code' => 'MOBILE_BANKING', 'name' => 'Mobile Banking'],
            ['code' => 'CARD', 'name' => 'Card'],
        ];

        foreach ($types as $type) {
            InstrumentType::updateOrCreate(
                ['code' => $type['code'], 'organization_id' => $organization->id],
                ['name' => $type['name']]
            );
        }

        $this->command->info("✅ Instrument Types seeded for organization ID {$organization->id}");
    }
}