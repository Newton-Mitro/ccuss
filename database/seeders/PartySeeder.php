<?php

namespace Database\Seeders;

use App\GeneralAccounting\Models\Party;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Seeder;

class PartySeeder extends Seeder
{
    public function run(): void
    {
        $organization = Organization::query()
            ->where('code', 'ORG-001')
            ->firstOrFail();

        foreach ([
            [
                'code' => 'PARTY-CUST-001',
                'name' => 'Sample Member Customer',
                'party_type' => 'CUSTOMER',
            ],
            [
                'code' => 'PARTY-SUP-001',
                'name' => 'Office Supplies Supplier',
                'party_type' => 'SUPPLIER',
                'email' => 'purchasing@example.test',
            ],
            [
                'code' => 'PARTY-EMP-001',
                'name' => 'Sample Accounting Employee',
                'party_type' => 'EMPLOYEE',
            ],
        ] as $party) {
            Party::query()->updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'code' => $party['code'],
                ],
                [
                    'name' => $party['name'],
                    'party_type' => $party['party_type'],
                    'email' => $party['email'] ?? null,
                    'status' => true,
                ],
            );
        }

        $this->command?->info('Accounting parties seeded.');
    }
}