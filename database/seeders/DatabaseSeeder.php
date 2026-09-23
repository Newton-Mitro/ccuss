<?php

namespace Database\Seeders;

use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;
use Database\Seeders\FinancialServicesSeeder;
use Database\Seeders\SystemAdministratorRolePermissionSeeder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {

        $user = User::firstOrCreate(
            ['email' => 'super.admin@email.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        Model::withoutEvents(function () {
            $this->call([
                RoleSeeder::class,
                SystemAdministratorRolePermissionSeeder::class,
                OrganizationStructureSeeder::class,
                GeneralAccountingSeeder::class,
                CustomerSeeder::class,
                FinancialServicesSeeder::class,
                TreasuryAndCashSeeder::class,
            ]);
        });

        $organization = Organization::query()
            ->where('code', 'ORG-001')
            ->firstOrFail();

        $user->forceFill([
            'organization_id' => $organization->id,
            'branch_id' => $organization->branches()->oldest('id')->value('id'),
        ])->save();

        $user->organizations()->syncWithoutDetaching([$organization->id]);
        $user->branches()->syncWithoutDetaching([$user->branch_id]);

        // Assign role
        $roleModels = Role::where('slug', 'system_administrator')->first();

        if ($roleModels) {
            $user->roles()->sync([$roleModels->id]);
        }

    }
}
