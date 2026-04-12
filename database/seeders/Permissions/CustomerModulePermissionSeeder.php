<?php

namespace Database\Seeders\Permissions;

use Illuminate\Database\Seeder;
use App\SystemAdministration\Models\Permission;

class CustomerModulePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [

            // =========================
            // Customer
            // =========================
            $this->make('Customer', 'view', 'View Customers', 'View customer list'),
            $this->make('Customer', 'create', 'Create Customer', 'Create new customer'),
            $this->make('Customer', 'update', 'Update Customer', 'Edit customer'),
            $this->make('Customer', 'delete', 'Delete Customer', 'Delete customer', true),
            $this->make('Customer', 'search', 'Search Customers', 'Search customers'),

            // =========================
            // Customer Address
            // =========================
            $this->make('Customer Address', 'view', 'View Customer Addresses', 'View customer addresses'),
            $this->make('Customer Address', 'create', 'Create Customer Address', 'Add customer address'),
            $this->make('Customer Address', 'update', 'Update Customer Address', 'Edit customer address'),
            $this->make('Customer Address', 'delete', 'Delete Customer Address', 'Delete customer address', true),


            // =========================
            // Customer Family Relation
            // =========================
            $this->make('Customer Family Relation', 'view', 'View Family Relations', 'View family relations'),
            $this->make('Customer Family Relation', 'create', 'Create Family Relation', 'Add family relation'),
            $this->make('Customer Family Relation', 'update', 'Update Family Relation', 'Edit family relation'),
            $this->make('Customer Family Relation', 'delete', 'Delete Family Relation', 'Delete family relation', true),
            $this->make('Customer Family Relation', 'approve', 'Approve Customer Family Relation', 'Approve customer family relation', true),
            $this->make('Customer Family Relation', 'reject', 'Reject Customer Family Relation', 'Reject customer family relation', true),

            // =========================
            // Customer Introducer
            // =========================
            $this->make('Customer Introducer', 'view', 'View Introducers', 'View customer introducers'),
            $this->make('Customer Introducer', 'create', 'Create Introducer', 'Add introducer'),
            $this->make('Customer Introducer', 'update', 'Update Introducer', 'Edit introducer'),
            $this->make('Customer Introducer', 'delete', 'Delete Introducer', 'Delete introducer', true),
            $this->make('Customer Introducer', 'approve', 'Approve Customer Introducer', 'Approve customer introducer', true),
            $this->make('Customer Introducer', 'reject', 'Reject Customer Introducer', 'Reject customer introducer', true),

            // =========================
            // KYC Documents
            // =========================
            $this->make('Customer KYC Document', 'view', 'View KYC Documents', 'View KYC documents'),
            $this->make('Customer KYC Document', 'create', 'Upload KYC Document', 'Upload KYC document'),
            $this->make('Customer KYC Document', 'update', 'Update KYC Document', 'Update KYC document'),
            $this->make('Customer KYC Document', 'delete', 'Delete KYC Document', 'Delete KYC document', true),
            $this->make('Customer KYC Document', 'verify', 'Verify KYC Document', 'Verify KYC document', true),
            $this->make('Customer KYC Document', 'approve', 'Approve Customer KYC Document', 'Approve customer kyc document', true),
            $this->make('Customer KYC Document', 'reject', 'Reject Customer KYC Document', 'Reject customer kyc document', true),
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(
                ['slug' => $perm['slug']],
                $perm
            );
        }


        $this->command->info('✅ Customer module permissions created.');
    }

    private function make(
        string $module,
        string $action,
        string $name,
        string $description,
        bool $admin = false
    ): array {
        $slugModule = strtolower(str_replace(' ', '_', $module));

        return [
            'module' => $module,
            'name' => $name,
            'slug' => "{$slugModule}.{$action}",
            'action' => $action,
            'description' => $description,
            'for_admin' => $admin,
        ];
    }
}