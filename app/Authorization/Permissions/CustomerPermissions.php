<?php

namespace App\Authorization\Permissions;

use App\Authorization\PermissionDefinition;

final class CustomerPermissions
{
    public static function definitions(): array
    {
        return [
            new PermissionDefinition(
                module: 'customer',
                name: 'View Customers',
                slug: 'customer.view',
                action: 'view',
                description: 'View customer records',
            ),

            new PermissionDefinition(
                module: 'customer',
                name: 'Create Customer',
                slug: 'customer.create',
                action: 'create',
                description: 'Create new customer records',
            ),

            new PermissionDefinition(
                module: 'customer',
                name: 'Update Customer',
                slug: 'customer.update',
                action: 'update',
                description: 'Update customer records',
            ),

            new PermissionDefinition(
                module: 'customer',
                name: 'Delete Customer',
                slug: 'customer.delete',
                action: 'delete',
                description: 'Delete customer records',
            ),

            new PermissionDefinition(
                module: 'customer',
                name: 'Search Customers',
                slug: 'customer.search',
                action: 'search',
                description: 'Search customer records',
            ),

            new PermissionDefinition(
                module: 'customer_address',
                name: 'View Customer Addresses',
                slug: 'customer_address.view',
                action: 'view',
                description: 'View customer addresses',
            ),

            new PermissionDefinition(
                module: 'customer_address',
                name: 'Create Customer Address',
                slug: 'customer_address.create',
                action: 'create',
                description: 'Create customer addresses',
            ),

            new PermissionDefinition(
                module: 'customer_address',
                name: 'Update Customer Address',
                slug: 'customer_address.update',
                action: 'update',
                description: 'Update customer addresses',
            ),

            new PermissionDefinition(
                module: 'customer_address',
                name: 'Delete Customer Address',
                slug: 'customer_address.delete',
                action: 'delete',
                description: 'Delete customer addresses',
            ),

            new PermissionDefinition(
                module: 'customer_address',
                name: 'Approve Customer Address',
                slug: 'customer_address.approve',
                action: 'approve',
                description: 'Approve customer addresses',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'customer_address',
                name: 'Reject Customer Address',
                slug: 'customer_address.reject',
                action: 'reject',
                description: 'Reject customer addresses',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'customer_family_relation',
                name: 'View Family Relations',
                slug: 'customer_family_relation.view',
                action: 'view',
                description: 'View customer family relations',
            ),

            new PermissionDefinition(
                module: 'customer_family_relation',
                name: 'Create Family Relation',
                slug: 'customer_family_relation.create',
                action: 'create',
                description: 'Create customer family relations',
            ),

            new PermissionDefinition(
                module: 'customer_family_relation',
                name: 'Update Family Relation',
                slug: 'customer_family_relation.update',
                action: 'update',
                description: 'Update customer family relations',
            ),

            new PermissionDefinition(
                module: 'customer_family_relation',
                name: 'Delete Family Relation',
                slug: 'customer_family_relation.delete',
                action: 'delete',
                description: 'Delete customer family relations',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'customer_family_relation',
                name: 'Approve Family Relation',
                slug: 'customer_family_relation.approve',
                action: 'approve',
                description: 'Approve customer family relations',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'customer_family_relation',
                name: 'Reject Family Relation',
                slug: 'customer_family_relation.reject',
                action: 'reject',
                description: 'Reject customer family relations',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'customer_introducer',
                name: 'View Introducers',
                slug: 'customer_introducer.view',
                action: 'view',
                description: 'View customer introducers',
            ),

            new PermissionDefinition(
                module: 'customer_introducer',
                name: 'Create Introducer',
                slug: 'customer_introducer.create',
                action: 'create',
                description: 'Create customer introducers',
            ),

            new PermissionDefinition(
                module: 'customer_introducer',
                name: 'Update Introducer',
                slug: 'customer_introducer.update',
                action: 'update',
                description: 'Update customer introducers',
            ),

            new PermissionDefinition(
                module: 'customer_introducer',
                name: 'Delete Introducer',
                slug: 'customer_introducer.delete',
                action: 'delete',
                description: 'Delete customer introducers',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'customer_introducer',
                name: 'Approve Introducer',
                slug: 'customer_introducer.approve',
                action: 'approve',
                description: 'Approve customer introducers',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'customer_introducer',
                name: 'Reject Introducer',
                slug: 'customer_introducer.reject',
                action: 'reject',
                description: 'Reject customer introducers',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'customer_kyc_document',
                name: 'View KYC Documents',
                slug: 'customer_kyc_document.view',
                action: 'view',
                description: 'View customer KYC documents',
            ),

            new PermissionDefinition(
                module: 'customer_kyc_document',
                name: 'Create KYC Document',
                slug: 'customer_kyc_document.create',
                action: 'create',
                description: 'Upload customer KYC documents',
            ),

            new PermissionDefinition(
                module: 'customer_kyc_document',
                name: 'Update KYC Document',
                slug: 'customer_kyc_document.update',
                action: 'update',
                description: 'Update customer KYC documents',
            ),

            new PermissionDefinition(
                module: 'customer_kyc_document',
                name: 'Delete KYC Document',
                slug: 'customer_kyc_document.delete',
                action: 'delete',
                description: 'Delete customer KYC documents',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'customer_kyc_document',
                name: 'Approve KYC Document',
                slug: 'customer_kyc_document.approve',
                action: 'approve',
                description: 'Approve customer KYC documents',
                forAdmin: true,
            ),

            new PermissionDefinition(
                module: 'customer_kyc_document',
                name: 'Reject KYC Document',
                slug: 'customer_kyc_document.reject',
                action: 'reject',
                description: 'Reject customer KYC documents',
                forAdmin: true,
            ),
        ];
    }
}