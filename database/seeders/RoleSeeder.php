<?php

namespace Database\Seeders;

use App\SystemAdministration\Models\Role;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // ----------------------------
        // Roles
        // ----------------------------
        $roles = [
            'system_administrator' => 'System Administrator',
            'ceo_general_manager' => 'CEO / General Manager',
            'finance_manager' => 'Finance Manager',
            'branch_manager' => 'Branch Manager',
            'assistant_branch_manager' => 'Assistant Branch Manager',
            'accounts_officer' => 'Accounts Officer',
            'internal_auditor' => 'Internal Auditor',
            'member_service_officer' => 'Member Service Officer',
            'teller' => 'Teller',
            'senior_teller' => 'Senior Teller',
            'vault_officer' => 'Vault Officer',
            'loan_officer' => 'Loan Officer',
            'credit_loan_manager' => 'Credit / Loan Manager',
            'recovery_officer' => 'Recovery Officer',
            'deposit_officer' => 'Deposit Officer',
            'hr_payroll_officer' => 'HR & Payroll Officer',
            'compliance_officer' => 'Compliance Officer',
            'report_officer' => 'Report Officer',
            'it_support_officer' => 'IT Support Officer',
        ];

        foreach ($roles as $slug => $name) {
            $role = Role::firstOrCreate(
                ['slug' => $slug],
                [
                    'name' => $name,
                    'description' => "{$name} role",
                    'preset' => true,
                ]
            );

            if (!$role->preset) {
                $role->forceFill(['preset' => true])->save();
            }
        }

        $systemAdministrator = Role::query()
            ->where('slug', 'system_administrator')
            ->firstOrFail();
        $redundantRole = Role::withTrashed()
            ->where('slug', 'super_administrator')
            ->first();

        if ($redundantRole && !$redundantRole->trashed()) {
            foreach ($redundantRole->users()->get() as $user) {
                $user->roles()->syncWithoutDetaching([$systemAdministrator->id]);
            }

            $redundantRole->users()->detach();
            $redundantRole->permissions()->detach();
            $redundantRole->delete();
        }

        $this->command->info("✅ Roles created");
    }
}
