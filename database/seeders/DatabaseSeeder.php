<?php

namespace Database\Seeders;

use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;
use Database\Seeders\FinancialServicesSeeder;
use Database\Seeders\FinancialProductAccountMappingSeeder;
use Database\Seeders\FinancialProductCatalogSeeder;
use Database\Seeders\FinancialProductPolicySeeder;
use Database\Seeders\PartySeeder;
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

        $user2 = User::firstOrCreate(
            ['email' => 'manager@email.com'],
            [
                'name' => 'Panna Manager',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        $user3 = User::firstOrCreate(
            ['email' => 'employee@email.com'],
            [
                'name' => 'CCCUL Employee',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        Model::withoutEvents(function () {
            $this->call([
                RoleSeeder::class,
                SystemAdministratorRolePermissionSeeder::class,
                DefaultRolePermissionSeeder::class,
                OrganizationStructureSeeder::class,
                GeneralAccountingSeeder::class,
                FinancialProductCatalogSeeder::class,
                FinancialProductPolicySeeder::class,
                FinancialProductAccountMappingSeeder::class,
                PartySeeder::class,
                CustomerSeeder::class,
                FinancialServicesSeeder::class,
                AccountDefaultRulesSeeder::class,
                TreasuryAndCashSeeder::class,
            ]);
        });

        $organization01 = Organization::query()
            ->where('code', 'ORG-001')
            ->firstOrFail();

        $organization02 = Organization::query()
            ->where('code', 'ORG-002')
            ->firstOrFail();

        $branch01 = $organization01->branches()
            ->oldest('id')
            ->firstOrFail();

        /*
        |--------------------------------------------------------------------------
        | Super Admin
        |--------------------------------------------------------------------------
        */
        $user->forceFill([
            'organization_id' => $organization01->id,
            'branch_id' => $branch01->id,
        ])->save();

        $user->organizations()->syncWithoutDetaching([
            $organization01->id,
            $organization02->id,
        ]);

        $user->branches()->syncWithoutDetaching([
            $branch01->id,
        ]);

        $role = Role::where('slug', 'system_administrator')->first();

        if ($role) {
            $user->roles()->sync([$role->id]);
        }

        /*
        |--------------------------------------------------------------------------
        | Manager
        |--------------------------------------------------------------------------
        */
        $user2->forceFill([
            'organization_id' => $organization01->id,
            'branch_id' => $branch01->id,
        ])->save();

        $user2->organizations()->syncWithoutDetaching([
            $organization01->id,
        ]);

        $user2->branches()->syncWithoutDetaching([
            $branch01->id,
        ]);

        /*
        |--------------------------------------------------------------------------
        | Employee
        |--------------------------------------------------------------------------
        */
        $user3->forceFill([
            'organization_id' => $organization01->id,
            'branch_id' => $branch01->id,
        ])->save();

        $user3->organizations()->syncWithoutDetaching([
            $organization01->id,
        ]);

        $user3->branches()->syncWithoutDetaching([
            $branch01->id,
        ]);

    }
}
