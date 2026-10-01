<?php

namespace Database\Seeders;

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use Illuminate\Database\Seeder;

class OrganizationStructureSeeder extends Seeder
{
    private array $dhakaBranches = [
        'Main Branch',
        'Branch Office-1',
        'Branch Office-2',
        'Branch Office-3',
        'Branch Office-4',
        'Branch Office-5',
    ];

    public function run(): void
    {
        // 1. Organization
        $organization = Organization::query()->firstOrCreate(
            ['code' => 'ORG-001'],
            [
                'name' => 'Unity Credit Union Society Ltd.',
                'short_name' => 'UCUSL',
            ],
        );

        // 2. Branches
        $branches = collect($this->dhakaBranches)->map(function ($branchName, $index) use ($organization) {
            return Branch::query()->firstOrCreate(
                ['code' => 'BR-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT)],
                [
                    'organization_id' => $organization->id,
                    'name' => $branchName,
                ],
            );
        });

        Organization::query()->firstOrCreate(
            ['code' => 'ORG-002'],
            [
                'name' => 'Gopalganj Credit Union Society Ltd.',
                'short_name' => 'GCUSL',
            ],
        );

        $this->command->info('✅ Organization with branches created.');
    }
}