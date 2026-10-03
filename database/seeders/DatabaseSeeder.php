<?php

namespace Database\Seeders;

use App\SystemAdministration\Models\Role;
use App\SystemAdministration\Models\Organization;
use App\SystemAdministration\Models\User;
use Database\Seeders\FinancialServicesSeeder;
use Database\Seeders\OpeningBalanceVoucherSeeder;
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

        Model::withoutEvents(function () {
            $this->call([
                RoleSeeder::class,
                SystemAdministratorRolePermissionSeeder::class,
                DefaultRolePermissionSeeder::class,
                OrganizationStructureSeeder::class,
                GeneralAccountingSeeder::class,
                PartySeeder::class,
                CustomerSeeder::class,
                FinancialServicesSeeder::class,
                OpeningBalanceVoucherSeeder::class,
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

        $user->forceFill([
            'organization_id' => $organization01->id,
            'branch_id' => $organization01->branches()->oldest('id')->value('id'),
        ])->save();

        $user->organizations()->syncWithoutDetaching([$organization01->id]);
        $user->organizations()->syncWithoutDetaching([$organization02->id]);
        $user->branches()->syncWithoutDetaching([$user->branch_id]);

        // Assign role
        $roleModels = Role::where('slug', 'system_administrator')->first();

        if ($roleModels) {
            $user->roles()->sync([$roleModels->id]);
        }

    }
}
