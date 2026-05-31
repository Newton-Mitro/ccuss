<?php

namespace Database\Seeders;

use App\SystemAdministration\Models\Branch;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

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
        $organization = Organization::factory()->create([
            'code' => 'ORG001',
            'name' => 'Union Credit Union Society Ltd.',
            'short_name' => 'UCUSL',
        ]);

        // 2. Branches
        $branches = collect($this->dhakaBranches)->map(function ($branchName, $index) use ($organization) {
            return Branch::factory()->create([
                'organization_id' => $organization->id,
                'name' => $branchName,
                'code' => 'BR-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
            ]);
        });

        $this->command->info('✅ Organization with branches created.');

        $defaultUsers = [
            ['name' => 'Super Admin', 'email' => 'super.admin@email.com'],
        ];

        $mainBranch = $branches->first();

        // 3. Users
        foreach ($defaultUsers as $userData) {
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'organization_id' => $organization->id,
                    'branch_id' => $mainBranch->id,
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );
            // Assign role
            $roleModels = Role::where('slug', 'system_administrator')->first();

            if ($roleModels) {
                $user->roles()->sync([$roleModels->id]);
            }
        }

        $this->command->info('✅ Core admin users + teller accounts created.');
    }
}